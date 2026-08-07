import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotizacionService } from '../../services/cotizacion';
import { CotizacionRequest, CotizacionResponse } from '../../models/viaje';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class FormularioComponent {
  @Output() cotizacionExitosa = new EventEmitter<CotizacionResponse>();
  @Output() rutaNoEncontrada = new EventEmitter<string>();

  private fb = inject(FormBuilder);
  // Hacemos el servicio público para que el HTML pueda leer las listas de empresas
  public cotizacionService = inject(CotizacionService);

  // MEJORA 3: El Lienzo rediseñado
  formularioViaje: FormGroup = this.fb.group({
    empresa: ['', Validators.required],
    origen: ['', Validators.required],
    // Empieza con 1 cajón vacío. El último cajón siempre será visualmente el "Destino Final"
    destinos: this.fb.array([this.fb.control('', Validators.required)]),
    // MEJORA 2: Iniciamos en 'null' para que no estorbe el 0 al tipear
    minutosEspera: [null, Validators.min(0)],
    tieneMensajeria: [false]
  });

  // Atajos para la lista elástica
  get destinos() { return this.formularioViaje.get('destinos') as FormArray; }
  agregarDestino() { this.destinos.push(this.fb.control('', Validators.required)); }
  eliminarDestino(index: number) {
    if (this.destinos.length > 1) { // Siempre debe quedar al menos 1 destino
      this.destinos.removeAt(index);
    }
  }

  calcular() {
    if (this.formularioViaje.invalid) {
      alert('Cajera, por favor completa todos los campos requeridos.');
      return;
    }

    const formValue = this.formularioViaje.value;

    // Empaquetamos todo exactamente como Java lo espera: [Origen, ...todos los destinos]
    const request: CotizacionRequest = {
      empresa: formValue.empresa,
      paradas: [formValue.origen, ...formValue.destinos],
      tieneMensajeria: formValue.tieneMensajeria,
      // Si la cajera no puso nada (null), enviamos 0 al servidor
      minutosEspera: formValue.minutosEspera || 0 
    };

    this.cotizacionService.calcularCotizacion(request).subscribe({
      next: (response) => {
        this.cotizacionExitosa.emit(response);
      },
      error: (err) => {
        console.error('Error detectado:', err);
        if (err.status === 404) {
          this.rutaNoEncontrada.emit(err.error);
        } else if (err.status === 0) {
          alert('🚨 ¡El servidor Java parece apagado o desconectado!');
        } else {
          alert('Ocurrió un imprevisto al calcular. Revisa la consola.');
        }
      }
    });
  }
}