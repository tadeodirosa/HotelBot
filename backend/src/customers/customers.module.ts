import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomerRepository } from './customers.repository';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerRepository],
  exports: [CustomersService, CustomerRepository],
})
export class CustomersModule {}
