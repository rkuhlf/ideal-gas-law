
export function clamp(x: number, min: number, max: number): number {
    return Math.min(Math.max(x, min), max);
}

// Standard Normal variate using Box-Muller transform.
export function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}



export function sum(arr: number[]): number {
    let ret = 0;
    for (const el of arr) {
        ret += el;
    }

    return ret;
}

export function mean(arr: number[]): number {
    return sum(arr) / arr.length;
}
