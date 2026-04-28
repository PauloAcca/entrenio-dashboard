import { Module } from "@nestjs/common";
import { GymMessagesController } from "./gym-messages.controller";
import { GymMessagesService } from "./gym-messages.service";
import { PrismaModule } from "src/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [GymMessagesController],
    providers: [GymMessagesService],
})
export class GymMessagesModule {}
