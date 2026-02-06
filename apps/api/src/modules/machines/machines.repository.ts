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
        return this.prisma.equipment.create({
            data: {
                machineTemplateId: parseInt(templateId),
                gymId,
                location: "",
                isActive: true
            }
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
}
