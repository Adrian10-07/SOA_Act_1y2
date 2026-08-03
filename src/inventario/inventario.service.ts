import { BadRequestException, Injectable, Logger } from '@nestjs/common';

/**
 * Servicio que aparta stock de vacunas para una cita.
 * Paso 2 de la Saga: ApartarInventarioVacuna.
 */
@Injectable()
export class InventarioService {
  private readonly log = new Logger(InventarioService.name);
  private stock = { vacunaTriple: 20, vacunaAntirrabica: 15 };
  private apartados = new Map<string, { producto: string; cantidad: number }>();

  apartar(sagaId: string, producto: keyof typeof this.stock, cantidad = 1): void {
    if ((this.stock[producto] ?? 0) < cantidad) {
      throw new BadRequestException(`Sin stock de ${producto}`);
    }
    this.stock[producto] -= cantidad;
    this.apartados.set(sagaId, { producto, cantidad });
    this.log.log(`[${sagaId}] Inventario apartado: ${cantidad} x ${producto}`);
  }

  /** Compensacion: LiberarInventarioVacuna */
  liberar(sagaId: string): void {
    const dato = this.apartados.get(sagaId);
    if (!dato) return;
    this.stock[dato.producto as keyof typeof this.stock] += dato.cantidad;
    this.apartados.delete(sagaId);
    this.log.warn(
      `[${sagaId}] COMPENSACION: inventario liberado (${dato.cantidad} x ${dato.producto})`,
    );
  }

  stockActual() {
    return { ...this.stock };
  }
}
