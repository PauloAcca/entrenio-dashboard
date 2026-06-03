import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { NoticesService } from './notices.service';

@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) {}

    @Get('gym')
    async getGymNotice(@Query('gymId') gymId: string) {
        if (!gymId) throw new BadRequestException('GYM_ID_REQUIRED');
        const notice = await this.noticesService.getGymNotice(gymId);
        return notice || {};
    }

    @Post('gym')
    async setGymNotice(@Body() body: { gymId: string, message: string, type?: string, isActive?: boolean }) {
        if (!body.gymId) throw new BadRequestException('GYM_ID_REQUIRED');
        const type = body.type || 'info';
        const isActive = body.isActive !== undefined ? body.isActive : true;
        return this.noticesService.setGymNotice(body.gymId, body.message, type, isActive);
    }

    // Unprotected or custom protection for superadmin
    @Get('global')
    async getGlobalNotice(@Query('secret') secret: string) {
        if (secret !== process.env.SUPERADMIN_SECRET && secret !== "entrenio_super_admin_123") {
            return { error: 'Unauthorized' };
        }
        const notice = await this.noticesService.getGlobalNotice();
        return notice || {};
    }

    @Post('global')
    async setGlobalNotice(@Body() body: any) {
        console.log("POST /notices/global body:", body);
        const secret = body?.secret;
        if (secret !== process.env.SUPERADMIN_SECRET && secret !== "entrenio_super_admin_123") {
            return { error: 'Unauthorized' };
        }
        const type = body.type || 'info';
        const isActive = body.isActive !== undefined ? body.isActive : true;
        return this.noticesService.setGlobalNotice(body.message, type, isActive);
    }
}
