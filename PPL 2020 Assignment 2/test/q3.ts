import { ForExp, AppExp, Exp, Program, parseL21CExp, isForExp } from "./L21-ast";
import { Result, makeOk, bind, isOk, makeFailure, isFailure, mapResult } from "../imp/result";
import { makeAppExp, makeProcExp, makeVarDecl, makeNumExp, CExp, parseL2, isProgram, isNumExp, isDefineExp, isBoolExp, isAtomicExp, isAppExp, isVarRef, isPrimOp, isIfExp, isProcExp, makeProgram, makeDefineExp, makeIfExp, isCExp, NumExp } from "../imp/L2-ast";
import { makeBoolExp } from "../imp/L3-ast";
import { start } from "repl";
import { isEmpty, map, range } from "ramda";
import { isToken } from "../imp/parser";
import { isArray } from "util";

/*
Purpose: Make ForExp into AppExp
Signature: for2app(ForExp)
Type: [ForExp] => AppExp
*/
export const for2app = (exp: ForExp): AppExp => 
     makeAppExp(makeProcExp([],<CExp[]>AppBody(exp)) ,[]);


/*
Purpose: Make body of - ForExp into AppExp
Signature: appBody(exp)
Type: [ForExp] => AppExp[]
*/
export const AppBody = (exp: ForExp): AppExp[] => 
    map(((i:number)=>(makeAppExp(makeProcExp([exp.var], [<CExp>exp.body]), [makeNumExp(i)]))),
                    range(exp.start.val, exp.end.val+1))
   
/*
Purpose: Make L21 to L2
Signature: L21ToL2(L21expresion)
Type: [Exp | Program] => Result<Exp| Program>
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    isCExp(exp) || isForExp(exp)? makeOk(L21ToL2CExp(exp)):
    isEmpty(exp)?makeOk(exp):
    isDefineExp(exp) ? makeOk(makeDefineExp(exp.var, L21ToL2CExp(exp.val))):
    isProgram(exp)? L21toL2Program(exp.exps):
    makeFailure("fail");
    ;

/*
Purpose: Make L21program to L2 program
Signature: L21toL2Program( program)
Type: [Exp[]] => Result<Program>
*/
const L21toL2Program = (exp: Exp[]): Result<Program> =>
    isEmpty(exp) ? makeFailure("Unexpected empty program") :
    isToken(exp) ? makeFailure("Program cannot be a single token") :
    isArray(exp) ?L21toL2goodProgram(exp) :
    makeFailure("Unexpected type " + exp);

/*
Purpose: Make L21program to L2 program
Signature: L21toL2goodProgram( program)
Type: [Exp[]] => Result<Program>
*/
const L21toL2goodProgram = (exp: Exp[]): Result<Program> =>
    makeOk(makeProgram(map(L21ToL2CExp,exp)));    
;


/*
Purpose: Make L21 CExp to L2 CExp
Signature: L21toL2goodProgram( exp)
Type: [Exp => CExp
*/
const L21ToL2CExp = (exp: Exp): CExp =>
    isAtomicExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(L21ToL2CExp(exp.test), L21ToL2CExp(exp.then), L21ToL2CExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(L21ToL2CExp(exp.rator), map(L21ToL2CExp,exp.rands)):
    isProcExp(exp) ? ( exp.args.length > 0 ? makeProcExp(exp.args, map(L21ToL2CExp, exp.body)): makeProcExp([], map(L21ToL2CExp, exp.body))): 
    isForExp(exp) ? makeAppExp(L21ToL2CExp(for2app(exp).rator),
                  map(L21ToL2CExp, for2app(exp).rands)):
    <CExp>(exp);
