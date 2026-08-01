import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrearCitaDto } from './dto/crear-cita.dto';

export type EstadoCita =
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'EN_CONSULTA'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

export interface Cita {
  citaId: string;
  mascotaId: string;
  veterinarioId: string;
  fechaHora: string;
  motivo?: string;
  canal: string;
  estado: EstadoCita;
  precio: number;
}

@Injectable()
export class CitasService {
  private readonly citas = new Map<string, Cita>();
  private secuencia = 0;

  constructor(private readonly eventos: EventEmitter2) {}

  /** Crea una cita (patron sincrono: responde con el objeto ya creado). */
  crear(dto: CrearCitaDto): Cita {
    this.secuencia += 1;
    const cita: Cita = {
      citaId: `CIT-${String(this.secuencia).padStart(6, '0')}`,
      mascotaId: dto.mascotaId,
      veterinarioId: dto.veterinarioId,
      fechaHora: dto.fechaHora,
      motivo: dto.motivo,
      canal: dto.canal,
      estado: 'PROGRAMADA',
      precio: 450,
    };
    this.citas.set(cita.citaId, cita);

    // Patron ASINCRONO (Tarea 2b): publicamos el evento y respondemos ya.
    // El worker de notificaciones lo procesara en segundo plano.
    this.eventos.emit('cita.creada', {
      citaId: cita.citaId,
      mascotaId: cita.mascotaId,
      fechaHora: cita.fechaHora,
    });

    return cita;
  }

  buscar(citaId: string): Cita {
    const cita = this.citas.get(citaId);
    if (!cita) throw new NotFoundException(`Cita ${citaId} no existe`);
    return cita;
  }

  actualizarEstado(citaId: string, estado: EstadoCita): Cita {
    const cita = this.buscar(citaId);
    cita.estado = estado;
    return cita;
  }

  listar(): Cita[] {
    return Array.from(this.citas.values());
  }
}
