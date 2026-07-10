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

    async updateMemberRoutineExercises(userId: number, gymId: string, payload: any) {
        return this.membersRepository.updateMemberRoutineExercises(userId, gymId, payload);
    }

    async getMemberProfile(userId: number) {
        return this.membersRepository.getMemberProfile(userId);
    }

    async createMemberRoutine(userId: number, gymId: string, payload: any) {
        return this.membersRepository.createMemberRoutine(userId, gymId, payload);
    }

    async upsertMemberProfile(userId: number, payload: any) {
        return this.membersRepository.upsertMemberProfile(userId, payload);
    }
}