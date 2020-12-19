// L4 normal eval
import { Sexp } from "s-expression";
import { map} from "ramda";
import {  CExp, Exp, IfExp, Program,isLetExp,makeProcExp, LetExp, parseL4Exp  } from "./L4-ast";
import { isAppExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLitExp, isNumExp, makeAppExp , isPrimOp, isProcExp, isStrExp, isVarRef } from "./L4-ast";
import { applyEnv, makeEmptyEnv,Env, RecEnv,Env_CExp, makeEnv_CExp } from './L4-env-normal';
import { makeExtEnv } from "./L4-env-normal";
import { applyPrimitive } from "./evalPrimitive";
import { isClosure, makeClosure, Value} from "./L4-value";
import { first, rest, isEmpty } from '../shared/list';
import { Result, makeOk, makeFailure, bind, mapResult, isOk } from "../shared/result";
import { parse as p } from "../shared/parser";
import { SExpValue } from "./L4-value";
import { makeRecEnv } from "../part2/L4-env";


export const evalExps = (exps: Exp[], env: Env): Result<Value> =>
    isEmpty(exps) ? makeFailure("Empty program") :
    isDefineExp(first(exps)) ? evalDefineExps(first(exps), rest(exps), env) :
    evalCExps(first(exps), rest(exps), env);

export const evalNormalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());

export const evalNormalParse = (s: string): Result<Value> =>
    bind(p(s),
         (parsed: Sexp) => bind(parseL4Exp(parsed),
                                (exp: Exp) => evalExps([exp], makeEmptyEnv())));

const evalCExps = (exp1: Exp, exps: Exp[], env: Env): Result<Value> =>
    isCExp(exp1) && isEmpty(exps) ? L4normalEval(exp1, env) :
    isCExp(exp1) ? bind(L4normalEval(exp1, env), _ => evalExps(exps, env)) :
    makeFailure("Never");
                                

const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
    isDefineExp(def) &&  isProcExp(def.val) ? evalExps(exps,<Env> makeRecEnv([def.var.var],[[def.var]],[[def.val]],env)) : 
    isDefineExp(def)? evalExps(exps, makeExtEnv([def.var.var], [makeEnv_CExp(env,def.val)], env)): 
    makeFailure("Unexpected " + def);


export const L4normalEval = (exp: CExp, env: Env): Result<Value> =>
    isBoolExp(exp) ? makeOk(exp.val) :
    isNumExp(exp) ? makeOk(exp.val) :
    isStrExp(exp) ? makeOk(exp.val) :
    isPrimOp(exp) ? makeOk(exp) :
    isLitExp(exp) ? makeOk(exp.val) :
    isAppExp(exp) ? bind(L4normalEval(exp.rator, env), proc => L4normalApplyProc(proc, exp.rands, env)) :
    isProcExp(exp)? makeOk(makeClosure(exp.args, exp.body,env)) :
    isIfExp(exp) ? evalIf(exp, env) :
    isVarRef(exp)? handleVarRef(applyEnv(env,exp.var),env):
    isLetExp(exp) ? L4normalEval(handleLetExp(exp,env),env):
    makeFailure(`Bad ast: ${exp}`);

 export const handleVarRef = (result: Result<Env_CExp>, env:Env): Result<SExpValue> =>
    isOk(result)? L4normalEval(result.value.exp,result.value.env) :
    makeFailure(result.tag);

const handleLetExp = (exp:LetExp, env:Env): CExp=>
         makeAppExp(makeProcExp(exp.bindings.map((x)=> x.var),exp.body),exp.bindings.map((x)=>x.val));


    const evalIf = (exp: IfExp, env: Env): Result<Value> =>
        bind(L4normalEval(exp.test, env),
        test => (test) ? L4normalEval(exp.then, env) : L4normalEval(exp.alt, env));


const L4normalApplyProc = (proc:SExpValue, args: CExp[], env: Env): Result<Value> => {
    if (isPrimOp(proc)) {
        const argVals: Result<SExpValue[]> = mapResult((arg) => L4normalEval(arg, env), args);
        return bind(argVals, (args: Value[]) => applyPrimitive(proc, args));;
      
    } else if (isClosure(proc)) {
            const vars = map((p) => p.var, proc.params);
            return L4normalEvalSeq(proc.body,makeExtEnv(vars,map((arg) => makeEnv_CExp(env,arg) ,args),proc.env));
     } else {
        return makeFailure(`Bad proc applied ${proc}`);
    }}
;

const L4normalEvalSeq = (exps: CExp[], env: Env): Result<Value> => {
    if (isEmpty(rest(exps)))
        return L4normalEval(first(exps), env);
    else {
        L4normalEval(first(exps), env);
        return L4normalEvalSeq(rest(exps), env);
    }
};

