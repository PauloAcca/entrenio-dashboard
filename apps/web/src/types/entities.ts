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
    address: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
}
