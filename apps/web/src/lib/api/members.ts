import { apiFetch } from "./http";
import { membership, user } from "../../types/entities";
import { useAuthStore } from "../../store/authStore";

export async function getAppMembers() {
    const gymId = useAuthStore.getState().gym?.id;
    return apiFetch<(membership & { user: user })[]>(`/members?gymId=${gymId}`)
}

export async function uploadMembersCsv(file: File) {
    const gymId = useAuthStore.getState().gym?.id;
    if (!gymId) throw new Error("No Gym ID");
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('gymId', gymId);

    // Using fetch directly or extending apiFetch to handle FormData if needed.
    // Assuming apiFetch might json stringify body, let's look at apiFetch if possible, but for now standard fetch with token is safer if apiFetch is rigid. 
    // Wait, let's rely on apiFetch if it supports FormData or just use what we have.
    // The previous view of members.ts imports apiFetch.
    // Let's assume apiFetch handles headers. If it sets Content-Type to application/json automatically, it breaks buffer upload.
    // Let's check apiFetch.
    return apiFetch<any>('/members/upload-csv', {
        method: 'POST',
        body: formData,
    });
}

