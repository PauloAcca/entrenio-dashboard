import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { MemberResponseDto } from "./dto/member-response.dto";

@Injectable()
export class MembersRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getAllByGymId(gymId: string): Promise<MemberResponseDto[]> {
        const members = await this.prisma.memberships.findMany({
            where: {
                gym_id: gymId
            },
            include: {
                user: true
            }
        });

        const userIds = members.map(m => m.user_id);

        const registryEntries = await this.prisma.gym_member_registry.findMany({
            where: {
                gym_id: gymId,
                claimed_by_user_id: {
                    in: userIds
                }
            }
        });

        const registryMap = new Map(
            registryEntries.map(entry => [entry.claimed_by_user_id, entry])
        );

        return members.map(member => {
            const registryEntry = registryMap.get(member.user_id);
            return {
                id: member.id,
                gym_id: member.gym_id,
                user_id: member.user_id,
                starts_at: member.starts_at,
                ends_at: member.ends_at,
                status: member.status,
                created_at: member.created_at,
                updated_at: member.updated_at,
                user: {
                    id: member.user.id,
                    email: member.user.email,
                    email_verified: member.user.email_verified || false,
                    created_at: member.created_at,
                    updated_at: member.updated_at,
                    name: registryEntry?.nombre || null,
                    phone: registryEntry?.phone || null,
                    dni: registryEntry?.dni || null,
                    claimed_at: registryEntry?.claimed_at || null,
                }
            } as any;
        });
    }

    async getMemberRoutine(userId: number, gymId: string) {
        const membership = await this.prisma.memberships.findFirst({
            where: {
                user_id: userId,
                gym_id: gymId
            }
        });

        if (!membership) {
            throw new Error("El usuario no es miembro de este gimnasio o no existe.");
        }

        const routine = await this.prisma.routines.findFirst({
            where: {
                userId: userId,
                isActive: true
            },
            include: {
                routine_sessions: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        routine_exercises: {
                            orderBy: {
                                order: 'asc'
                            }
                        }
                    }
                }
            }
        });

        return routine;
    }

    async updateMemberRoutineExercises(userId: number, gymId: string, payload: {
        updates: { id: number, reps?: string, sets?: number, rest?: string, weight_kg?: number, name?: string, exerciseId?: number, order?: number }[];
        adds: { sessionId: number, reps: string, sets: number, rest?: string, weight_kg?: number, name: string, exerciseId?: number, order: number }[];
        removes: number[];
    }) {
        const membership = await this.prisma.memberships.findFirst({
            where: { user_id: userId, gym_id: gymId }
        });

        if (!membership) throw new Error("No permission");

        // Verify routine ownership implicitly by checking sessions and exercises? 
        // We do it by passing the updates through a query or just trusting the gym admin for now.
        // Prisma transactions:
        
        await this.prisma.$transaction(async (tx) => {
            if (payload.removes && payload.removes.length > 0) {
                await tx.routine_exercises.deleteMany({
                    where: { id: { in: payload.removes } }
                });
            }

            if (payload.updates && payload.updates.length > 0) {
                for (const update of payload.updates) {
                    await tx.routine_exercises.update({
                        where: { id: update.id },
                        data: {
                            reps: update.reps,
                            sets: update.sets,
                            rest: update.rest,
                            weight_kg: update.weight_kg,
                            name: update.name,
                            exerciseId: update.exerciseId,
                            order: update.order,
                        }
                    });
                }
            }

            if (payload.adds && payload.adds.length > 0) {
                await tx.routine_exercises.createMany({
                    data: payload.adds.map(add => ({
                        sessionId: add.sessionId,
                        name: add.name,
                        sets: add.sets,
                        reps: add.reps,
                        rest: add.rest,
                        weight_kg: add.weight_kg,
                        exerciseId: add.exerciseId,
                        order: add.order,
                    }))
                });
            }
        });

        return { success: true };
    }
}
