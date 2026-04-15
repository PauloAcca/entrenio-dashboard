import { apiFetch } from "./http";

export interface ExerciseData {
    id: number;
    nameEs: string;
    primaryMuscleEs: string;
    equipmentType: string;
    videoUrl: string | null;
}

export async function searchExercises(query: string = "") {
    return apiFetch<ExerciseData[]>(`/exercises?q=${encodeURIComponent(query)}`);
}
