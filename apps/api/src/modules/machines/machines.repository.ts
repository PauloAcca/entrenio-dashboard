import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { MachineResponseDto } from "./dto/machine.dto";

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
}
