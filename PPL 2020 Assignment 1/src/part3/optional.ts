import { none, any } from "ramda";

/* Question 1 */

export type Optional<T> = None|Some<T>;

interface Some<T>{
    tag: "Some";
    value: T;
};

interface None{
    tag: "None";
};


export const makeSome: <T> (x:T) => Some<T> = <T>(x:T) =>
    ({tag: "Some", value: x});

export const makeNone: ()=> None = ()=> 
    ({tag: "None"});

export const isSome: <T> (x:Optional<T>) => x is Some<T> = <T>(x:Optional<T>):x is Some<T> => x.tag === "Some";

export const isNone: <T> (x:Optional<T>) => x is None = <T>(x:Optional<T>):x is None => x.tag === "None";

/* Question 2 */
export const bind:<T, U> (Optional: Optional<T>, f: (x: T) => Optional<U>)=> Optional<U> = <T, U> (Optional: Optional<T>, f: (x: T) => Optional<U>): Optional<U> =>(
    isSome(Optional)? f(Optional.value): makeNone()
);
