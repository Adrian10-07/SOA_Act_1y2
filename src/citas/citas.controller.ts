import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CitasService, Cita } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';

@ApiTags('citas')
@Controller('api/v1/citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear una cita (patron sincrono directo)',
    description:
      'Crea una cita y responde 201 con el objeto. Ademas emite el evento ' +
      '"cita.creada" para que el worker asincrono envie el recordatorio (Tarea 2b).',
  })
  @ApiResponse({ status: 201, description: 'Cita creada.' })
  @ApiResponse({ status: 400, description: 'Datos invalidos (class-validator).' })
  @ApiResponse({ status: 409, description: 'Conflicto de horario.' })
  crear(@Body() dto: CrearCitaDto): Cita {
    return this.citasService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las citas' })
  listar(): Cita[] {
    return this.citasService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una cita por id' })
  detalle(@Param('id') id: string): Cita {
    return this.citasService.buscar(id);
  }
}
