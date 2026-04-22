import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { MemberResponseDto } from "./dto/member-response.dto";

@Injectable()
export class MembersRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getAllByGymId(gymId: string): Promise<MemberResponseDto[]> {
        const registryEntries = await this.prisma.gym_member_registry.findMany({
            where: {
                gym_id: gymId
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        const claimedUserIds = registryEntries
            .map(r => r.claimed_by_user_id)
            .filter((id): id is number => id !== null);

        const users = await this.prisma.user.findMany({
            where: {
                id: { in: claimedUserIds }
            }
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        return registryEntries.map(registry => {
            const user = registry.claimed_by_user_id ? userMap.get(registry.claimed_by_user_id) : null;

            return {
                id: registry.id,
                gym_id: registry.gym_id,
                user_id: registry.claimed_by_user_id,
                starts_at: registry.starts_at,
                ends_at: registry.ends_at,
                status: registry.status,
                created_at: registry.created_at,
                updated_at: registry.updated_at,
                user: {
                    id: user?.id || null,
                    email: user?.email || registry.email || null,
                    email_verified: user?.email_verified || false,
                    avatarUrl: user?.avatarUrl || null,
                    created_at: registry.created_at,
                    updated_at: registry.updated_at,
                    name: registry.nombre || null,
                    phone: registry.phone || null,
                    dni: registry.dni || null,
                    claimed_at: registry.claimed_at || null,
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
