import { Controller, Get, Param, Query, ParseIntPipe } from "@nestjs/common";
import { MachinesService } from "./machines.service";

@Controller('machines')
export class MachinesController {
    constructor(private readonly machinesService: MachinesService) { }

    @Get()
    async getMachines(@Query('gymId') gymId: string) {
        return this.machinesService.getMachines(gymId);
    }

    @Get(':id')
    async getMachine(@Param('id', ParseIntPipe) id: number) {
        return this.machinesService.getMachine(id);
    }
}