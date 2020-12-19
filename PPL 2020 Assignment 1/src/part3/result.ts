import { reduce } from "ramda";

/* Question 3 */

export type Result<T> = Ok<T>| Failure;

interface Ok<T> {
    tag:"Ok";
    value: T;
}
interface Failure {
    tag: "Failure";
    message: string;
}

export const makeOk: <T>(x:T)=> Ok<T> = <T>(x:T)=> (
    {
        tag:"Ok",
        value: x
    })

export const makeFailure: (st:string)=> Failure= (st:string)=>(
    {
        tag: "Failure",
        message:st
    }
)

export const isOk:  <T> (x:Result<T>) => x is Ok<T> = <T>(x:Result<T>):x is Ok<T> => x.tag === "Ok";
export const isFailure:  <T> (x:Result<T>) => x is Failure = <T>(x:Result<T>):x is Failure => x.tag === "Failure";

/* Question 4 */
export const bind:<T, U> (Result: Result<T>, f: (x: T) => Result<U>)=>Result<U> = <T, U> (Result: Result<T>, f: (x: T) => Result<U>):Result<U> => 
    (isOk(Result))? f(Result.value): Result;

/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
    user.name === "Bananas" ? makeFailure("Bananas is not a name") :
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
    makeOk(user);


export const naiveValidateUser = (User:User)=>
    isFailure(validateName(User)) ? validateName(User):
    isFailure(validateEmail(User)) ? validateEmail(User):
    validateHandle(User)

export const monadicValidateUser: (user:User)=> Result<User> = (user:User)=>
    reduce (bind, validateName(user), [validateEmail,validateHandle]);






