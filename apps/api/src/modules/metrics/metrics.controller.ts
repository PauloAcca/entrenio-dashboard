import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('most-used-machines')
  async getMostUsedMachines(@Query('gymId') gymId: string) {
    return this.metricsService.getMostUsedMachines(gymId);
  }

  @Get('user-goals')
  async getUserGoals(@Query('gymId') gymId: string) {
    return this.metricsService.getUserGoalsDistribution(gymId);
  }

  @Get('user-genders')
  async getUserGenders(@Query('gymId') gymId: string) {
    return this.metricsService.getUserGenderDistribution(gymId);
  }

  @Get('user-ages')
  async getUserAges(@Query('gymId') gymId: string) {
    return this.metricsService.getUserAgeDistribution(gymId);
  }

  @Get('popular-exercises')
  async getPopularExercises(@Query('gymId') gymId: string) {
    return this.metricsService.getMostPopularExercises(gymId);
  }
}
