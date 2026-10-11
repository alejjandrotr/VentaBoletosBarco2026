import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ItinerariosModule } from './modules/itinerarios.module.js';
import { AdminViajesModule } from './modules/admin-viajes.module.js';

@Module({
  imports: [ItinerariosModule, AdminViajesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

