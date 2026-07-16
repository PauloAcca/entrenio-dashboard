import { Module } from '@nestjs/common';
import { GymNutritionController } from './gym-nutrition.controller';
import { GymNutritionService } from './gym-nutrition.service';

@Module({
  controllers: [GymNutritionController],
  providers: [GymNutritionService],
})
export class GymNutritionModule {}
