import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) {}

    @UseGuards(JwtAuthGuard)
    @Get('gym')
    async getGymNotice(@Request() req) {
        // req.user has gymId in dashboard
        const gymId = req.user?.gymId;
        return this.noticesService.getGymNotice(gymId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('gym')
    async setGymNotice(@Request() req, @Body() body: { message: string, type?: string, isActive?: boolean }) {
        const gymId = req.user?.gymId;
        const type = body.type || 'info';
        const isActive = body.isActive !== undefined ? body.isActive : true;
        return this.noticesService.setGymNotice(gymId, body.message, type, isActive);
    }

    // Unprotected or custom protection for superadmin
    @Get('global')
    async getGlobalNotice(@Query('secret') secret: string) {
        if (secret !== process.env.SUPERADMIN_SECRET && secret !== "entrenio_super_admin_123") {
            return { error: 'Unauthorized' };
        }
        return this.noticesService.getGlobalNotice();
    }

    @Post('global')
    async setGlobalNotice(@Body() body: { message: string, type?: string, isActive?: boolean, secret: string }) {
        if (body.secret !== process.env.SUPERADMIN_SECRET && body.secret !== "entrenio_super_admin_123") {
            return { error: 'Unauthorized' };
        }
        const type = body.type || 'info';
        const isActive = body.isActive !== undefined ? body.isActive : true;
        return this.noticesService.setGlobalNotice(body.message, type, isActive);
    }
}
