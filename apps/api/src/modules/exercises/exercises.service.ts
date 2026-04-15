import { Injectable } from "@nestjs/common";
import { ExercisesRepository } from "./exercises.repository";

@Injectable()
export class ExercisesService {
    constructor(private readonly repository: ExercisesRepository) { }

    async searchExercises(query: string) {
        return this.repository.searchExercises(query);
    }
}
