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
            let muscleTerms = [muscle];
            if (muscle === 'pecho') muscleTerms = ['pectorales'];
            else if (muscle === 'espalda') muscleTerms = ['dorsales', 'trapecio', 'erectores'];
            else if (muscle === 'piernas') muscleTerms = ['cuádriceps', 'isquiosurales', 'aductores', 'gemelos', 'piernas'];
            else if (muscle === 'hombros') muscleTerms = ['deltoides', 'hombros'];
            else if (muscle === 'brazos') muscleTerms = ['bíceps', 'tríceps', 'braquial', 'antebrazos'];
            else if (muscle === 'abdomen') muscleTerms = ['abdominales', 'core', 'oblicuos'];
            else if (muscle === 'gluteos') muscleTerms = ['glúteos'];

            const muscleConditions = muscleTerms.map(term => {
                const cond = `unaccent("primaryMuscleEs") ILIKE unaccent($${paramIndex})`;
                params.push(`%${term}%`);
                paramIndex++;
                return cond;
            });
            conditions.push(`(${muscleConditions.join(" OR ")})`);
        }
        if (equipment) {
            let eqTerms = [equipment];
            if (equipment === 'mancuernas') eqTerms = ['mancuerna', 'mancuernas'];
            else if (equipment === 'maquina') eqTerms = ['maquina', 'máquina'];

            const eqConditions = eqTerms.map(term => {
                const cond = `unaccent("equipmentType") ILIKE unaccent($${paramIndex})`;
                params.push(`%${term}%`);
                paramIndex++;
                return cond;
            });
            conditions.push(`(${eqConditions.join(" OR ")})`);
        }

        if (onlyGymEquipment === 'true' && gymId) {
            conditions.push(`(
                "equipmentType" IN ('mancuernas', 'mancuerna', 'barra', 'peso corporal', 'ninguno', 'none', 'kettlebell', 'banda elástica', 'banda', 'trx', 'soga')
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
