import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GeneradorTexturaComponent } from './generador-textura/generador-textura.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GeneradorTexturaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'generador-textura-altura';
}
