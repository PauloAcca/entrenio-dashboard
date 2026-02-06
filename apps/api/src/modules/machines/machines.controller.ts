import { Controller, Get, Param, Query, ParseIntPipe, Body, Post, Patch } from "@nestjs/common";
import { MachinesService } from "./machines.service";

@Controller('machines')
export class MachinesController {
    constructor(private readonly machinesService: MachinesService) { }

    @Get()
    async getMachines(@Query('gymId') gymId: string) {
        return this.machinesService.getMachines(gymId);
    }

    @Get('templates')
    async getAllMachineTemplates() {
        return this.machinesService.getAllMachineTemplates();
    }

    @Post()
    async addMachine(@Body() body: { templateId: string, gymId: string }) {
        return this.machinesService.addMachine(body.templateId, body.gymId);
    }

    @Get(':id')
    async getMachine(@Param('id', ParseIntPipe) id: number) {
        return this.machinesService.getMachine(id);
    }

    @Patch(':id')
    async updateMachine(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { gymId: string, location?: string, isActive?: boolean }
    ) {
        return this.machinesService.updateMachine(id, body.gymId, {
            location: body.location,
            isActive: body.isActive
        });
    }
}