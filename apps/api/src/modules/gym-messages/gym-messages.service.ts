import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";

@Injectable()
export class GymMessagesService {
    constructor(private readonly prisma: PrismaService) {}

    async getGymMessages(gymId: string) {
        const messages = await this.prisma.gym_messages.findMany({
            where: { gymId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        return messages;
    }
}
