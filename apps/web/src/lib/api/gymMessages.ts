import { apiFetch } from "./http";
import { useAuthStore } from "../../store/authStore";

export interface GymMessage {
    id: number;
    message: string;
    category: string;
    gymId: string;
    userId: number | null;
    createdAt: string;
    user?: {
        id: number;
        email: string;
        name?: string;
        avatarUrl?: string;
    } | null;
}

export async function getGymMessages(): Promise<GymMessage[]> {
    const gymId = useAuthStore.getState().gym?.id;
    if (!gymId) return [];
    return apiFetch<GymMessage[]>(`/feedback/gym-messages/${gymId}`);
}
