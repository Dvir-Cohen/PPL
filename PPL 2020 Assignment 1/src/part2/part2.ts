import { compose } from "ramda";

/* Question 1 */
export const partition: <T>(f:(x:T) =>boolean, arr:T[])=>Array<T[]> = <T>(f:(z:T) =>boolean, arr:T[]) => 
   [ arr.filter(f)].concat([arr.reduce((acc: T[], cur: T): T[] => 
        !f(cur) ? acc.concat(cur) : acc
    ,[])]
    );


/* Question 2 */
export const mapMat: <T,U> (f:(x:T)=>U ,mat: T[][]) => U[][] = <T,U> (f:(x:T)=> U, mat: T[][]) : U[][] => 
    mat.reduce((acc: U[][], cur: T[]): U[][] => 
        acc.concat([cur.map(f)]),[])
//base on In 41 at- https://www.cs.bgu.ac.il/~ppl202/wiki.files/practice/PPL_PS1.html

 /*/* Question 3 */
export const composeMany :  <T>(funcArr: Array<(x:T)=> T>) => ((x:T)=> T) = <T>(funcArr: Array<(x:T)=>T>) =>
    funcArr.reduce((acc: ((y: T) => T), cur: ((z: T) => T)) => 
    compose(acc, cur), (h: T): T => h)


/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

export const maxSpeed:(DB:Pokemon[]) => Pokemon[] = (DB:Pokemon[]) =>
    DB.filter((maxPokSpeed: Pokemon): boolean => maxPokSpeed.base.Speed=== DB.reduce((maxPok: number, nextPok: Pokemon):number=>
    nextPok.base.Speed > maxPok ? nextPok.base.Speed : maxPok, 0)) // can be 0 because speed is always >=0
    

export const grassTypes :(DB:Pokemon[]) => string[] = (DB:Pokemon[]) =>
    DB.reduce((acc: string[], pokName: Pokemon): string[] =>
    pokName.type.reduce((GrassArr: string[], pokemonType: string): string[] =>
    pokemonType === "Grass" ? GrassArr.concat(pokName.name.english) : GrassArr ,acc)
        ,[]).sort();
    
export const uniqueTypes:(DB:Pokemon[]) => string[] = (DB:Pokemon[]) =>
        DB.reduce((uniqueTypesArr:string[], pokemonName: Pokemon): string[]=>
        pokemonName.type.reduce((types: string[], pokemonType: string): string[]=>
        !types.includes(pokemonType)? types.concat(pokemonType) : types , uniqueTypesArr)
        ,[]).sort()
