import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import type {
  CrearReglaItinerarioDTO,
  ActualizarReglaItinerarioDTO,
  ReglaItinerarioResponseDTO,
} from '@ports/inbound/regla-itinerario.dto.js';
import { CrearReglaItinerarioUseCase } from '@core/use-cases/crear-regla-itinerario.use-case.js';
import { ActualizarReglaItinerarioUseCase } from '@core/use-cases/actualizar-regla-itinerario.use-case.js';
import { CambiarEstadoReglaItinerarioUseCase } from '@core/use-cases/cambiar-estado-regla-itinerario.use-case.js';
import { ListarReglasItinerarioUseCase } from '@core/use-cases/listar-reglas-itinerario.use-case.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidItineraryRuleException } from '@core/domain/exceptions/invalid-itinerary-rule.exception.js';

@Controller('api/itinerarios/reglas')
export class ReglasItinerarioController {
  constructor(
    @Inject('CrearReglaItinerarioUseCase')
    private readonly crearUseCase: CrearReglaItinerarioUseCase,
    @Inject('ActualizarReglaItinerarioUseCase')
    private readonly actualizarUseCase: ActualizarReglaItinerarioUseCase,
    @Inject('CambiarEstadoReglaItinerarioUseCase')
    private readonly cambiarEstadoUseCase: CambiarEstadoReglaItinerarioUseCase,
    @Inject('ListarReglasItinerarioUseCase')
    private readonly listarUseCase: ListarReglasItinerarioUseCase,
  ) {}

  @Get()
  public async listar(
    @Query('rutaId') rutaId?: string,
    @Query('tipoAplicacion') tipoAplicacion?: string,
    @Query('activo') activoStr?: string,
  ): Promise<ReglaItinerarioResponseDTO[]> {
    try {
      let activo: boolean | undefined = undefined;
      if (activoStr === 'true') activo = true;
      if (activoStr === 'false') activo = false;

      return await this.listarUseCase.execute({
        rutaId,
        tipoAplicacion,
        activo,
      });
    } catch (err: any) {
      this.handleError(err);
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async crear(
    @Body() dto: CrearReglaItinerarioDTO,
  ): Promise<ReglaItinerarioResponseDTO> {
    try {
      return await this.crearUseCase.execute(dto);
    } catch (err: any) {
      this.handleError(err);
    }
  }

  @Put(':id')
  public async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarReglaItinerarioDTO,
  ): Promise<ReglaItinerarioResponseDTO> {
    try {
      return await this.actualizarUseCase.execute(id, dto);
    } catch (err: any) {
      this.handleError(err);
    }
  }

  @Patch(':id/estado')
  @HttpCode(HttpStatus.OK)
  public async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { activo: boolean },
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (typeof body.activo !== 'boolean') {
        throw new BadRequestException('El campo "activo" debe ser un booleano.');
      }
      await this.cambiarEstadoUseCase.execute(id, body.activo);
      return {
        success: true,
        message: `Regla ${id} ${body.activo ? 'activada' : 'desactivada'} correctamente.`,
      };
    } catch (err: any) {
      this.handleError(err);
    }
  }

  private handleError(err: any): never {
    if (err instanceof EntityNotFoundException) {
      throw new NotFoundException(err.message);
    }
    if (err instanceof InvalidItineraryRuleException) {
      throw new BadRequestException(err.message);
    }
    if (err instanceof BadRequestException || err instanceof NotFoundException) {
      throw err;
    }
    throw new BadRequestException(err.message || 'Error inesperado al procesar la solicitud.');
  }
}
