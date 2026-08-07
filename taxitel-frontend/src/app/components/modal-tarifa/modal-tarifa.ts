import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-tarifa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-tarifa.html',
  styleUrl: './modal-tarifa.css',
})
export class ModalTarifa {
  @Input() mensajeRutaFaltante: string = '';
  @Output() guardarTarifa = new EventEmitter<number>();
  @Output() cerrarModal = new EventEmitter<void>();

  tarifaManual: number | null = null;
  // NUEVO: El candado de seguridad
  guardando: boolean = false; 

  enviarTarifa() {
    // Si ya está guardando, ignoramos los clics adicionales
    if (this.tarifaManual !== null && this.tarifaManual >= 0 && !this.guardando) {
      this.guardando = true; // Bloqueamos el botón al primer clic
      this.guardarTarifa.emit(this.tarifaManual);
    }
  }
}