import { Injectable } from "@nestjs/common";
import { MachinesRepository } from "./machines.repository";

@Injectable()
export class MachinesService {
    constructor(private readonly machinesRepository: MachinesRepository) { }
    async getMachines(gymId: string) {
        return this.machinesRepository.findAllByGymId(gymId);
    }

    async getMachine(id: number) {
        return this.machinesRepository.findById(id);
    }
}