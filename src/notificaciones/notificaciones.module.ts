import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesListener } from './notificaciones.listener';
import { NotificacionesController } from './notificaciones.controller';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService, NotificacionesListener],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
