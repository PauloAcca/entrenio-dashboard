import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { GymNutritionService } from './gym-nutrition.service';

@Controller('gym-nutrition-plans')
export class GymNutritionController {
  constructor(private readonly service: GymNutritionService) {}

  // ─── Gym Recipes ────────────────────────────────────────────────────────────

  @Get('gym-recipes')
  async getGymRecipes(@Query('gymId') gymId: string) {
    if (!gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.getGymRecipes(gymId) };
  }

  @Get('global-recipes')
  async searchGlobalRecipes(@Query('search') search: string, @Query('limit') limit: string, @Query('diet') diet: string) {
    const l = limit ? parseInt(limit, 10) : 20;
    return { data: await this.service.searchGlobalRecipes(search || '', l, diet || undefined) };
  }

  @Post('gym-recipes')
  async createGymRecipe(@Body() data: any) {
    if (!data.gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.createGymRecipe(data.gymId, data) };
  }

  @Put('gym-recipes/:id')
  async updateGymRecipe(@Param('id') id: string, @Body() data: any) {
    if (!data.gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.updateGymRecipe(data.gymId, id, data) };
  }

  @Delete('gym-recipes/:id')
  async deleteGymRecipe(@Param('id') id: string, @Query('gymId') gymId: string) {
    if (!gymId) throw new BadRequestException('gymId required');
    await this.service.deleteGymRecipe(gymId, id);
    return { success: true };
  }

  // ─── Nutrition Plans ────────────────────────────────────────────────────────

  @Get()
  async getAllPlans(@Query('gymId') gymId: string) {
    if (!gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.findAllPlansByGym(gymId) };
  }

  @Post()
  async createPlan(@Body() data: any) {
    if (!data.gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.createPlan(data.gymId, data) };
  }

  @Get(':id')
  async getPlan(@Param('id') id: string, @Query('gymId') gymId: string) {
    if (!gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.findPlanById(gymId, id) };
  }

  @Put(':id')
  async updatePlan(@Param('id') id: string, @Body() data: any) {
    if (!data.gymId) throw new BadRequestException('gymId required');
    return { data: await this.service.updatePlan(data.gymId, id, data) };
  }

  @Delete(':id')
  async deletePlan(@Param('id') id: string, @Query('gymId') gymId: string) {
    if (!gymId) throw new BadRequestException('gymId required');
    await this.service.deletePlan(gymId, id);
    return { success: true };
  }
}
