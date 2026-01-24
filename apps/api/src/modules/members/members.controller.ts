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