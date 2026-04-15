import { Module } from "@nestjs/common";
import { ExercisesController } from "./exercises.controller";
import { ExercisesService } from "./exercises.service";
import { ExercisesRepository } from "./exercises.repository";
import { PrismaModule } from "src/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [ExercisesController],
    providers: [ExercisesService, ExercisesRepository],
    exports: [ExercisesService]
})
export class ExercisesModule { }
