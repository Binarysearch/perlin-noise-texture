import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerlinNoiseService {
  private permutation: number[];
  private grad3: number[][];

  constructor() {
    this.permutation = this.generatePermutation();
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
  }

  // Generate permutation table
  private generatePermutation(): number[] {
    const permutation = Array.from({ length: 256 }, (_, i) => i);
    for (let i = permutation.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    return permutation.concat(permutation);
  }

  // Fade function as defined by Ken Perlin
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // Lerp function
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  // Dot product function
  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  // Perlin noise function
  noise2D(xin: number, yin: number): number {
    const X = Math.floor(xin) & 255;
    const Y = Math.floor(yin) & 255;
    xin -= Math.floor(xin);
    yin -= Math.floor(yin);
    const u = this.fade(xin);
    const v = this.fade(yin);
    const A = this.permutation[X] + Y;
    const B = this.permutation[X + 1] + Y;

    // Comprobaciones para evitar valores nulos
    if (this.permutation[A] === undefined || this.permutation[B] === undefined ||
        (this.permutation[A] & 15) === undefined || (this.permutation[B] & 15) === undefined) {
      console.error('Error: Indices fuera de rango en la tabla de permutación.');
      return 0;
    }

    return this.lerp(v,
      this.lerp(u,
        this.dot(this.grad3[this.permutation[A] & 15], xin, yin),
        this.dot(this.grad3[this.permutation[B] & 15], xin - 1, yin)
      ),
      this.lerp(u,
        this.dot(this.grad3[this.permutation[A + 1] & 15], xin, yin - 1),
        this.dot(this.grad3[this.permutation[B + 1] & 15], xin - 1, yin - 1)
      )
    );
  }
}
