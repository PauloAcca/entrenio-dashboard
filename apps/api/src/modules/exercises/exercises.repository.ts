import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";

@Injectable()
export class ExercisesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async searchExercises(query: string, muscle?: string, equipment?: string) {
        const where: any = {};
        
        if (query) {
            where.nameEs = { contains: query, mode: 'insensitive' };
        }
        if (muscle) {
            where.primaryMuscleEs = { contains: muscle, mode: 'insensitive' };
        }
        if (equipment) {
            where.equipmentType = { contains: equipment, mode: 'insensitive' };
        }

        return this.prisma.exercise.findMany({
            where,
            take: 50,
            orderBy: { nameEs: 'asc' },
            select: {
                id: true,
                nameEs: true,
                primaryMuscleEs: true,
                equipmentType: true,
                videoUrl: true,
            }
        });
    }
}
