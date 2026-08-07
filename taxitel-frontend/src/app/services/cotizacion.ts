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
// Implementa normalización de texto con Expresiones Regulares (RegEx)
// Implementa normalización de texto extrema con Expresiones Regulares (RegEx)
  normalizarTexto(texto: string): string {
    if (!texto) return '';

    return texto.toUpperCase()
      // 1. ELIMINADOR DE TILDES: Borra acentos para evitar que "JIRÓN" y "JIRON" sean distintos
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      
      // 2. LIMPIEZA DE ESPACIOS: Quita espacios dobles accidentales por un solo espacio
      .replace(/\s+/g, ' ')
      
      // 3. AVENIDAS (Atrapa: AV., AV, AVE, AVEN, AVDA, AVENDID, ABENIDA)
      .replace(/\b(AV\.|AV|AVE|AVEN|AVDA|AVENDID|ABENIDA)\b/g, 'AVENIDA')
      
      // 4. CALLES (Atrapa: C., C, CA, CAL, CLL, CALL, CALE)
      .replace(/\b(C\.|C|CA|CAL|CLL|CALL|CALE)\b/g, 'CALLE')
      
      // 5. JIRONES (Atrapa: JR., JR, JIR, JRO, JIRN, GIRON)
      .replace(/\b(JR\.|JR|JIR|JRO|JIRN|GIRON)\b/g, 'JIRON')
      
      // 6. URBANIZACIONES (Atrapa: URB., URB, URBA, URBZ, URBN, URBACNIZACION, URVANIZACION)
      .replace(/\b(URB\.|URB|URBA|URBZ|URBN|URBACNIZACION|URVANIZACION)\b/g, 'URBANIZACION')
      
      // 7. PASAJES (Atrapa: PJ., PJ, PJE, PAS, PSAJE, PASAJ)
      .replace(/\b(PJ\.|PJ|PJE|PAS|PSAJE|PASAJ)\b/g, 'PASAJE')
      
      // 8. ASOCIACIONES (Atrapa: ASOC., ASOC, ASO, ASOCIACION)
      .replace(/\b(ASOC\.|ASOC|ASO|ASOCIACION)\b/g, 'ASOCIACION')
      
      // 9. PROLONGACIONES (Atrapa: PROL., PROL, PROLONG, PROLONGACION)
      .replace(/\b(PROL\.|PROL|PROLONG|PROLONGACION)\b/g, 'PROLONGACION')
      
      .trim();
  }

  calcularCotizacion(request: CotizacionRequest): Observable<CotizacionResponse> {
    const paradasNormalizadas = request.paradas.map((p: string) => this.normalizarTexto(p));
    const requestLimpio = { ...request, paradas: paradasNormalizadas };

    return this.http.post<CotizacionResponse>(`${this.apiUrl}/calcular`, requestLimpio);
  }

// La función vital actualizada para aceptar la empresa
// La función vital actualizada para aceptar la empresa
  guardarTramo(empresa: string, origen: string, destino: string, tarifaBase: number): Observable<any> {
    const body = { empresa, origen, destino, tarifaBase };
    return this.http.post(`${this.apiUrl}/nuevo-tramo`, body);
  }
}