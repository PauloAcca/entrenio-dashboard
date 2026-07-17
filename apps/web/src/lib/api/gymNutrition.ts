import { apiFetch } from "./http";
import { useAuthStore } from "../../store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GymRecipeIngredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  optional: boolean;
  order: number;
}

export interface GymRecipe {
  id: string;
  gymId: string;
  title: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  prepTimeMinutes: number | null;
  servings: number | null;
  imageUrl: string | null;
  mealType: string | null;
  notes: string | null;
  ingredients: GymRecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export interface GlobalRecipeSummary {
  id: string;
  title: string;
  slug: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  prepTimeMinutes: number | null;
  imageUrl: string | null;
  mealType: string | null;
  dietTags?: string[];
}

export interface GymNutritionPlanMeal {
  id: string;
  dayId: string;
  mealType: string;
  order: number;
  title: string | null;
  description: string | null;
  customCalories: number | null;
  customProtein: number | null;
  customCarbs: number | null;
  customFats: number | null;
  recipeId: string | null;
  recipe: GlobalRecipeSummary | null;
  gymRecipeId: string | null;
  gymRecipe: GymRecipe | null;
  notes: string | null;
}

export interface GymNutritionPlanDay {
  id: string;
  planId: string;
  dayNumber: number;
  dayLabel: string;
  notes: string | null;
  meals: GymNutritionPlanMeal[];
}

export interface GymNutritionPlan {
  id: string;
  gymId: string;
  userId: number;
  title: string;
  description: string | null;
  notes: string | null;
  status: "draft" | "active" | "archived";
  startsAt: string | null;
  endsAt: string | null;
  days: GymNutritionPlanDay[];
  createdAt: string;
  updatedAt: string;
}

// ─── Gym Recipe API ───────────────────────────────────────────────────────────

export async function getGymRecipes(): Promise<GymRecipe[]> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymRecipe[] }>(`/gym-nutrition-plans/gym-recipes?gymId=${gymId}`);
  return res.data;
}

export async function createGymRecipe(payload: Omit<GymRecipe, "id" | "gymId" | "createdAt" | "updatedAt"> & { ingredients?: Partial<GymRecipeIngredient>[] }): Promise<GymRecipe> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymRecipe }>(`/gym-nutrition-plans/gym-recipes`, {
    method: "POST",
    body: JSON.stringify({ ...payload, gymId }),
  });
  return res.data;
}

export async function updateGymRecipe(recipeId: string, payload: Partial<GymRecipe> & { ingredients?: Partial<GymRecipeIngredient>[] }): Promise<GymRecipe> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymRecipe }>(`/gym-nutrition-plans/gym-recipes/${recipeId}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, gymId }),
  });
  return res.data;
}

export async function deleteGymRecipe(recipeId: string): Promise<void> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  await apiFetch<void>(`/gym-nutrition-plans/gym-recipes/${recipeId}?gymId=${gymId}`, { method: "DELETE" });
}

// ─── Nutrition Plans API ──────────────────────────────────────────────────────

export async function getNutritionPlans(): Promise<GymNutritionPlan[]> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymNutritionPlan[] }>(`/gym-nutrition-plans?gymId=${gymId}`);
  return res.data;
}

export async function getNutritionPlan(planId: string): Promise<GymNutritionPlan> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymNutritionPlan }>(`/gym-nutrition-plans/${planId}?gymId=${gymId}`);
  return res.data;
}

export async function createNutritionPlan(payload: {
  userId: number;
  title: string;
  description?: string;
  notes?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  days?: Partial<GymNutritionPlanDay>[];
}): Promise<GymNutritionPlan> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymNutritionPlan }>(`/gym-nutrition-plans`, {
    method: "POST",
    body: JSON.stringify({ ...payload, gymId }),
  });
  return res.data;
}

export async function updateNutritionPlan(planId: string, payload: Partial<GymNutritionPlan>): Promise<GymNutritionPlan> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  const res = await apiFetch<{ data: GymNutritionPlan }>(`/gym-nutrition-plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, gymId }),
  });
  return res.data;
}

export async function deleteNutritionPlan(planId: string): Promise<void> {
  const gymId = useAuthStore.getState().gym?.id;
  if (!gymId) throw new Error("No Gym ID");
  await apiFetch<void>(`/gym-nutrition-plans/${planId}?gymId=${gymId}`, { method: "DELETE" });
}

// ─── Global Recipes Search (for picker) ──────────────────────────────────────

export interface GlobalRecipeDetail extends GlobalRecipeSummary {
  ingredients: {
    id: string;
    name: string;
    quantity: number | null;
    unit: string | null;
    optional: boolean;
  }[];
  steps: {
    id: string;
    stepNumber: number;
    description: string;
    title: string | null;
  }[];
}

export async function searchGlobalRecipes(search: string, limit = 20, diet = ""): Promise<GlobalRecipeSummary[]> {
  const query = new URLSearchParams({ search, limit: limit.toString() });
  if (diet) query.append("diet", diet);
  const res = await apiFetch<{ data: GlobalRecipeSummary[] }>(`/gym-nutrition-plans/global-recipes?${query.toString()}`);
  return res.data ?? [];
}

export async function getGlobalRecipe(id: string): Promise<GlobalRecipeDetail> {
  return await apiFetch<GlobalRecipeDetail>(`/gym-nutrition-plans/global-recipes/${id}`);
}
