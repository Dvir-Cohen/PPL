import { map } from "ramda";
import { Exp, CExp,PrimOp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isDefineExp, isProcExp, isIfExp, isAppExp, isPrimOp, isAtomicExp, AtomicExp, isCompoundExp, CompoundExp} from '../imp/L2-ast';
import { Result,makeOk, makeFailure } from '../imp/result';

/*
Purpose: Make l2 AST to Js Result <string>
Signature: l2ToJS(AST)
Type: [Exp| Program] => Result<string>
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
    makeOk(l2ToJS_string(exp));


/*
Purpose: Make l2 AST to Js string
Signature: l2ToJS(AST)
Type: [Exp| Program] => string
*/
export const l2ToJS_string = (exp: Exp | Program): string => 
    isProgram(exp) && (exp.exps.length> 1)? map(l2ToJS_string,exp.exps.slice(0,exp.exps.length-1)).join(";\n")
                    +";\nconsole.log(" +l2ToJS_string(exp.exps[exp.exps.length-1])+");" :
    isProgram(exp) ? "console.log(" + l2ToJS_string(exp.exps[0]) + ");":
    isAtomicExp (exp)? l2ToJSAtomic(exp):
    isCompoundExp(exp)? l2ToJSCompound(exp):
    //isDefineExp
    "const "+exp.var.var + " = " + l2ToJS_string(exp.val);

/*
Purpose: Make l2 Atomic AST to Js string
Signature: l2ToJSAtomic(AST)
Type: [AtomicExp] => Result<string>
*/
export const l2ToJSAtomic= (exp:AtomicExp): string =>
    isNumExp (exp) ? exp.val.toString() :
    isBoolExp(exp) ? (exp.val === true ? 'true' : 'false'):
    isVarRef(exp) ? exp.var :
    //PrimOp with out CExp[]
    ("Unknown expression:" + exp.tag);


/*
Purpose: Make l2 compound AST to Js string
Signature: l2ToJSCompound(AST)
Type: [CompoundExp] => Result<string>
*/
export const l2ToJSCompound= (exp:CompoundExp): string =>
    isProcExp(exp) ? "((" +  
                            map((p) => p.var, exp.args).join(",") + ") => " + 
                            (exp.body.length===1? l2ToJS_string(exp.body[0]) + ")":
                             "{"+ map(l2ToJS_string,exp.body.slice(0,exp.body.length-1)).join("; ") +"; return "+l2ToJS_string(exp.body[exp.body.length-1])+";})") :
    isIfExp(exp) ? "("  + l2ToJS_string(exp.test) +
                            " ? "+ l2ToJS_string(exp.then) +
                            " : " + 
                          l2ToJS_string(exp.alt) + 
                     ")" :
    // is AppExp
          (isPrimOp(exp.rator) ? 
              (l2ToJSPrimOpApp(exp.rator, exp.rands)) :
              l2ToJS_string(exp.rator) + "(" + map(l2ToJS_string, exp.rands).join(",") + ")") ;
           
/*
Purpose: Make l2 PrimOp AST to Js string
Signature: l2ToJSPrimOp(AST)
Type: [PrimOp, CExp[]] => Result<string>
*/
const l2ToJSPrimOpApp = (rator : PrimOp, rands : CExp[]) : string => 
    rator.op === "or" ? "(" + map(l2ToJS_string,rands).join(" || ") + ")" :
    rator.op === "and" ? "(" + map(l2ToJS_string,rands).join(" && ") + ")" :
    rator.op === "not" ? "(!" + l2ToJS_string(rands[0]) + ")" :

    rator.op === "number?" ?  "(typeof " +  l2ToJS_string(rands[0]) + " === 'number')" :
    rator.op === "boolean?" ?  "(typeof " +  l2ToJS_string(rands[0]) + " === 'boolean')" :
    rator.op === "eq?" ? "(" + map(l2ToJS_string,rands).join(" === ")+")":
    rator.op === "=" ? "(" + map(l2ToJS_string,rands).join(" === ")+")":
    "(" + map(l2ToJS_string,rands).join(" " + rator.op + " ") + ")" ;
