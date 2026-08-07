import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CotizacionRequest, CotizacionResponse } from '../models/viaje';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  // Conectamos Angular al backend con HttpClient
  private http = inject(HttpClient);
  //private apiUrl = 'http://localhost:8080/api/cotizaciones';
  private apiUrl = 'http://192.168.1.196:8080/api/cotizaciones';

// Base de datos visual temporal para el autocompletado
  rutasConocidas = ['AVENIDA INDEPENDENCIA', 'AVENIDA DOLORES', 'AVENIDA EJERCITO', 'CALLE CAYETANO', 'CALLE PIEROLA'];

  // NUEVA MEJORA 1: Base de datos visual de empresas (Las más usadas van primero)
  empresasConocidas = [
    // --- VIP (Más frecuentes) ---
    'FLSMIDTH', 'MINERALES WEIR PERÚ', 'RICO POLLO', 'ENAEX', 'CHICHA', 'FERREYROS',
    // --- Resto de empresas ---
    'UTP SAC', 'CLÍNICA SAN JUAN DE DIOS', 'SAN LORENZO', 'ROSATEL', 'INCALPACA',
    'COLEGIO MAX UHLE', 'CLARO', 'AGROINCA PPX', 'KOMATSU MITSUI', 'WONG Y LA CIA',
    'ORICA PLANTA', 'GRUPO VERDE', 'COL ANGLO AMERICANO PRESCOTT', 'LAVORO', 'CLÍNICA PULSO', 'LIV'
  ];
  // Implementa normalización de texto por detrás en Angular
  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.toUpperCase()
                .replace('AV.', 'AVENIDA')
                .replace('C.', 'CALLE')
                .trim();
  }

  calcularCotizacion(request: CotizacionRequest): Observable<CotizacionResponse> {
    const paradasNormalizadas = request.paradas.map((p: string) => this.normalizarTexto(p));
    const requestLimpio = { ...request, paradas: paradasNormalizadas };

    return this.http.post<CotizacionResponse>(`${this.apiUrl}/calcular`, requestLimpio);
  }

  // NUEVO: La función vital que Angular no encontraba para guardar
  guardarTramo(origen: string, destino: string, tarifaBase: number): Observable<any> {
    const body = { origen, destino, tarifaBase };
    return this.http.post(`${this.apiUrl}/nuevo-tramo`, body);
  }
}