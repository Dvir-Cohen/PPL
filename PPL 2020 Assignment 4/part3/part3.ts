
export function* braid(generator1: () => Generator, generator2: () => Generator): Generator{
    const gen1 = generator1();
    const gen2  = generator2();   
    while (true){
        const a = gen1.next();
        const b = gen2.next();
        if (!a.done) yield a.value;
        if (!b.done) yield b.value;
        // end of all gens
        if (a.done && b.done) break;
    }
}

    export function* biased(generator1: () => Generator, generator2: () => Generator): Generator{
        const gen1 = generator1();
        const gen2  = generator2();
        while (true){
            const a = gen1.next();
            const b = gen1.next();
            const c = gen2.next();
            if (!a.done) yield a.value;
            if (!b.done) yield b.value;
            if (!c.done) yield c.value;
            // end of all gens
            if (a.done && b.done && c.done) break;
        }
    }
