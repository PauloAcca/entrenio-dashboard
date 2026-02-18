import { apiFetch } from "./http"

export interface MachineUsageMetric {
    id: number
    name: string
    usageCount: number
    imageUrl: string | null
    category: string
}

export async function getMostUsedMachines(): Promise<MachineUsageMetric[]> {
    return apiFetch<MachineUsageMetric[]>("/metrics/most-used-machines")
}

export async function getMostUsedMachinesWithGymId(gymId: string): Promise<MachineUsageMetric[]> {
    return apiFetch<MachineUsageMetric[]>(`/metrics/most-used-machines?gymId=${gymId}`)
}
export interface UserGoalMetric {
    goal: string;
    count: number;
    percentage: number;
}

export async function getUserGoalsDistribution(gymId: string): Promise<UserGoalMetric[]> {
    return apiFetch<UserGoalMetric[]>(`/metrics/user-goals?gymId=${gymId}`)
}

export interface UserGenderMetric {
    gender: string;
    count: number;
    percentage: number;
}

export async function getUserGenderDistribution(gymId: string): Promise<UserGenderMetric[]> {
    return apiFetch<UserGenderMetric[]>(`/metrics/user-genders?gymId=${gymId}`)
}

export interface UserAgeMetric {
    range: string;
    count: number;
    percentage: number;
}

export async function getUserAgeDistribution(gymId: string): Promise<UserAgeMetric[]> {
    return apiFetch<UserAgeMetric[]>(`/metrics/user-ages?gymId=${gymId}`)
}

export interface PopularExerciseMetric {
    name: string;
    count: number;
    percentage: number;
}

export async function getMostPopularExercises(gymId: string): Promise<PopularExerciseMetric[]> {
    return apiFetch<PopularExerciseMetric[]>(`/metrics/popular-exercises?gymId=${gymId}`)
}

export interface AverageWorkoutDurationMetric {
    averageMinutes: number;
}

export async function getAverageWorkoutDuration(gymId: string): Promise<AverageWorkoutDurationMetric> {
    return apiFetch<AverageWorkoutDurationMetric>(`/metrics/average-workout-duration?gymId=${gymId}`)
}

export interface AverageWorkoutDurationByAgeMetric {
    range: string;
    averageMinutes: number;
}

export async function getAverageWorkoutDurationByAge(gymId: string): Promise<AverageWorkoutDurationByAgeMetric[]> {
    return apiFetch<AverageWorkoutDurationByAgeMetric[]>(`/metrics/average-workout-duration-by-age?gymId=${gymId}`)
}

