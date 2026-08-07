import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotizacionService } from '../../services/cotizacion';
import { CotizacionRequest } from '../../models/viaje';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class FormularioComponent {
  @Output() cotizacionExitosa = new EventEmitter<any>();
  // NUEVO: El megáfono que grita "¡Falta una tarifa!"
  @Output() rutaNoEncontrada = new EventEmitter<string>(); 

  public fb = inject(FormBuilder);
  public cotizacionService = inject(CotizacionService);

  formularioViaje: FormGroup = this.fb.group({
    empresa: ['', Validators.required],
    origen: ['', Validators.required],
    destino: ['', Validators.required],
    paradas: this.fb.array([]),
    minutosEspera: [0, Validators.min(0)],
    tieneMensajeria: [false]
  });

  get paradas() { return this.formularioViaje.get('paradas') as FormArray; }
  
  agregarParada() { this.paradas.push(this.fb.control('', Validators.required)); }
  eliminarParada(index: number) { this.paradas.removeAt(index); }

  calcular() {
    if (this.formularioViaje.invalid) {
      alert('Cajera, por favor completa todos los campos requeridos.');
      return;
    }

    const formValue = this.formularioViaje.value;
    const request: CotizacionRequest = {
      paradas: [formValue.origen, ...formValue.paradas, formValue.destino],
      tieneMensajeria: formValue.tieneMensajeria,
      minutosEspera: formValue.minutosEspera
    };

   this.cotizacionService.calcularCotizacion(request).subscribe({
      next: (response) => {
        this.cotizacionExitosa.emit(response);
      },
      error: (err: any) => {
        if (err.status === 404) {
          // Ruta desconocida: Llama al Modal
          this.rutaNoEncontrada.emit(err.error);
        } else if (err.status === 0) {
          // ERROR CERO: Falta conexión. Java está apagado o bloqueado.
          alert('🚨 ¡El servidor Java parece apagado o desconectado! Por favor, verifica el backend.');
        } else {
          alert('Ocurrió un imprevisto. Presiona F12 y revisa la consola.');
          console.error('Error de servidor:', err);
        }
      }
    });
  }
}