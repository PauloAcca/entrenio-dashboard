import { Injectable } from "@nestjs/common";
import { MembersRepository } from "./members.repository";

@Injectable()
export class MembersService {
    constructor(private readonly membersRepository: MembersRepository) { }
    async getAppMembers(gymId: string) {
        return this.membersRepository.getAllByGymId(gymId);
    }

    async getMemberRoutine(userId: number, gymId: string) {
        return this.membersRepository.getMemberRoutine(userId, gymId);
    }
}