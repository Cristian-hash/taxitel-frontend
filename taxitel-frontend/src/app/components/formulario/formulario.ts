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
  @Output() rutaNoEncontrada = new EventEmitter<{ mensaje: string, empresa: string }>();
  private fb = inject(FormBuilder);
  // El servicio debe ser público para que el HTML lea las memorias de autocompletado
  public cotizacionService = inject(CotizacionService);

  // 1. El Lienzo rediseñado
  formularioViaje: FormGroup = this.fb.group({
    empresa: ['', Validators.required],
    origen: ['', Validators.required],
    // Empieza con 1 cajón vacío.
    destinos: this.fb.array([this.fb.control('', Validators.required)]),
    // El '0' molesto desaparece iniciando en null
    minutosEspera: [null, Validators.min(0)],
    tieneMensajeria: [false]
  });

  // 2. Atajos para la lista elástica
  get destinos() { return this.formularioViaje.get('destinos') as FormArray; }
  
  // 3. Calculadora visual de tolerancia en tiempo real (LA MEJORA VIP)
  get toleranciaMinutos(): number {
    const empresaSeleccionada = this.formularioViaje.get('empresa')?.value?.toUpperCase() || '';
    if (empresaSeleccionada === 'KOMATSU MITSUI') {
      return 15;
    } else if (empresaSeleccionada === 'RICO POLLO') {
      return 7;
    }
    return 5; // Tolerancia por defecto
  }

  // 4. Controles dinámicos
  agregarDestino() { 
    this.destinos.push(this.fb.control('', Validators.required)); 
  }
  
  eliminarDestino(index: number) {
    if (this.destinos.length > 1) { // Siempre debe quedar al menos 1 destino
      this.destinos.removeAt(index);
    }
  }

  // 5. El Motor de Cálculo
  calcular() {
    if (this.formularioViaje.invalid) {
      alert('Cajera, por favor completa todos los campos requeridos.');
      return;
    }

    const formValue = this.formularioViaje.value;

    // Empaquetamos todo exactamente como Java lo espera: [Origen, ...todos los destinos]
    const request: CotizacionRequest = {
      empresa: formValue.empresa, // <- Enviamos la empresa para la tolerancia matemática
      paradas: [formValue.origen, ...formValue.destinos],
      tieneMensajeria: formValue.tieneMensajeria,
      minutosEspera: formValue.minutosEspera || 0 // Si dejaron null, enviamos 0
    };

    this.cotizacionService.calcularCotizacion(request).subscribe({
      next: (response) => {
        this.cotizacionExitosa.emit(response);
      },
error: (err) => {
        console.error('Error detectado:', err);
        if (err.status === 404) {
          // CORRECCIÓN: Enviamos el mensaje y la empresa al orquestador padre
          this.rutaNoEncontrada.emit({
            mensaje: err.error,
            empresa: formValue.empresa 
          });
        } else if (err.status === 0) {
          alert('🚨 ¡El servidor Java parece apagado o desconectado!');
        } else {
          alert('Ocurrió un imprevisto al calcular. Revisa la consola.');
        }
      }
    });
  }
}