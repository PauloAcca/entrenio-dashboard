import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { MachineResponseDto, MachineTemplateDto } from "./dto/machine.dto";

@Injectable()
export class MachinesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAllByGymId(gymId: string): Promise<MachineResponseDto[]> {
        return this.prisma.equipment.findMany({
            where: {
                gymId: gymId
            },
            include: {
                machine_template: true
            }
        });
    }

    async findById(id: number): Promise<MachineResponseDto | null> {
        return this.prisma.equipment.findUnique({
            where: {
                id: id
            },
            include: {
                machine_template: true
            }
        });
    }

    async findAllMachineTemplates(): Promise<MachineTemplateDto[]> {
        return this.prisma.machine_template.findMany({
            include: {
                equipment: true
            }
        });
    }

    async addMachine(templateId: string, gymId: string) {
        const parsedTemplateId = parseInt(templateId);
        // Prevent duplicate addition
        const existing = await this.prisma.equipment.findFirst({
            where: {
                machineTemplateId: parsedTemplateId,
                gymId
            }
        });
        if (existing) {
            throw new Error("Machine already exists in this gym");
        }

        return this.prisma.equipment.create({
            data: {
                machineTemplateId: parsedTemplateId,
                gymId,
                location: "",
                isActive: true
            }
        });
    }

    async addMachinesBulk(templateIds: string[], gymId: string) {
        const parsedIds = templateIds.map(id => parseInt(id));
        // Filter out existing machines
        const existing = await this.prisma.equipment.findMany({
            where: {
                machineTemplateId: { in: parsedIds },
                gymId
            }
        });
        const existingIds = new Set(existing.map(e => e.machineTemplateId));
        const newIds = parsedIds.filter(id => !existingIds.has(id));

        if (newIds.length === 0) {
            return { count: 0 };
        }

        return this.prisma.equipment.createMany({
            data: newIds.map(templateId => ({
                machineTemplateId: templateId,
                gymId,
                location: "",
                isActive: true
            }))
        });
    }

    async updateMachine(id: number, gymId: string, data: { location?: string, isActive?: boolean }) {
        // Validate that the machine belongs to the gym
        const machine = await this.prisma.equipment.findFirst({
            where: {
                id,
                gymId
            }
        });

        if (!machine) {
            throw new Error("Machine not found or access denied");
        }

        return this.prisma.equipment.update({
            where: {
                id
            },
            data
        });
    }

    async deleteMachine(id: number, gymId: string) {
        const machine = await this.prisma.equipment.findFirst({
            where: { id, gymId }
        });

        if (!machine) {
            throw new Error("Machine not found or access denied");
        }

        return this.prisma.equipment.delete({
            where: { id }
        });
    }
}
