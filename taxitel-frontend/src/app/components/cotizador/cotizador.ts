import { Component, inject } from '@angular/core';
import { FormularioComponent } from '../formulario/formulario';
import { Desglose } from '../desglose/desglose';
import { ModalTarifa } from '../modal-tarifa/modal-tarifa';
import { CotizacionResponse } from '../../models/viaje';
import { CommonModule } from '@angular/common';
import { CotizacionService } from '../../services/cotizacion';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [FormularioComponent, Desglose, ModalTarifa, CommonModule],
  templateUrl: './cotizador.html',
  styleUrl: './cotizador.css'
})
export class CotizadorComponent {
  datosCotizacion: CotizacionResponse | null = null;
  mostrarModal: boolean = false;
  mensajeRuta: string = '';
  empresaActual: string = ''; // <-- NUEVA MEMORIA TEMPORAL

  private cotizacionService = inject(CotizacionService);

  recibirRespuestaDeJava(respuesta: CotizacionResponse) {
    this.datosCotizacion = respuesta;
    this.mostrarModal = false;
  }

  // NUEVO: Oculta la tarjeta verde cuando presionan "Nueva Consulta"
  limpiarPantalla() {
    this.datosCotizacion = null;
  }

  // CORRECCIÓN PARA TU TERMINAL: Recibimos el objeto (data) completo
  abrirModal(data: { mensaje: string, empresa: string }) {
    this.mensajeRuta = data.mensaje;
    this.empresaActual = data.empresa; // Guardamos el nombre (Ej. FERREYROS)
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarNuevaTarifa(precio: number) {
    const rutaLimpia = this.mensajeRuta.replace('Falta precio para: ', '');
    const partes = rutaLimpia.split(' a ');
    const origen = partes[0].trim();
    const destino = partes[1].trim();

    this.cerrarModal();

    // LA GRAN MAGIA: Ahora enviamos 'this.empresaActual' como primer dato hacia el Service
    this.cotizacionService.guardarTramo(this.empresaActual, origen, destino, precio).subscribe({
      next: () => {
        setTimeout(() => {}, 300);
      },
      error: (err: any) => {
        console.error('Error al guardar la ruta:', err);
        alert('Hubo un error al conectar con Java para guardar.');
      }
    });
  }
}