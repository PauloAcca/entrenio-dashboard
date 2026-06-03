import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";

@Injectable()
export class NoticesService {
    constructor(private readonly prisma: PrismaService) {}

    async getGymNotice(gymId: string) {
        return this.prisma.notices.findFirst({
            where: { gymId }
        });
    }

    async setGymNotice(gymId: string, message: string, type: string, isActive: boolean) {
        const existing = await this.getGymNotice(gymId);
        if (existing) {
            return this.prisma.notices.update({
                where: { id: existing.id },
                data: { message, type, isActive, updatedAt: new Date() }
            });
        }
        return this.prisma.notices.create({
            data: { gymId, message, type, isActive }
        });
    }

    async getGlobalNotice() {
        return this.prisma.notices.findFirst({
            where: { gymId: null }
        });
    }

    async setGlobalNotice(message: string, type: string, isActive: boolean) {
        const existing = await this.getGlobalNotice();
        if (existing) {
            return this.prisma.notices.update({
                where: { id: existing.id },
                data: { message, type, isActive, updatedAt: new Date() }
            });
        }
        return this.prisma.notices.create({
            data: { message, type, isActive }
        });
    }
}
