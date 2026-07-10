import { apiFetch } from "./http";

export interface ExerciseData {
    id: number;
    nameEs: string;
    primaryMuscleEs: string;
    equipmentType: string;
    videoUrl: string | null;
}

export async function searchExercises(query: string = "", muscle: string = "", equipment: string = "", gymId: string = "", onlyGymEquipment: boolean = false) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (muscle) params.append('muscle', muscle);
    if (equipment) params.append('equipment', equipment);
    if (gymId) params.append('gymId', gymId);
    if (onlyGymEquipment) params.append('onlyGymEquipment', 'true');
    
    return apiFetch<ExerciseData[]>(`/exercises?${params.toString()}`);
}
