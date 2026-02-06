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

export async function getAllMachineTemplates() {
    return apiFetch<machineTemplate[]>(`/machines/templates`)
}

export async function addMachine(templateId: number, gymId: string) {
    return apiFetch<void>(`/machines`, {
        method: 'POST',
        body: JSON.stringify({ templateId: templateId.toString(), gymId })
    })
}

export async function updateMachine(id: string, gymId: string, data: { location?: string, isActive?: boolean }) {
    return apiFetch<void>(`/machines/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ gymId, ...data })
    })
}
