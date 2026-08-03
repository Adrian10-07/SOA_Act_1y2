import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificacionesService } from './notificaciones.service';

/**
 * Worker asincrono (Tarea 2b - ASINCRONO).
 * Reacciona al evento "cita.creada" y envia el recordatorio en segundo plano.
 * La API ya respondio 201 al usuario cuando este listener se ejecuta.
 */
@Injectable()
export class NotificacionesListener {
  private readonly log = new Logger(NotificacionesListener.name);

  constructor(private readonly notificaciones: NotificacionesService) {}

  @OnEvent('cita.creada', { async: true, promisify: true })
  async onCitaCreada(payload: {
    citaId: string;
    mascotaId: string;
    fechaHora: string;
  }) {
    this.log.log(`Evento recibido -> encolando recordatorio para ${payload.citaId}`);
    try {
      await this.notificaciones.enviarRecordatorio(payload.citaId, payload.fechaHora);
    } catch (err) {
      this.log.error(`Fallo el envio para ${payload.citaId}: ${err.message}`);
      // En un sistema real: reintento con backoff / dead-letter queue.
    }
  }
}
