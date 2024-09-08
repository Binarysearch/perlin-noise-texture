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

    const colorHex1 = '#000055ff';
    const colorHex2 = '#9999ffff';

    const [r1, g1, b1, a1] = hexToRgba(colorHex1);
    const [r2, g2, b2, a2] = hexToRgba(colorHex2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noiseValue1 = GeneradorTexturaComponent.perlinNoise(x / 200, y / 200, gradientTable);
        const t1 = (noiseValue1 + 1) * 0.5;
        const noiseValue = GeneradorTexturaComponent.perlinNoise(x / 50, y / 50, gradientTable);
        const t = t1 * ((noiseValue + 1) * 0.5);

        // Interpolación de colores y alpha
        const [r, g, b, a] = interpolateColorWithAlpha([r1, g1, b1, a1], [r2, g2, b2, a2], t);

        const index = (y * width + x) * 4;
        texture[index] = r;     // Rojo
        texture[index + 1] = g; // Verde
        texture[index + 2] = b; // Azul
        texture[index + 3] = a; // Alfa (opacidad)
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


function hexToRgba(hex: string): [number, number, number, number] {
  // Elimina el hash (#) si está presente
  hex = hex.replace(/^#/, '');

  // Convierte los valores hexadecimales a números enteros
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = parseInt(hex.slice(6, 8), 16); // Alpha

  return [r, g, b, a];
}

function interpolateColorWithAlpha(color1: [number, number, number, number], color2: [number, number, number, number], t: number): [number, number, number, number] {
  const r = Math.round(color1[0] + t * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + t * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + t * (color2[2] - color1[2]));
  const a = Math.round(color1[3] + t * (color2[3] - color1[3])); // Interpolación del alpha

  return [r, g, b, a];
}