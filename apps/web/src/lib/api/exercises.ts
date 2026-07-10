import { apiFetch } from "./http";

export interface ExerciseData {
    id: number;
    nameEs: string;
    primaryMuscleEs: string;
    equipmentType: string;
    videoUrl: string | null;
}

export async function searchExercises(query: string = "", muscle: string = "", equipment: string = "") {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (muscle) params.append('muscle', muscle);
    if (equipment) params.append('equipment', equipment);
    
    return apiFetch<ExerciseData[]>(`/exercises?${params.toString()}`);
}
