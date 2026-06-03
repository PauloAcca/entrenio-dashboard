import { apiFetch } from "./http"

export type NoticeType = "info" | "warning"

export interface Notice {
    id: number;
    message: string;
    isActive: boolean;
    gymId?: string | null;
    type: NoticeType;
    createdAt: string;
    updatedAt: string;
}

export async function getGymNotice(gymId: string): Promise<Notice | null> {
    return apiFetch<Notice | null>(`/notices/gym?gymId=${gymId}`)
}

export async function setGymNotice(data: { gymId: string, message: string, type: string, isActive: boolean }): Promise<Notice> {
    return apiFetch<Notice>("/notices/gym", {
        method: "POST",
        body: JSON.stringify(data)
    })
}

export async function getGlobalNotice(secret: string): Promise<Notice | null> {
    return apiFetch<Notice | null>(`/notices/global?secret=${secret}`)
}

export async function setGlobalNotice(data: { message: string, type: string, isActive: boolean, secret: string }): Promise<Notice> {
    return apiFetch<Notice>("/notices/global", {
        method: "POST",
        body: JSON.stringify(data)
    })
}
