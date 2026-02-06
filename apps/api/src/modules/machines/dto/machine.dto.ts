
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
    qrCode: string | null;
}

export class MachineResponseDto {
    id: number;
    gymId: string;
    machineTemplateId: number | null;
    location: string | null;
    isActive: boolean;
    createdAt: Date;
    machine_template?: MachineTemplateDto | null;
}
