import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SagaService } from './saga.service';
import { IniciarSagaDto } from './iniciar-saga.dto';

@ApiTags('saga')
@Controller('api/v1/saga')
export class SagaController {
  constructor(private readonly saga: SagaService) {}

  @Post('agendar-y-cobrar')
  @ApiOperation({
    summary: 'Ejecuta la Saga completa (Tarea 2c)',
    description:
      'Pasos: ReservarHorario -> ApartarInventarioVacuna -> CobrarPago -> ConfirmarCita. ' +
      'Si algun paso falla, ejecuta las compensaciones en orden inverso. ' +
      'Envia "tarjetaTerminaEn"="0000" para simular el rechazo del pago, o ' +
      '"forzarFalloConfirmacion"=true para simular el fallo del ultimo paso.',
  })
  @ApiResponse({ status: 201, description: 'Saga completada u orquestada con compensaciones.' })
  async iniciar(@Body() dto: IniciarSagaDto) {
    return this.saga.ejecutar(dto);
  }
}
