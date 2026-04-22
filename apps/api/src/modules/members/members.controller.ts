import { Controller, Get, Param, Query, ParseIntPipe, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from "@nestjs/common";
import { MembersService } from "./members.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { MembersImportService } from "./members-import.service";

@Controller('members')
export class MembersController {
    constructor(
        private readonly membersService: MembersService,
        private readonly membersImportService: MembersImportService
    ) { }

    @Get()
    async getAppMembers(@Query('gymId') gymId: string) {
        return this.membersService.getAppMembers(gymId);
    }

    @Get(':id/routine')
    async getMemberRoutine(
        @Param('id', ParseIntPipe) userId: number,
        @Query('gymId') gymId: string
    ) {
        if (!gymId) throw new BadRequestException('GYM_ID_REQUIRED');
        return this.membersService.getMemberRoutine(userId, gymId);
    }

    @Post(':id/routine')
    async createMemberRoutine(
        @Param('id', ParseIntPipe) userId: number,
        @Body('gymId') gymId: string,
        @Body('days') days?: number
    ) {
        if (!gymId) throw new BadRequestException('GYM_ID_REQUIRED');
        return this.membersService.createMemberRoutine(userId, gymId, days || 3);
    }

    @Get(':id/profile')
    async getMemberProfile(
        @Param('id', ParseIntPipe) userId: number
    ) {
        return this.membersService.getMemberProfile(userId);
    }

    @Post(':id/routine/exercises')
    async updateMemberRoutineExercises(
        @Param('id', ParseIntPipe) userId: number,
        @Body('gymId') gymId: string,
        @Body() payload: any
    ) {
        if (!gymId) throw new BadRequestException('GYM_ID_REQUIRED');
        return this.membersService.updateMemberRoutineExercises(userId, gymId, payload);
    }

    @Post('upload-csv')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCsv(
        @UploadedFile() file: Express.Multer.File,
        @Body('gymId') gymId: string
    ) {
        if (!file) throw new BadRequestException('FILE_REQUIRED');
        if (!gymId) throw new BadRequestException('GYM_ID_REQUIRED');

        return this.membersImportService.importFile({
            gymId,
            buffer: file.buffer,
            filename: file.originalname,
            mimetype: file.mimetype,
        });
    }

}