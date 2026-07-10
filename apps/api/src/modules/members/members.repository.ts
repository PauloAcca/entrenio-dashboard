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

        const [users, routines] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    id: { in: claimedUserIds }
                }
            }),
            this.prisma.routines.findMany({
                where: {
                    userId: { in: claimedUserIds },
                    isActive: true
                },
                select: {
                    userId: true
                }
            })
        ]);

        const userMap = new Map(users.map(u => [u.id, u]));
        const routineUserIds = new Set(routines.map(r => r.userId));

        return registryEntries.map(registry => {
            const user = registry.claimed_by_user_id ? userMap.get(registry.claimed_by_user_id) : null;
            const hasRoutine = registry.claimed_by_user_id ? routineUserIds.has(registry.claimed_by_user_id) : false;

            return {
                id: registry.id,
                gym_id: registry.gym_id,
                user_id: registry.claimed_by_user_id,
                starts_at: registry.starts_at,
                ends_at: registry.ends_at,
                external_member_id: registry.external_member_id,
                status: registry.claimed_by_user_id && registry.status === 'active' ? 'active' : 'inactive',
                created_at: registry.created_at,
                updated_at: registry.updated_at,
                has_routine: hasRoutine,
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

    async getMemberProfile(userId: number) {
        return this.prisma.user_training_profile.findUnique({
            where: { userId }
        });
    }

    async createMemberRoutine(userId: number, gymId: string, payload: {
        name: string;
        goal?: string;
        intensity?: string;
        days_per_week: number;
        session_duration?: number;
        description?: string;
        sessions: {
            day_label: string;
            focus?: string;
            order: number;
            exercises: {
                name: string;
                exerciseId?: number;
                sets: number;
                reps: string;
                rest?: string;
                order: number;
            }[];
        }[];
    }) {
        const membership = await this.prisma.memberships.findFirst({
            where: { user_id: userId, gym_id: gymId }
        });
        if (!membership) throw new Error('No permission');

        // Deactivate any existing routines
        await this.prisma.routines.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false }
        });

        const routine = await this.prisma.routines.create({
            data: {
                name: payload.name,
                goal: payload.goal,
                intensity: payload.intensity,
                days_per_week: payload.days_per_week,
                session_duration: payload.session_duration,
                description: payload.description,
                source: 'trainer_dashboard',
                isActive: true,
                userId,
                routine_sessions: {
                    create: payload.sessions.map(session => ({
                        day_label: session.day_label,
                        focus: session.focus,
                        order: session.order,
                        routine_exercises: {
                            create: session.exercises.map(ex => ({
                                name: ex.name,
                                exerciseId: ex.exerciseId,
                                sets: ex.sets,
                                reps: ex.reps,
                                rest: ex.rest,
                                order: ex.order,
                            }))
                        }
                    }))
                }
            },
            include: {
                routine_sessions: {
                    orderBy: { order: 'asc' },
                    include: {
                        routine_exercises: { orderBy: { order: 'asc' } }
                    }
                }
            }
        });

        return routine;
    }

    async upsertMemberProfile(userId: number, payload: {
        experiencia?: string;
        dias?: number;
        tiempo?: number;
        enfoque?: string;
        intensidad?: string;
        lesion?: string;
        fechaNacimiento?: string;
        sexo?: string;
        peso?: number;
        altura?: number;
        objetivo?: string;
        nombre?: string;
        actividad?: string;
    }) {
        // Verify the user exists before attempting to write (FK safety check)
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error(`User with id ${userId} does not exist in the database.`);
        }

        const profileData = {
            experiencia: payload.experiencia ?? 'principiante',
            dias: payload.dias ?? 3,
            tiempo: payload.tiempo ?? 60,
            enfoque: payload.enfoque ?? 'hybrid',
            intensidad: payload.intensidad ?? 'medium',
            lesion: payload.lesion ?? null,
            fechaNacimiento: payload.fechaNacimiento ? new Date(payload.fechaNacimiento) : null,
            sexo: payload.sexo ?? null,
            peso: payload.peso ?? null,
            altura: payload.altura ?? null,
            objetivo: payload.objetivo ?? null,
            nombre: payload.nombre ?? null,
            actividad: payload.actividad ?? null,
        };

        // Use find + create/update instead of upsert to avoid TypeORM FK constraint name mismatches
        const existing = await this.prisma.user_training_profile.findUnique({
            where: { userId }
        });

        if (existing) {
            return this.prisma.user_training_profile.update({
                where: { userId },
                data: profileData,
            });
        } else {
            return this.prisma.user_training_profile.create({
                data: {
                    userId,
                    ...profileData,
                },
            });
        }
    }
}

