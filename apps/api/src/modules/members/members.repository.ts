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
}
