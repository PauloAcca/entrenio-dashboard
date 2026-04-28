import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { GymMessagesService } from "./gym-messages.service";

@Controller('feedback')
export class GymMessagesController {
    constructor(private readonly gymMessagesService: GymMessagesService) {}

    @Get('gym-messages')
    async getGymMessages(@Query('gymId') gymId: string) {
        if (!gymId) throw new BadRequestException('GYM_ID_REQUIRED');
        return this.gymMessagesService.getGymMessages(gymId);
    }
}
