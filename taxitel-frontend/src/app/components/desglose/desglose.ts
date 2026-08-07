import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionResponse } from '../../models/viaje';

@Component({
  selector: 'app-desglose',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './desglose.html', // Correcto
  styleUrl: './desglose.css',     // Correcto
})
export class Desglose { // Tu clase se llama Desglose
  // El embudo para recibir la matemática desde el Cotizador padre
  @Input() cotizacion: CotizacionResponse | null = null;
}