import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';

@ApiTags('notificaciones')
@Controller('api/v1/notificaciones')
export class NotificacionesController {
  constructor(private readonly notificaciones: NotificacionesService) {}

  @Get('historial')
  @ApiOperation({ summary: 'Ver recordatorios enviados por el worker asincrono' })
  historial() {
    return this.notificaciones.historial();
  }
}
