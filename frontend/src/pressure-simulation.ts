import { Atom, updateAtom } from "./atom.js";
import { Grid } from "./grid.js";
import { gaussianRandom } from "./math-helpers.js";
import { added, dist, magnitude, normalized, scaled } from "./vector.js";

export type SimulationResult = {
  totalHorizontalImpulse: number;
  totalVerticalImpulse: number;
}

interface UpdateSettings {
  jitteriness: number;
  repulsiveness: number;
  minDistance: number;

  [key: string]: any; // Allow extra fields
}

export class Simulation {
  private atoms: Atom[] = [];
  public grid: Grid<Atom>;

  constructor(
    public width: number,
    public height: number
  ) {
    this.grid = new Grid(20, 20, width, height);
  }

  public update(timeStep: number, updateSettings: UpdateSettings): SimulationResult {
    console.log("Update");
    let totalHorizontalImpulse = 0;
    let totalVerticalImpulse = 0;

    const accelerations = [];
    // The total energy of each atom should be preserved.
    const energies = [];

    // Compute accelerations and energies.
    for (const atom of this.atoms) {
      if (magnitude(atom.velocity) * timeStep > this.width) {
        console.error("Atom velocity is too fast for the screen size. Increment: " + magnitude(atom.velocity) * timeStep);
      }

      const relevantAtoms = this.atoms;
      // this.grid.getNear(atom.position[0], atom.position[1], 50);
      energies.push(getEnergy(atom, relevantAtoms, updateSettings));
      let netAcceleration = [0, 0];
      // The atom moves about a teeny bit depending on the temperature.
      // netAcceleration = added(netAcceleration, getRandomAcceleration());

      // Make the atom attracted by all of the other this.atoms.
      // netAcceleration = added(netAcceleration, scaled(getRepulsionAcceleration(atom, relevantAtoms, updateSettings), -1));

      accelerations.push(netAcceleration);
    }

    // We update only after we have calculated the initial state, that way every force has an equal and opposite reaction since everything is calculated from the same state.
    for (let i = 0; i < this.atoms.length; i++) {
      const atom = this.atoms[i];
      const [prevX, prevY] = atom.position;
      updateAtom(atom, accelerations[i], timeStep);

      // Handle collisions with the wall.
      if (atom.position[0] > this.width) {
        atom.velocity[0] = -Math.abs(atom.velocity[0]);
        atom.position[0] = this.width;

        // Record the change in impulse provided by the container; that is the change in impulse the container received.
        totalHorizontalImpulse += Math.abs(atom.velocity[0]) * 2;
      } else if (atom.position[0] < 0) {
        atom.velocity[0] = Math.abs(atom.velocity[0]);
        atom.position[0] = 0;
        totalHorizontalImpulse += Math.abs(atom.velocity[0]) * 2;
      }

      if (atom.position[1] > this.height) {
        atom.velocity[1] = -Math.abs(atom.velocity[1]);
        atom.position[1] = this.height;

        // Record the change in impulse provided by the container; that is the change in impulse the container received.
        totalVerticalImpulse += Math.abs(atom.velocity[1]) * 2;
      } else if (atom.position[1] < 0) {
        atom.velocity[1] = Math.abs(atom.velocity[1]);
        atom.position[1] = 0;
        totalVerticalImpulse += Math.abs(atom.velocity[1]) * 2;
      }

      // this.grid.moveItem(atom, prevX, prevY, atom.position[0], atom.position[1]);
    }

    // After all of the this.atoms have moved, we can adjust all of their velocities so their total energy remains correct.
    for (let i = 0; i < this.atoms.length; i++) {
      const relevantAtoms = this.atoms;
      // this.grid.getNear(this.atoms[i].position[0], this.atoms[i].position[1], 100);
      const newPotential = getPotentialEnergy(this.atoms[i], relevantAtoms, updateSettings);
      const kinetic = energies[i] - newPotential;
      if (kinetic < 0) {
        // console.error("New potential is too high, skipping.");
        continue;
      }
      // K = 1/2 m * v^2; v = sqrt(2 K / m)
      const velocityMagnitude = Math.sqrt(2 * kinetic);
      const prevMag = magnitude(this.atoms[i].velocity);

      // We do a default instead of dividing by zero.
      this.atoms[i].velocity = prevMag == 0
        ? [velocityMagnitude, 0]
        : scaled(this.atoms[i].velocity, velocityMagnitude / prevMag);
    }

    return {
      totalHorizontalImpulse,
      totalVerticalImpulse
    }
  }

  public addAtom(atom: Atom) {
    this.atoms.push(atom);
    // this.grid.addItem(atom, atom.position[0], atom.position[1]);
  }

  public removeAtom() {
    const atom = this.atoms.pop();
    if (!atom) return;
    // this.grid.removeItem(atom, atom.position[0], atom.position[1]);
  }

  public getAtoms(): Atom[] {
    // TODO: Make this return a copy so it can't be modified. Or return as const.
    return this.atoms;
  }

  public resize(width: number, height: number) {
    for (const atom of this.atoms) {
      atom.position[0] *= width / this.width;
      atom.position[1] *= height / this.height;
    }

    this.width = width;
    this.height = height;
  }
}

interface PEConstants {
  repulsiveness: number;
  minDistance: number;
  [key: string]: any; // Allow extra fields
}

function getPotentialEnergy(atom: Atom, atoms: Atom[], constants: PEConstants): number {
  let energy = 0

  // Add the potentials of all of the attractive forces.
  for (const otherAtom of atoms) {
    if (atom == otherAtom) continue;

    // Add the potential energy.
    // Negative is because this is an attractive force.
    let distance = dist(atom.position, otherAtom.position);
    distance = Math.max(distance, constants.minDistance);
    energy += -1 / distance * constants.repulsiveness;
  }

  return energy;
}

function getEnergy(atom: Atom, atoms: Atom[], constants: PEConstants): number {
  // Add kinetic.
  return 1 / 2 * Math.pow(magnitude(atom.velocity), 2) + getPotentialEnergy(atom, atoms, constants)
}

function getTotalEnergy(atoms: Atom[], constants: PEConstants): number {
  let energy = 0;

  for (const atom of atoms) {
    energy += getEnergy(atom, atoms, constants);
  }

  return energy;
}

// Re-normalize energies. Sometimes excessive energy gain occurs due to numerical inconsistencies.
// Modifies the atoms.
function normalizeToEnergy(atoms: Atom[], energy: number) {

}

function getRandomAcceleration(meanMagnitude: number): number[] {
  const angle = Math.random() * Math.PI * 2;
  const magnitude = gaussianRandom() * meanMagnitude;
  const randomAcceleration = [Math.cos(angle) * magnitude, Math.sin(angle) * magnitude];
  return randomAcceleration;
}

function getRepulsionAcceleration(atom: Atom, atoms: Atom[], constants: PEConstants): number[] {
  let netAcceleration = [0, 0];

  for (const otherAtom of atoms) {
    if (otherAtom == atom) {
      continue;
    }

    const repulsiveForce = getRepulsionMagnitude(atom, otherAtom, constants.minDistance) * constants.repulsiveness;

    let direction = [atom.position[0] - otherAtom.position[0], atom.position[1] - otherAtom.position[1]];
    let unitDirection;
    // If they are right on top of each other, we choose a random direction. This is a numerical deficiency that real life doesn't half to deal with.
    if (magnitude(direction) == 0) {
      const angle = Math.random() * 2 * Math.PI;
      unitDirection = [Math.cos(angle), Math.sin(angle)];
    } else {
      unitDirection = normalized(direction);
    }

    netAcceleration = added(netAcceleration, scaled(unitDirection, repulsiveForce));
    if (isNaN(netAcceleration[0])) {
      console.error("Could not compute repulsion acceleration", atom, otherAtom, repulsiveForce, direction);
      return [0, 0];
    }
  }

  return netAcceleration;
}

function getRepulsionMagnitude(atom1: Atom, atom2: Atom, minDistance: number): number {
  let distance = dist(atom1.position, atom2.position);
  distance = Math.max(distance, minDistance);

  return 1 / Math.pow(distance, 2);
}


export function ensureSimAtomCount(sim: Simulation, spawner: () => Atom, count: number) {
  while (count > sim.getAtoms().length) {
    sim.addAtom(spawner());
  } 
  
  while (count < sim.getAtoms().length) {
    sim.removeAtom();
  }
}
