export function h (x:number):Promise<number|void>{
    return  new Promise <number|void>((resolve, reject) =>{
        resolve(g(x).then((x)=>f(x)
        .catch((e)=>reject(e)))
        )
    });    
}

export function f(x:number){
    return new Promise<any> ((resolve, reject) => {
        if (x===0)
            reject(console.error("can not divide by 0"))    
        else
            resolve(1/x);
        })   
};

export function g(x:number){
    return new Promise<any> ((resolve) => {
            resolve(x*x);
    })};

export function slower(p:Promise<any>[]):Promise<any[]> {
    let imlast:boolean = false;
    return new Promise<any[]>((resolve,reject)=>{
        p[0].then((val)=>imlast?resolve([0,val]): imlast = true)
            .catch((e)=>reject(e))
        p[1].then((val)=>imlast?resolve([1,val]): imlast = true)
            .catch((e)=>reject(e))
    })
}
