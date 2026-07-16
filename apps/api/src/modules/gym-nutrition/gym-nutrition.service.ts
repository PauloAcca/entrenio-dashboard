import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class GymNutritionService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Gym Recipes ────────────────────────────────────────────────────────────

  async getGymRecipes(gymId: string) {
    return this.prisma.gym_recipes.findMany({
      where: { gymId },
      include: {
        ingredients: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchGlobalRecipes(search: string, limit: number = 20) {
    return this.prisma.recipes.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        calories: true,
        protein: true,
        carbs: true,
        fats: true,
        prepTimeMinutes: true,
        mealType: true,
      },
    });
  }

  async createGymRecipe(gymId: string, data: any) {
    const { ingredients, ...recipeData } = data;
    return this.prisma.gym_recipes.create({
      data: {
        gymId,
        ...recipeData,
        ingredients: {
          create: ingredients?.map((ing: any, i: number) => ({
            name: ing.name,
            quantity: ing.quantity ? Number(ing.quantity) : null,
            unit: ing.unit,
            optional: ing.optional || false,
            order: ing.order ?? i,
          })) || [],
        },
      },
      include: { ingredients: true },
    });
  }

  async updateGymRecipe(gymId: string, recipeId: string, data: any) {
    const recipe = await this.prisma.gym_recipes.findFirst({
      where: { id: recipeId, gymId },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const { ingredients, ...recipeData } = data;

    // To update ingredients, we delete old ones and create new ones (simplest approach)
    if (ingredients) {
      await this.prisma.gym_recipe_ingredients.deleteMany({
        where: { gymRecipeId: recipeId },
      });
    }

    return this.prisma.gym_recipes.update({
      where: { id: recipeId },
      data: {
        ...recipeData,
        ...(ingredients
          ? {
              ingredients: {
                create: ingredients.map((ing: any, i: number) => ({
                  name: ing.name,
                  quantity: ing.quantity ? Number(ing.quantity) : null,
                  unit: ing.unit,
                  optional: ing.optional || false,
                  order: ing.order ?? i,
                })),
              },
            }
          : {}),
      },
      include: { ingredients: true },
    });
  }

  async deleteGymRecipe(gymId: string, recipeId: string) {
    const recipe = await this.prisma.gym_recipes.findFirst({
      where: { id: recipeId, gymId },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');

    return this.prisma.gym_recipes.delete({
      where: { id: recipeId },
    });
  }

  // ─── Nutrition Plans ────────────────────────────────────────────────────────

  async findAllPlansByGym(gymId: string) {
    return this.prisma.gym_nutrition_plans.findMany({
      where: { gymId },
      include: {
        days: {
          include: {
            meals: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findPlanById(gymId: string, planId: string) {
    const plan = await this.prisma.gym_nutrition_plans.findFirst({
      where: { id: planId, gymId },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            meals: {
              orderBy: { order: 'asc' },
              include: {
                recipe: true,
                gymRecipe: {
                  include: { ingredients: true },
                },
              },
            },
          },
        },
      },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async createPlan(gymId: string, data: any) {
    const { days, ...planData } = data;

    // Check for active status conflict
    if (planData.status === 'active' && planData.userId) {
      await this.prisma.gym_nutrition_plans.updateMany({
        where: { userId: planData.userId, status: 'active', gymId },
        data: { status: 'archived' },
      });
    }

    return this.prisma.gym_nutrition_plans.create({
      data: {
        ...planData,
        gymId,
        days: {
          create: days?.map((day: any) => ({
            dayNumber: day.dayNumber,
            dayLabel: day.dayLabel,
            notes: day.notes,
            meals: {
              create: day.meals?.map((meal: any) => ({
                mealType: meal.mealType,
                order: meal.order,
                title: meal.title,
                description: meal.description,
                customCalories: meal.customCalories,
                customProtein: meal.customProtein,
                customCarbs: meal.customCarbs,
                customFats: meal.customFats,
                notes: meal.notes,
                recipeId: meal.recipeId,
                gymRecipeId: meal.gymRecipeId,
              })) || [],
            },
          })) || [],
        },
      },
    });
  }

  async updatePlan(gymId: string, planId: string, data: any) {
    const plan = await this.prisma.gym_nutrition_plans.findFirst({
      where: { id: planId, gymId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const { days, ...planData } = data;

    if (planData.status === 'active' && planData.userId) {
      await this.prisma.gym_nutrition_plans.updateMany({
        where: { 
          userId: planData.userId, 
          status: 'active', 
          gymId,
          id: { not: planId } 
        },
        data: { status: 'archived' },
      });
    }

    if (days) {
      // Simplest update: delete old days/meals and recreate
      await this.prisma.gym_nutrition_plan_days.deleteMany({
        where: { planId },
      });
    }

    return this.prisma.gym_nutrition_plans.update({
      where: { id: planId },
      data: {
        ...planData,
        ...(days
          ? {
              days: {
                create: days.map((day: any) => ({
                  dayNumber: day.dayNumber,
                  dayLabel: day.dayLabel,
                  notes: day.notes,
                  meals: {
                    create: day.meals?.map((meal: any) => ({
                      mealType: meal.mealType,
                      order: meal.order,
                      title: meal.title,
                      description: meal.description,
                      customCalories: meal.customCalories,
                      customProtein: meal.customProtein,
                      customCarbs: meal.customCarbs,
                      customFats: meal.customFats,
                      notes: meal.notes,
                      recipeId: meal.recipeId,
                      gymRecipeId: meal.gymRecipeId,
                    })) || [],
                  },
                })),
              },
            }
          : {}),
      },
    });
  }

  async deletePlan(gymId: string, planId: string) {
    const plan = await this.prisma.gym_nutrition_plans.findFirst({
      where: { id: planId, gymId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    return this.prisma.gym_nutrition_plans.delete({
      where: { id: planId },
    });
  }
}
