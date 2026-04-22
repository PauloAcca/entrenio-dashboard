export interface equipment {
    id: string;
    gymId: string;
    machineTemplateId: number;
    location: string;
    isActive: boolean;
    createdAt: Date;
    machine_template?: machineTemplate;
}

export interface machineTemplate {
    id: number;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    createdAt: Date;
    slug: string;
    bodyRegion: string;
    is_active: boolean;
    qrCode: string;
}

export interface Gym {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    sheet_url: string;
    auto_sync_enabled: boolean;
    last_sync_at: Date;
    last_sync_status: string;
    last_sync_error: string;
    logo_url: string;
    plan: string;
}

export interface membership {
    id: string;
    gym_id: string;
    user_id: number | null;
    starts_at: string | null;
    ends_at: string | null;
    external_member_id?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface user {
    id: number | null;
    email: string | null;
    email_verified: boolean;
    name?: string | null;
    phone?: string | null;
    dni?: string | null;
    avatarUrl?: string | null;
    claimed_at?: string | null;
    created_at: string;
    updated_at: string;
}
