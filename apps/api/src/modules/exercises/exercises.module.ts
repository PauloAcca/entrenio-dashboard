import { Module } from "@nestjs/common";
import { ExercisesController } from "./exercises.controller";
import { ExercisesService } from "./exercises.service";
import { ExercisesRepository } from "./exercises.repository";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [ExercisesController],
    providers: [ExercisesService, ExercisesRepository],
    exports: [ExercisesService]
})
export class ExercisesModule { }
