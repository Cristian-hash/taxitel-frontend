import { Component } from '@angular/core';
import { CotizadorComponent } from './components/cotizador/cotizador'; // Nombre de clase corregido

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CotizadorComponent], // Importamos la clase correcta
  templateUrl: './app.html',     // Nombre de archivo corregido
  styleUrl: './app.css'          // Nombre de archivo corregido
})
export class AppComponent {
  title = 'taxitel-frontend';
}