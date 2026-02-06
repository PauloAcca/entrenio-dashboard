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

    async getAllMachineTemplates() {
        return this.machinesRepository.findAllMachineTemplates();
    }

    async addMachine(templateId: string, gymId: string) {
        return this.machinesRepository.addMachine(templateId, gymId);
    }

    async updateMachine(id: number, gymId: string, data: { location?: string, isActive?: boolean }) {
        return this.machinesRepository.updateMachine(id, gymId, data);
    }
}