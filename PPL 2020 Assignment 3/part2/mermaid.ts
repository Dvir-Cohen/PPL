
import { isPrimOp, CExp,  VarDecl, Parsed, DefineExp, parseL4, parseL4Exp, isSetExp,Binding, isLetrecExp} from './L4-ast';
import { map, unnest } from "ramda";
import { Sexp } from "s-expression";
import { isArray, isString, isBoolean, isNumber } from "../shared/type-predicates";
import { parse as p } from "../shared/parser";
import { Result, makeOk, makeFailure, bind, isOk } from "../shared/result";
import { SExpValue,isSymbolSExp, isEmptySExp, isCompoundSExp, CompoundSExp } from './L4-value';
import { AtomicExp, isBoolExp,  isNumExp, isStrExp, isVarRef, isDefineExp, isCompoundExp
    , isAtomicExp, isProgram, Exp,  CompoundExp, isAppExp, isIfExp, isProcExp, isLetExp,isVarDecl, AppExp,  isLitExp, isExp , Program} from './L4-ast';
import {makeEdgeLabel,makeAtomicGraph,makeEdge,makeCompoundGraph,makeGraph,makeNodeDecl,makeNodeRef,makeTD,Graph,GraphContent
        ,isAtomicGraph,Edge,EdgeLabel, CompoundGraph,Header,Node,isNodeDecl,AtomicGraph} from './mermaid-ast'
/***********************************************************************************************************/

export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
    isVarRef(exp)&& exp.var === ""? makeFailure("No Exp!!"):
    isProgram(exp) && exp.exps.length === 0? makeFailure("No Program"):
    makeOk(makeGraph(makeTD(),(parseGraph(exp))))
    
export const parseGraph =(exp: Parsed) : GraphContent=>
    isAtomicExp(exp)? makeAtomicGraph(makeNodeDecl(MyVarGen(exp),MyLabel(exp))):      
    isDefineExp(exp)?  makeCompoundGraph(parseDefine(exp, MyVarGen(exp), MyVarGen(exp.val))):
    isCompoundExp(exp) || isLetrecExp(exp)? makeCompoundGraph(parseCompound(exp,undefined)):
    isProgram(exp)? makeCompoundGraph(parseProgram(exp,MyVarGen(exp.exps))):
    makeAtomicGraph(makeNodeDecl(exp, "trying"));

export const parseProgram = (exp: Program, id:string ): Edge[] =>
    [makeEdge(createNode(exp,MyVarGen(exp),true),(makeNodeDecl( id,MyLabel(exp.exps) )), makeEdgeLabel("|exps|"))]
               .concat(ParseArr(exp.exps,id));



export const parse =(exp: Parsed|CExp[]|any, id: string| undefined) : Edge[] =>
    
    isDefineExp(exp)?  (parseDefine(<DefineExp>exp, id === undefined? MyVarGen(exp): id, MyVarGen(exp.val))):
    isCompoundExp(exp)? (parseCompound(exp, id)):
    isLitExp(exp)?parseCompound(exp,id):
    isCompoundSExp(exp)? parseCompound ( exp, id === undefined? MyVarGen(exp): id):
    [];
    
export const parseCompound = (exp:CompoundExp| CompoundSExp , id:string | undefined ): Edge[] =>
    isAppExp(exp)?  ParseEdge(exp, id===undefined? MyVarGen(exp): id,MyVarGen("rands"),MyVarGen(exp.rator),"", id === undefined): 
    isIfExp(exp)?   ParseEdge(exp, id === undefined? MyVarGen(exp):id,MyVarGen(exp.test),MyVarGen(exp.then),MyVarGen(exp.alt), id === undefined): 
    isProcExp(exp)? ParseEdge(exp,id===undefined?MyVarGen(exp): id,MyVarGen("params"),MyVarGen("body"),"", id === undefined) :
    isLitExp(exp)?  ParseEdge(exp,id===undefined?MyVarGen(exp): id,MyVarGen(exp.val),"","", id === undefined) :
    isLetExp(exp) || isLetrecExp(exp)?  ParseEdge(exp,id===undefined?MyVarGen(exp): id,MyVarGen("bindings"),MyVarGen("binding"),MyVarGen("body"), id === undefined) :
    isSetExp(exp)?  ParseEdge(exp,id===undefined?MyVarGen(exp): id,MyVarGen("val"),MyVarGen("var"),"", id === undefined) :
    isCompoundSExp(exp)? ParseEdge(exp,id===undefined?MyVarGen(exp): id,MyVarGen(exp.val1),MyVarGen(exp.val2),"", id === undefined) :
    [];

export const parseDefine = (exp:DefineExp, id:string, id1: string): Edge[] =>
        [makeEdge(makeNodeDecl(id,MyLabel(exp)),makeNodeDecl(MyVarGen(exp.var),MyLabel(exp.var)) ,makeEdgeLabel("|var|")),
        makeEdge(makeNodeRef (id), makeNodeDecl(id1,MyLabel(exp.val)),makeEdgeLabel("|val|"))].concat(parse(exp.val,id1));
 

export const ParseEdge = (exp: CompoundExp| CompoundSExp  ,id0:string,id1:string, id2:string, id3:string, isNewNode:boolean):Edge[]=>
    isAppExp(exp)?  [makeEdge(createNode(exp,id0,isNewNode),createNode(exp.rator,id2,true), makeEdgeLabel("|Rator|")),
                    makeEdge (createNode(exp ,id0,false), createNode(exp.rands,id1,true),   makeEdgeLabel("|Rands|"))]
                        .concat(parse(exp.rator,id2)).concat(ParseArr(exp.rands,id1)):
    isProcExp(exp)? [makeEdge(createNode ( exp,id0,isNewNode),createNode(exp.args, id1,true), makeEdgeLabel("|args|")),
                    makeEdge (createNode(exp,id0, false), createNode(exp.body,id2,true), makeEdgeLabel("|body|"))]
                        .concat(ParseArr(exp.args, id1)).concat(ParseArr( exp.body.slice(0), id2)):
    isIfExp(exp)?   [makeEdge(createNode ( exp ,id0,isNewNode),createNode(exp.test ,id1,true), makeEdgeLabel("|test|")),
                    makeEdge (createNode ( exp ,id0,false), createNode (exp.then,id2,true), makeEdgeLabel("|then|")),
                    makeEdge (createNode ( exp ,id0,false), createNode(exp.alt,id3,true), makeEdgeLabel("|alt|"))]
                        .concat(parse(exp.test, id1 )).concat(parse(exp.then, id2)).concat(parse(exp.alt, id3)):
    isLitExp(exp)? [makeEdge(createNode ( exp ,id0,isNewNode),createNode(exp.val,id1,true), makeEdgeLabel("|val|"))].concat(parse(exp.val,id1)):
    isCompoundSExp(exp)?[makeEdge(createNode(exp,id0,isNewNode),createNode(exp.val1,id1,true), makeEdgeLabel("|val1|")),
                    makeEdge(createNode ( exp ,id0,false),createNode(exp.val2,id2,true), makeEdgeLabel("|val2|"))]
                        .concat( parse(exp.val1,id1)).concat( parse(exp.val2,id2)):
    isLetrecExp(exp) || isLetExp(exp)?[makeEdge(createNode ( exp,id0,isNewNode),createNode("bindings", id1,true), makeEdgeLabel("|bindings|")),
        makeEdge (createNode(exp,id0, false), createNode("body",id3,true), makeEdgeLabel("|body|"))]
        .concat(ParseBindingArr(exp.bindings, id1)).
        concat(ParseArr( exp.body.slice(0), id3)):
 
    isSetExp(exp)? [makeEdge(createNode ( exp ,id0,isNewNode),createNode(exp.val,id1,true), makeEdgeLabel("|val|")),
        makeEdge(createNode ( exp ,id0,isNewNode),createNode(exp.var,id2,true), makeEdgeLabel("|var|"))]:
        [];


export const createNode = (exp:Parsed |CompoundExp| CompoundSExp |AtomicExp|CExp[]|VarDecl[]|SExpValue| Binding[] ,id:string, isNewNode:boolean): Node =>
    isNewNode? makeNodeDecl( id,MyLabel(exp)) :
        makeNodeRef(id);


export const ParseArr = (arr:(CExp| VarDecl|Sexp| Exp)[],nodeId:string ):Edge[]=>
        unnest(arr.map (x => 
        isCompoundExp(x)? 
        ParseArrHelper([makeEdge(makeNodeRef(nodeId),(parseCompound(x,undefined))[0].from,makeEdgeLabel(undefined))],x ):
        isDefineExp(x)?
        ParseArrHelper([makeEdge(makeNodeRef(nodeId),(parseDefine(x, MyVarGen(x), MyVarGen(x.val)))[0].from,makeEdgeLabel(undefined))],x ):
        [makeEdge(makeNodeRef(nodeId),makeNodeDecl(MyVarGen(x),MyLabel(x)),makeEdgeLabel(undefined))]));

export const ParseBindingArr = (arr:(Binding)[],nodeId:string ):Edge[]=>{
            return unnest(arr.map (x => {
                const val_id = MyVarGen (x.val);
                const x_id = MyVarGen("binding");
                return [makeEdge(makeNodeRef(nodeId),makeNodeDecl(x_id,MyLabel("binding")),makeEdgeLabel("")),
                    makeEdge(makeNodeRef(x_id),makeNodeDecl(MyVarGen(x.var),MyLabel(x.var)),makeEdgeLabel("|var|")),
                    makeEdge(makeNodeRef(x_id),makeNodeDecl(val_id,MyLabel(x.val)),makeEdgeLabel("|val|"))]
                    .concat(parse(x.var, MyVarGen(x.var) ).concat(parse(x.val,val_id)))}));}


export const ParseArrHelper = (x:Edge[], y :CExp|Sexp|Parsed):Edge[]=>
    x.concat(parse(y,x[0].to.id));
     
   
/********************************************************************************************************** */

export const MyLabel = (x:any):string=> 
        isArray(x)? (`[:]`):
        isBoolExp(x)? (`["BoolExp(${x.val? "#t": "#f"})"]`):
        isBoolean(x)? (`["boolean(${x? "#t": "#f"})"]`):
        isNumber(x)? (`["number(${x})"]`):
        isNumExp(x) ? (`["NumExp(${x.val})"]`):
        isDefineExp(x)? (`["DefineExp"]`):
        isPrimOp(x)? (`["PrimOp(${x.op})"]`):
        isVarDecl(x)? (`["VarDecl(${x.var})"]`):
        isVarRef(x)?  (`["VarRef(${x.var})"]`):
        x=== "rands"? (`["rands"]`):
        x === "rato"? (`["rato"]`):
        isAppExp(x)?  (`["AppExp"]`):
        x==="body"?  (`[:]`):
        x==="bindings"?  (`[:]`):
        x==="binding"?  (`[binding]`):
        isProcExp(x)?  (`["ProcExp"]`):
        x ==="params"? (`["Params"]`):
        isLitExp(x)? (`["LitExp"]`):
        isCompoundSExp(x)? (`["CompoundSExp"]`):
        isProgram(x)? (`[Program]`):
        isArray(x) && isExp(x) ? (`["Exps"]`):
        isIfExp(x)? (`["IfExp"]`):
        isSetExp(x)? (`["SetExp"]`):
        isEmptySExp(x)?(`["EmptySExp"]`):
        isLetExp(x)? (`["LetExp"]`):
        isStrExp(x)? (`["StrExp(${x.val})"]`):
        isLetrecExp(x)? (`["LetRecExp"]`):
        isString (x)? (`["StringExp"]`):
        isSymbolSExp(x)?(`["SymbolSexp(${x.val})"]`):
        isArray(x) && isExp(x[0])?  ("Exps"):
        "Error: "+ x.tag;

export const MyVarGen = (x:any):string =>
        isBoolExp(x)? BoolGen ("BoolExp"):
        isBoolean(x)? boolGen ("boolean"):
        isNumber(x) ? numGen ("number"):
        isNumExp(x) ? NumGen ("NumExp"):
        isDefineExp(x)? DefineGen ("DefineExp"):
        isPrimOp(x)? PrimOpGen  ("PrimOp"):
        isVarDecl(x)? VarDeclGen ("VarDecl"):
        isVarRef(x)? VarRefGen ("VarRef"):
        x=== "rands"? RandsGen ("Rands"):
        x === "rato"? RatorGen ("Rato"):
        isAppExp(x)? AppExpGen ("AppExp"):
        x==="body"? BodyGen ("body"):
        x==="bindings"? BindingsGen ("Bindings"):
        x==="binding"? BindingGen ("Binding"):
        isProcExp(x)? ProcExpGen ("ProcExp"):
        x ==="params"? ParamsGen ("params"):
        isLitExp(x)? LitExpGen ("LitExp"):
        isCompoundSExp(x)? CompoundSExpGen("CompoundSExp"):
        isProgram(x)? ProgramGen ("Program"):
        isSetExp(x)? SetExpGen ("SetExp"):
        isIfExp(x)? IfExpGen ("IfExp"):
        isEmptySExp(x)? EmptySExpGen("EmptySExp"):
        isLetExp(x)? LetExpGen("LetExp"):
        isArray(x) && isExp(x[0])?  ExpsGen ("Exps"):
        isStrExp(x)? StrExpGen("StrExp"):
        isLetrecExp(x)? LetRecGen("LetRecExp"):
        isString (x)? StringGen (x):
        isSymbolSExp (x)? SymbolSexpGen("SymbolSExp"):
        "Error:  "+ x.tag;

    
    
       export const makeVarGen = (): (v: string) => string => {
            let count: number = 0;
            return (v: string) => {
                count++;
                return `${v}__${count}`;
            };
        };


    const EmptySExpGen = makeVarGen();    
    const boolGen = makeVarGen();
    const numGen = makeVarGen();
    const BoolGen = makeVarGen();
    const NumGen = makeVarGen();
    const StringGen = makeVarGen();
    const DefineGen =makeVarGen();
    const PrimOpGen = makeVarGen();
    const VarDeclGen =  makeVarGen();
    const VarRefGen =  makeVarGen();
    const RandsGen = makeVarGen();
    const RatorGen =   makeVarGen();
    const AppExpGen =  makeVarGen();
    const BodyGen =  makeVarGen();
    const ProcExpGen  = makeVarGen();
    const ParamsGen =  makeVarGen();
    const LitExpGen =  makeVarGen();
    const CompoundSExpGen=  makeVarGen();
    const ProgramGen = makeVarGen();
    const ExpsGen = makeVarGen();
    const IfExpGen =  makeVarGen();
    const SetExpGen =  makeVarGen();
    const StrExpGen =  makeVarGen();
    const LetRecGen =  makeVarGen();
    const LetExpGen =  makeVarGen();
    const BindingsGen = makeVarGen();
    const BindingGen = makeVarGen();
    const SymbolSexpGen = makeVarGen();

// ==========================================================================
// Unparse: Map an AST to a concrete syntax string.

    export const unparseEdge =(edge:Edge):string =>
        edge.label?.label === undefined?  unparseNode(edge.from)+" --> "+ unparseNode(edge.to)+"\n":
        unparseNode(edge.from)+" --> "+ edge.label.label +unparseNode(edge.to)+"\n";

    export const unparseNode =(node:Node):string =>
        isNodeDecl(node)? node.id+node.label:
        node.id;

    export const unparseAtomicGraph = (exp:AtomicGraph, dir:Header): string=>
        `graph ${dir.tag}\n`+(unparseNode(exp.body))

    export const unparseCompoundGraph = (exp:CompoundGraph, dir:Header): string=>
        `graph ${dir.tag}\n`+map(unparseEdge,exp.body).toString().replace(/,/g,'');

    export const unparseMermaid = (exp: Graph): Result<string> =>
        isAtomicGraph(exp.content)? makeOk(unparseAtomicGraph(exp.content,exp.dir)):
        makeOk(unparseCompoundGraph(exp.content,exp.dir));

    
      

    export const L4toMermaid = (concrete: string): Result<string>=>
        concrete.includes("L4")?
        bind(bind(parseL4(concrete), mapL4toMermaid), unparseMermaid) :
        bind(bind(bind(p(concrete), parseL4Exp),mapL4toMermaid),unparseMermaid);
        
