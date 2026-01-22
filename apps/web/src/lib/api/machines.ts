import { apiFetch } from "./http";
import { equipment } from "../../types/entities";
import { useAuthStore } from "../../store/authStore";

export async function getMachines() {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<{ machines: equipment[] }>(`/machines?gymId=${gymId}`)
}