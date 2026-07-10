import { apiFetch } from "./http";
import { membership, user } from "../../types/entities";
import { useAuthStore } from "../../store/authStore";

export async function getAppMembers() {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<(membership & { user: user })[]>(`/members?gymId=${gymId}`)
}

export async function getMemberRoutine(userId: number) {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<any>(`/members/${userId}/routine?gymId=${gymId}`);
}

export async function getMemberProfile(userId: number) {
    return apiFetch<any>(`/members/${userId}/profile`);
}

export async function updateMemberRoutineExercises(
    userId: number, 
    payload: {
        updates: any[],
        adds: any[],
        removes: number[]
    }
) {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<any>(`/members/${userId}/routine/exercises`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gymId, ...payload }),
    });
}

export async function createMemberRoutine(userId: number, payload: {
    name: string;
    goal?: string;
    intensity?: string;
    days_per_week: number;
    session_duration?: number;
    description?: string;
    sessions: {
        day_label: string;
        focus?: string;
        order: number;
        exercises: {
            name: string;
            exerciseId?: number;
            sets: number;
            reps: string;
            rest?: string;
            order: number;
        }[];
    }[];
}) {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<any>(`/members/${userId}/routine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, ...payload }),
    });
}

export async function upsertMemberProfile(userId: number, payload: {
    experiencia?: string;
    dias?: number;
    tiempo?: number;
    enfoque?: string;
    intensidad?: string;
    lesion?: string;
    fechaNacimiento?: string;
    sexo?: string;
    peso?: number;
    altura?: number;
    objetivo?: string;
    nombre?: string;
    actividad?: string;
}) {
    return apiFetch<any>(`/members/${userId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export async function uploadMembersCsv(file: File) {
    const gymId = useAuthStore.getState().gym?.id;
    if (!gymId) throw new Error("No Gym ID");
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('gymId', gymId);

    return apiFetch<any>('/members/upload-csv', {
        method: 'POST',
        body: formData,
    });
}

