import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
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
export class FormularioComponent implements OnInit {
  @Output() cotizacionExitosa = new EventEmitter<CotizacionResponse>();
  @Output() rutaNoEncontrada = new EventEmitter<{ mensaje: string, empresa: string }>();
  @Output() limpiarCotizacion = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  public cotizacionService = inject(CotizacionService);

  // ========================================================
  // 1. NUEVA MEMORIA: Ligera para evitar colapso de RAM
  // ========================================================
  rutasFiltradas: string[] = [];

  ngOnInit() {
    this.cotizacionService.obtenerRutasDeBD().subscribe({
      next: (rutasDesdeJava) => {
        this.cotizacionService.rutasConocidas = rutasDesdeJava;
      },
      error: (err) => console.error('Error al cargar rutas desde la base de datos', err)
    });
  }

  // ========================================================
// ========================================================
  // 2. NUEVO MOTOR: Búsqueda de alto rendimiento + TRADUCTOR EN VIVO
  // ========================================================
  buscarRutaEstrategica(event: any) {
    const textoEscrito = event.target.value || '';
    let inputLimpio = textoEscrito.toUpperCase();

    // 🌟 EL TRUCO ANTI-REBOTE: 
    // Si la cajera ya seleccionó una ruta oficial de la lista, 
    // vaciamos las sugerencias para que el cuadrito negro desaparezca al instante.
    if (this.esRutaValida(inputLimpio)) {
      this.rutasFiltradas = [];
      return;
    }

    // Si escriben menos de 2 letras, vaciamos para que respire la RAM
    if (textoEscrito.length < 2) {
      this.rutasFiltradas = [];
      return;
    }

    // 🌟 2.1 EL TRADUCTOR: Limpia los vicios de la cajera en tiempo real
    inputLimpio = inputLimpio.replace(/\b(MZ\.?|LOTE|ZONA)\s+[A-Z0-9\-]+\b/gi, '');
    inputLimpio = inputLimpio.replace(/\s+/g, ' ').trim();

    // 🌟 2.2 BÚSQUEDA INTELIGENTE (Fuzzy Search)
    const palabrasBusqueda = inputLimpio.split(' '); 

    this.rutasFiltradas = this.cotizacionService.rutasConocidas
      .filter(rutaBd => {
        const rutaEnBd = rutaBd.toUpperCase();
        return palabrasBusqueda.every((palabra: string) => rutaEnBd.includes(palabra));
      })
      .slice(0, 30); 
  }

  // 3. El Lienzo rediseñado
  formularioViaje: FormGroup = this.fb.group({
    empresa: ['', Validators.required],
    origen: ['', Validators.required],
    destinos: this.fb.array([this.fb.control('', Validators.required)]),
    minutosEspera: [null, Validators.min(0)],
    tieneMensajeria: [false]
  });

  get destinos() { return this.formularioViaje.get('destinos') as FormArray; }

  agregarDestino() { 
    this.destinos.push(this.fb.control('', Validators.required)); 
  }
  
  eliminarDestino(index: number) {
    if (this.destinos.length > 1) { 
      this.destinos.removeAt(index);
    }
  }

  calcular() {
    if (this.formularioViaje.invalid) {
      alert('Cajera, por favor completa todos los campos requeridos.');
      return;
    }

    const formValue = this.formularioViaje.value;

    const request: CotizacionRequest = {
      empresa: formValue.empresa, 
      paradas: [formValue.origen, ...formValue.destinos],
      tieneMensajeria: formValue.tieneMensajeria,
      minutosEspera: formValue.minutosEspera || 0 
    };

    this.cotizacionService.calcularCotizacion(request).subscribe({
      next: (response) => {
        response.empresa = formValue.empresa;
        this.cotizacionExitosa.emit(response);
      },
      error: (err) => {
        console.error('Error detectado:', err);
        if (err.status === 404) {
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

  nuevaConsulta() {
    this.formularioViaje.reset({
      empresa: '',
      origen: '',
      minutosEspera: null,
      tieneMensajeria: false
    });
    
    this.destinos.clear();
    this.destinos.push(this.fb.control('', Validators.required));
    this.limpiarCotizacion.emit();
  }

  // ========================================================
  // 🛡️ LOS GUARDIANES (Validación estricta de rutas)
  // ========================================================
  
  // Revisa si una sola ruta es válida
  esRutaValida(texto: string): boolean {
    if (!texto) return false;
    return this.cotizacionService.rutasConocidas.includes(texto);
  }

  // Revisa que EL ORIGEN y TODAS LAS PARADAS sean válidas
  todasLasRutasSonValidas(): boolean {
    const origen = this.formularioViaje.get('origen')?.value;
    if (!this.esRutaValida(origen)) return false; // Si el origen falla, bloquea.

    const paradas = this.formularioViaje.get('destinos')?.value || [];
    // Si alguna parada falla, bloquea.
    return paradas.every((parada: string) => this.esRutaValida(parada)); 
  }
}