import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HorariosService } from '../horarios/horarios.service';
import { InventarioService } from '../inventario/inventario.service';
import { PagosService } from '../pagos/pagos.service';
import { CitasService } from '../citas/citas.service';
import { IniciarSagaDto } from './iniciar-saga.dto';

interface PasoLog {
  paso: string;
  estado: 'OK' | 'FALLO' | 'COMPENSADO';
  detalle?: string;
}

/**
 * Orquestador del patron SAGA (Tarea 2c).
 * Flujo hacia adelante:
 *   1) ReservarHorario
 *   2) ApartarInventarioVacuna
 *   3) CobrarPago         (sincrono)
 *   4) ConfirmarCita
 *
 * Compensaciones si el paso final falla (orden inverso):
 *   - ReembolsarPago
 *   - LiberarInventarioVacuna
 *   - LiberarHorario
 */
@Injectable()
export class SagaService {
  private readonly log = new Logger(SagaService.name);

  constructor(
    private readonly horarios: HorariosService,
    private readonly inventario: InventarioService,
    private readonly pagos: PagosService,
    private readonly citas: CitasService,
  ) {}

  async ejecutar(dto: IniciarSagaDto) {
    const sagaId = `SAGA-${Date.now()}`;
    const bitacora: PasoLog[] = [];
    this.log.log(`===== [${sagaId}] INICIO Saga =====`);

    let citaId: string | undefined;

    try {
      // ---- Paso 1: ReservarHorario ----
      this.horarios.reservar(sagaId, dto.veterinarioId, dto.fechaHora);
      bitacora.push({ paso: '1. ReservarHorario', estado: 'OK' });

      // ---- Paso 2: ApartarInventarioVacuna ----
      this.inventario.apartar(sagaId, dto.vacuna, 1);
      bitacora.push({ paso: '2. ApartarInventarioVacuna', estado: 'OK' });

      // ---- Paso 3: CobrarPago (SINCRONO) ----
      const cargoId = this.pagos.cobrar(sagaId, 450, dto.tarjetaTerminaEn);
      bitacora.push({ paso: '3. CobrarPago', estado: 'OK', detalle: cargoId });

      // ---- Paso 4: ConfirmarCita ----
      if (dto.forzarFalloConfirmacion) {
        throw new Error('Fallo simulado al confirmar la cita');
      }
      const cita = this.citas.crear({
        mascotaId: dto.mascotaId,
        veterinarioId: dto.veterinarioId,
        fechaHora: dto.fechaHora,
        canal: 'web',
        motivo: `Aplicacion de ${dto.vacuna}`,
      });
      this.citas.actualizarEstado(cita.citaId, 'CONFIRMADA');
      citaId = cita.citaId;
      bitacora.push({ paso: '4. ConfirmarCita', estado: 'OK', detalle: citaId });

      this.log.log(`===== [${sagaId}] Saga COMPLETADA =====`);
      return { sagaId, exito: true, citaId, bitacora };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : String(err);
      this.log.error(`[${sagaId}] Fallo -> iniciando compensaciones: ${mensaje}`);
      bitacora.push({ paso: 'FALLO', estado: 'FALLO', detalle: mensaje });

      // Compensaciones en ORDEN INVERSO
      this.pagos.reembolsar(sagaId);
      bitacora.push({ paso: 'COMP. ReembolsarPago', estado: 'COMPENSADO' });

      this.inventario.liberar(sagaId);
      bitacora.push({ paso: 'COMP. LiberarInventarioVacuna', estado: 'COMPENSADO' });

      this.horarios.liberar(sagaId);
      bitacora.push({ paso: 'COMP. LiberarHorario', estado: 'COMPENSADO' });

      this.log.warn(`===== [${sagaId}] Saga REVERTIDA =====`);

      const status = err instanceof HttpException ? err.getStatus() : 500;
      return { sagaId, exito: false, error: mensaje, status, bitacora };
    }
  }
}
