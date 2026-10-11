import {
  Controller,
  Get,
  Post,
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
  ViajeDetalleAdminDTO,
  CambiarEstadoViajeDTO,
} from '@ports/inbound/admin-viajes.dto.js';
import { ConsultarViajesPorFechaUseCase } from '@core/use-cases/consultar-viajes-por-fecha.use-case.js';
import { InicializarViajesFechaUseCase } from '@core/use-cases/inicializar-viajes-fecha.use-case.js';
import { CambiarEstadoViajeUseCase } from '@core/use-cases/cambiar-estado-viaje.use-case.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidTripStatusTransitionException } from '@core/domain/exceptions/invalid-trip-status-transition.exception.js';

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/admin/viajes')
export class AdminViajesController {
  constructor(
    @Inject('ConsultarViajesPorFechaUseCase')
    private readonly consultarViajesUseCase: ConsultarViajesPorFechaUseCase,
    @Inject('InicializarViajesFechaUseCase')
    private readonly inicializarViajesUseCase: InicializarViajesFechaUseCase,
    @Inject('CambiarEstadoViajeUseCase')
    private readonly cambiarEstadoUseCase: CambiarEstadoViajeUseCase,
  ) {}

  @Get()
  public async consultarPorFecha(
    @Query('fecha') fecha?: string,
  ): Promise<ViajeDetalleAdminDTO[]> {
    try {
      const fechaConsulta = fecha?.trim() || this.getFechaHoyISO();
      if (!FECHA_REGEX.test(fechaConsulta)) {
        throw new BadRequestException(
          `Formato de fecha inválido. Se espera YYYY-MM-DD. Valor recibido: ${fecha}`,
        );
      }
      return await this.consultarViajesUseCase.execute(fechaConsulta);
    } catch (err: any) {
      this.handleError(err);
    }
  }

  @Post('inicializar')
  @HttpCode(HttpStatus.OK)
  public async inicializarViajes(
    @Body() body: { fecha?: string },
  ): Promise<ViajeDetalleAdminDTO[]> {
    try {
      const fecha = body?.fecha?.trim() || this.getFechaHoyISO();
      if (!FECHA_REGEX.test(fecha)) {
        throw new BadRequestException(
          `Formato de fecha inválido. Se espera YYYY-MM-DD. Valor recibido: ${body?.fecha}`,
        );
      }
      return await this.inicializarViajesUseCase.execute(fecha);
    } catch (err: any) {
      this.handleError(err);
    }
  }

  @Patch(':id/estado')
  @HttpCode(HttpStatus.OK)
  public async cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoViajeDTO,
  ): Promise<ViajeDetalleAdminDTO> {
    try {
      if (!dto.nuevoEstado) {
        throw new BadRequestException('El campo "nuevoEstado" es requerido.');
      }
      return await this.cambiarEstadoUseCase.execute(id, dto);
    } catch (err: any) {
      this.handleError(err);
    }
  }

  private getFechaHoyISO(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private handleError(err: any): never {
    if (err instanceof EntityNotFoundException) {
      throw new NotFoundException(err.message);
    }
    if (err instanceof InvalidTripStatusTransitionException) {
      throw new BadRequestException(err.message);
    }
    if (err instanceof BadRequestException || err instanceof NotFoundException) {
      throw err;
    }
    throw new BadRequestException(
      err.message || 'Error inesperado al procesar la solicitud.',
    );
  }
}
