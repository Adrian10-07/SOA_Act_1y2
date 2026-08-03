import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CitasModule } from './citas/citas.module';
import { SagaModule } from './saga/saga.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { HorariosModule } from './horarios/horarios.module';
import { InventarioModule } from './inventario/inventario.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    // EventEmitter sirve como "cola" en memoria para el patron asincrono (Tarea 2b)
    EventEmitterModule.forRoot(),
    CitasModule,
    SagaModule,
    NotificacionesModule,
    HorariosModule,
    InventarioModule,
    PagosModule,
  ],
})
export class AppModule {}
