export interface equipment {
    id: string;
    gymId: string;
    machineTemplateId: number;
    name: string;
    location: string;
    description: string;
    qrCode: string;
    isActive: boolean;
    createdAt: Date;
}

export interface machineTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    createdAt: Date;
    slug: string;
    bodyRegion: string;
    is_active: boolean;
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
}
