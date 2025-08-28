import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🗄️  Base de datos conectada exitosamente');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Métodos de utilidad para soft delete
  async softDelete(model: any, id: number) {
    return model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Filtro para excluir registros eliminados
  excludeDeleted<T>(query: T): T & { where: { deletedAt: null } } {
    return {
      ...query,
      where: {
        ...(query as any)?.where,
        deletedAt: null,
      },
    };
  }
}
