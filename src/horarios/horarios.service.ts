import { ConflictException, Injectable, Logger } from '@nestjs/common';

/*** Servicio que administra los slots reservados por veterinario/fecha.
 * Paso 1 de la Saga: ReservarHorario.*/
@Injectable()
export class HorariosService {
  private readonly log = new Logger(HorariosService.name);
  private readonly reservas = new Set<string>();
  private readonly reservasPorSaga = new Map<string, string>();

  private key(veterinarioId: string, fechaHora: string) {
    return `${veterinarioId}::${fechaHora}`;
  }

  reservar(sagaId: string, veterinarioId: string, fechaHora: string): void {
    const k = this.key(veterinarioId, fechaHora);
    if (this.reservas.has(k)) {
      throw new ConflictException(
        `El veterinario ${veterinarioId} ya tiene una cita a las ${fechaHora}`,
      );
    }
    this.reservas.add(k);
    this.reservasPorSaga.set(sagaId, k);
    this.log.log(`[${sagaId}] Horario reservado: ${k}`);
  }

  /** Compensacion: LiberarHorario */
  liberar(sagaId: string): void {
    const k = this.reservasPorSaga.get(sagaId);
    if (!k) return;
    this.reservas.delete(k);
    this.reservasPorSaga.delete(sagaId);
    this.log.warn(`[${sagaId}] COMPENSACION: horario liberado (${k})`);
  }
}
