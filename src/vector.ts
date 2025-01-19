
export function magnitude(vector: number[]): number {
  let squaredTotal = 0;

  for (const el of vector) {
    squaredTotal += el * el;
  }

  return Math.sqrt(squaredTotal);
}

export function normalized(vector: number[]): number[] {
  const mag = magnitude(vector);

  if (mag == 0) {
    throw Error("Zero division in normalization.");
  }

  return scaled(vector, 1 / mag);
}

export function scaled(vector: number[], factor: number): number[] {
  const ret = [];
  for (const coord of vector) {
    ret.push(coord * factor);
  }

  return ret;
}

export function added(v1: number[], v2: number[]): number[] {
  if (v1.length != v2.length) {
    throw Error("Different length vectors.")
  }
  const ret = [];
  for (let i = 0; i < v1.length; i++) {
    ret.push(v1[i] + v2[i]);
  }

  return ret;
}

export function dist(v1: number[], v2: number[]): number {
  return magnitude(added(v1, scaled(v2, -1)))
}
