import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

class PagoRechazadoException extends HttpException {
  constructor(msg = 'Pago rechazado') {
    super(msg, HttpStatus.PAYMENT_REQUIRED); // 402
  }
}

/**
 * Servicio que simula el cobro con tarjeta.
 * Paso 3 de la Saga: CobrarPago (SINCRONO: necesita confirmacion en tiempo real).
 */
@Injectable()
export class PagosService {
  private readonly log = new Logger(PagosService.name);
  private readonly cargos = new Map<string, { monto: number }>();

  cobrar(sagaId: string, monto: number, tarjetaTerminaEn: string): string {
    // Simulacion: si la tarjeta termina en "0000" se rechaza.
    if (tarjetaTerminaEn === '0000') {
      this.log.error(`[${sagaId}] Pago RECHAZADO por el banco`);
      throw new PagoRechazadoException('Tarjeta rechazada por el banco');
    }
    const cargoId = `CHG-${Date.now()}`;
    this.cargos.set(sagaId, { monto });
    this.log.log(`[${sagaId}] Pago aprobado: ${cargoId} por $${monto}`);
    return cargoId;
  }

  /** Compensacion: ReembolsarPago */
  reembolsar(sagaId: string): void {
    const dato = this.cargos.get(sagaId);
    if (!dato) return;
    this.cargos.delete(sagaId);
    this.log.warn(`[${sagaId}] COMPENSACION: pago reembolsado ($${dato.monto})`);
  }
}
