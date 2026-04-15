import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";

@Injectable()
export class ExercisesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async searchExercises(query: string) {
        if (!query) {
            return this.prisma.exercise.findMany({
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
        
        return this.prisma.exercise.findMany({
            where: {
                nameEs: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
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
