
export class MachineTemplateDto {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    imageUrl: string | null;
    slug: string;
    body_region: string | null;
    is_active: boolean;
    createdAt: Date;
}

export class MachineResponseDto {
    id: number;
    gymId: string;
    machineTemplateId: number | null;
    name: string;
    location: string | null;
    description: string | null;
    qrCode: string;
    isActive: boolean;
    createdAt: Date;
    machine_template?: MachineTemplateDto | null;
}
