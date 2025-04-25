import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [PrismaModule, MenuModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
