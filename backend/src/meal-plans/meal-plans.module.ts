import { Module } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansRepository } from './meal-plans.repository';

@Module({
  controllers: [MealPlansController],
  providers: [MealPlansService, MealPlansRepository],
  exports: [MealPlansService, MealPlansRepository],
})
export class MealPlansModule {}
