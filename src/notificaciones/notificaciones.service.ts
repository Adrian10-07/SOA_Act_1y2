import { Injectable, Logger } from '@nestjs/common';

/**
 * Simula el envio de correo/WhatsApp del recordatorio.
 */
@Injectable()
export class NotificacionesService {
  private readonly log = new Logger(NotificacionesService.name);
  private readonly enviadas: { citaId: string; enviadoEn: string }[] = [];

  async enviarRecordatorio(citaId: string, fechaHora: string): Promise<void> {
    // Simulamos latencia de un proveedor externo (SMTP / Twilio).
    await new Promise((r) => setTimeout(r, 1500));
    const registro = { citaId, enviadoEn: new Date().toISOString() };
    this.enviadas.push(registro);
    this.log.log(
      `Recordatorio enviado para cita ${citaId} (fecha ${fechaHora}) — total enviadas: ${this.enviadas.length}`,
    );
  }

  historial() {
    return [...this.enviadas];
  }
}
