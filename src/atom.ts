import { added, scaled } from "./vector.js";

export type Atom = {
    position: number[];
    // x and y velocity.
    velocity: number[];
}

export function updateAtom(atom: Atom, acceleration: number[], timeStep: number) {
    // The atom's equations of state are applied.
    // x = v * t + 1/2 * a * t^2

    for (const coord of acceleration) {
        if (isNaN(coord)) {
            throw Error("acceleration should be a number. Instead got " + acceleration);
        }    
    }

    atom.position = added(atom.position, added(scaled(atom.velocity, timeStep), scaled(acceleration, 1/2 * timeStep * timeStep)))    
    atom.velocity = added(atom.velocity, scaled(acceleration, timeStep))
}