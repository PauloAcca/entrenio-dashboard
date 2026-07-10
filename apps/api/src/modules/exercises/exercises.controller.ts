import { Controller, Get, Query } from "@nestjs/common";
import { ExercisesService } from "./exercises.service";

@Controller('exercises')
export class ExercisesController {
    constructor(private readonly service: ExercisesService) { }

    @Get()
    async searchExercises(
        @Query('q') q?: string,
        @Query('muscle') muscle?: string,
        @Query('equipment') equipment?: string,
        @Query('gymId') gymId?: string,
        @Query('onlyGymEquipment') onlyGymEquipment?: string
    ) {
        return this.service.searchExercises(q || '', muscle, equipment, gymId, onlyGymEquipment);
    }
}
