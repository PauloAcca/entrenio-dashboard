import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";

@Injectable()
export class ExercisesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async searchExercises(query: string, muscle?: string, equipment?: string, gymId?: string, onlyGymEquipment?: string) {
        const conditions = ["1=1"];
        const params: any[] = [];
        let paramIndex = 1;

        if (query) {
            conditions.push(`unaccent("nameEs") ILIKE unaccent($${paramIndex})`);
            params.push(`%${query}%`);
            paramIndex++;
        }
        if (muscle) {
            conditions.push(`unaccent("primaryMuscleEs") ILIKE unaccent($${paramIndex})`);
            params.push(`%${muscle}%`);
            paramIndex++;
        }
        if (equipment) {
            conditions.push(`unaccent("equipmentType") ILIKE unaccent($${paramIndex})`);
            params.push(`%${equipment}%`);
            paramIndex++;
        }

        if (onlyGymEquipment === 'true' && gymId) {
            conditions.push(`(
                "equipmentType" IN ('mancuernas', 'barra', 'peso corporal', 'ninguno', 'none', 'kettlebell', 'banda elástica', 'trx', 'soga')
                OR id IN (
                    SELECT mte."exerciseId"
                    FROM "machine_template_exercise" mte
                    JOIN "equipment" eq ON eq."machineTemplateId" = mte."machineTemplateId"
                    WHERE eq."gymId" = $${paramIndex}::uuid
                )
                OR id IN (
                    SELECT ee."exerciseId"
                    FROM "equipment_exercise" ee
                    JOIN "equipment" eq ON eq.id = ee."equipmentId"
                    WHERE eq."gymId" = $${paramIndex}::uuid
                )
            )`);
            params.push(gymId);
            paramIndex++;
        }

        const sqlQuery = `
            SELECT id, "nameEs", "primaryMuscleEs", "equipmentType", "videoUrl"
            FROM "exercise"
            WHERE ${conditions.join(" AND ")}
            ORDER BY "nameEs" ASC
            LIMIT 50
        `;

        return this.prisma.$queryRawUnsafe(sqlQuery, ...params);
    }
}
