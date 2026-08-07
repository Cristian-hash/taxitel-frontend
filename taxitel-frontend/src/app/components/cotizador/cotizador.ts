import { Component, inject } from '@angular/core';
import { FormularioComponent } from '../formulario/formulario';
import { Desglose } from '../desglose/desglose';
import { ModalTarifa } from '../modal-tarifa/modal-tarifa';
import { CotizacionResponse } from '../../models/viaje';
import { CommonModule } from '@angular/common';
import { CotizacionService } from '../../services/cotizacion'; // IMPORTAMOS EL SERVICIO

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

  // Inyectamos el servicio para poder guardar
  private cotizacionService = inject(CotizacionService);

  recibirRespuestaDeJava(respuesta: CotizacionResponse) {
    this.datosCotizacion = respuesta;
    this.mostrarModal = false; 
  }

  abrirModal(mensaje: string) {
    this.mensajeRuta = mensaje;
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

    // 1. LA MAGIA VISUAL: Cerramos el modal AL INSTANTE, antes de hablar con Java
    this.cerrarModal();

    // 2. Enviamos los datos a Java "en segundo plano"
    this.cotizacionService.guardarTramo(origen, destino, precio).subscribe({
      next: () => {
        // 3. Aumentamos el respiro a 300ms para asegurar que el navegador 
        // ya borró el modal de la pantalla por completo antes de congelarse con la alerta
        setTimeout(() => {
          console.log('✅ Ruta aprendida silenciosamente en PostgreSQL');
        }, 300);
      },
      error: (err: any) => {
        console.error('Error al guardar la ruta:', err);
        alert('Hubo un error al conectar con Java para guardar.');
      }
    });
  }
}