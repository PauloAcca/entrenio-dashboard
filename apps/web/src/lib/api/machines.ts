import { apiFetch } from "./http";
import { equipment, machineTemplate } from "../../types/entities";
import { useAuthStore } from "../../store/authStore";

export async function getGymMachines() {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<{ machines: equipment[] & { machine_template: machineTemplate } }>(`/machines?gymId=${gymId}`)
}

export async function getGymMachineTemplate(id: string) {
    return apiFetch<equipment & { machine_template: machineTemplate }>(`/machines/${id}`)
}
