import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

type Vector2 = { x: number; y: number; };

@Component({
  selector: 'app-generador-textura',
  standalone: true,
  imports: [],
  templateUrl: './generador-textura.component.html',
  styleUrl: './generador-textura.component.scss'
})
export class GeneradorTexturaComponent implements AfterViewInit {

  private static generateGradientTable(size: number): Vector2[] {
    const gradients: Vector2[] = [];
    for (let i = 0; i < size; i++) {
      const angle = Math.random() * Math.PI * 2;
      gradients.push({
        x: Math.cos(angle),
        y: Math.sin(angle)
      });
    }
    return gradients;
  }

  private static dotProduct(v1: Vector2, v2: Vector2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private static lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private static perlinNoise(x: number, y: number, gradientTable: Vector2[]): number {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const sx = x - x0;
    const sy = y - y0;

    const g00 = gradientTable[(x0 + y0 * 100) % gradientTable.length];
    const g10 = gradientTable[(x1 + y0 * 100) % gradientTable.length];
    const g01 = gradientTable[(x0 + y1 * 100) % gradientTable.length];
    const g11 = gradientTable[(x1 + y1 * 100) % gradientTable.length];

    const dot00 = GeneradorTexturaComponent.dotProduct(g00, { x: sx, y: sy });
    const dot10 = GeneradorTexturaComponent.dotProduct(g10, { x: sx - 1, y: sy });
    const dot01 = GeneradorTexturaComponent.dotProduct(g01, { x: sx, y: sy - 1 });
    const dot11 = GeneradorTexturaComponent.dotProduct(g11, { x: sx - 1, y: sy - 1 });

    const u = GeneradorTexturaComponent.fade(sx);
    const interX0 = GeneradorTexturaComponent.lerp(u, dot00, dot10);
    const interX1 = GeneradorTexturaComponent.lerp(u, dot01, dot11);

    const v = GeneradorTexturaComponent.fade(sy);
    return GeneradorTexturaComponent.lerp(v, interX0, interX1);
  }

  private generatePerlinTexture(width: number, height: number, gradientTable: Vector2[]): Uint8ClampedArray {
    const texture = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noiseValue = GeneradorTexturaComponent.perlinNoise(x / 100, y / 100, gradientTable);
        const normalizedValue = Math.floor((noiseValue + 1) * 64 + 128);
        const index = (y * width + x) * 4;
        texture[index] = normalizedValue;
        texture[index + 1] = normalizedValue;
        texture[index + 2] = normalizedValue;
        texture[index + 3] = 255;
      }
    }

    return texture;
  }

  ngAfterViewInit(): void {
    const canvas = document.getElementById('perlinCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1024;
    const height = 1024;
    canvas.width = width;
    canvas.height = height;

    const gradientTable = GeneradorTexturaComponent.generateGradientTable(1024);
    const texture = this.generatePerlinTexture(width, height, gradientTable);
    
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(texture);
    ctx.putImageData(imageData, 0, 0);
  }
}