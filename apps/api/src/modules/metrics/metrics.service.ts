import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getMostUsedMachines(gymId: string) {
    // 1. Group usage by equipmentId to count usage
    const usageStats = await this.prisma.equipment_usage.groupBy({
      by: ['equipmentId'],
      where: {
        gymId: gymId,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5, // Top 5 most used machines
    });

    // 2. Fetch details for the machines found
    const machineIds = usageStats.map((stat) => stat.equipmentId);
    
    if (machineIds.length === 0) {
      return [];
    }

    const machines = await this.prisma.equipment.findMany({
      where: {
        id: { in: machineIds },
      },
      include: {
        machine_template: true,
      },
    });

    // 3. Map count to machine details
    return usageStats.map((stat) => {
      const machine = machines.find((m) => m.id === stat.equipmentId);
      return {
        id: stat.equipmentId,
        name: machine?.machine_template?.name || `Maquina #${stat.equipmentId}`,
        usageCount: stat._count.id,
        imageUrl: machine?.machine_template?.imageUrl || null,
        category: machine?.machine_template?.category || 'General',
      };
    });
  }

  async getUserGoalsDistribution(gymId: string) {
    const members = await this.prisma.memberships.findMany({
      where: {
        gym_id: gymId,
        status: 'active',
      },
      include: {
        user: {
          include: {
            user_training_profile: true,
          },
        },
      },
    });

    const goalsMap = new Map<string, number>();
    // Initialize default goals
    goalsMap.set('perder_peso', 0);
    goalsMap.set('mantener_peso', 0);
    goalsMap.set('ganar_masa_muscular', 0);

    let totalUsers = 0;

    for (const member of members) {
      const profile = member.user?.user_training_profile;
      if (profile && profile.objetivo) {
        // Normalize goal strings if necessary or rely on exact matches
        // Assuming database values are 'perder_peso', 'ganar_masa_muscular', 'mantener_peso'
        // or mapping them if they differ (e.g. 'adelgazar' -> 'perder_peso')
        let goal = profile.objetivo;
        
        // Simple normalization incase strings vary
        if (goal === 'adelgazar') goal = 'perder_peso';
        if (goal === 'mantener') goal = 'mantener_peso';

        goalsMap.set(goal, (goalsMap.get(goal) || 0) + 1);
        totalUsers++;
      }
    }

    const result: { goal: string; count: number; percentage: number }[] = [];
    goalsMap.forEach((count, goal) => {
      // Format goal name for display (e.g. 'perder_peso' -> 'Perder Peso')
      const formattedGoal = goal.replace(/_/g, ' ');
      result.push({
        goal: formattedGoal,
        count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }

  async getUserGenderDistribution(gymId: string) {
    const members = await this.prisma.memberships.findMany({
      where: {
        gym_id: gymId,
        status: 'active',
      },
      include: {
        user: {
          include: {
            user_training_profile: true,
          },
        },
      },
    });

    const genderMap = new Map<string, number>();
    genderMap.set('Hombre', 0);
    genderMap.set('Mujer', 0);
    genderMap.set('Otro', 0);

    let totalUsers = 0;

    for (const member of members) {
      const profile = member.user?.user_training_profile;
      if (profile && profile.sexo) {
        let gender = 'Otro';
        const s = profile.sexo.toLowerCase();
        
        if (s === 'hombre' || s === 'masculino') gender = 'Hombre';
        else if (s === 'mujer' || s === 'femenino') gender = 'Mujer';

        genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
        totalUsers++;
      }
    }

    const result: { gender: string; count: number; percentage: number }[] = [];
    genderMap.forEach((count, gender) => {
      result.push({
        gender,
        count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
      });
    });

    return result;
  }

  async getUserAgeDistribution(gymId: string) {
    const members = await this.prisma.memberships.findMany({
      where: {
        gym_id: gymId,
        status: 'active',
      },
      include: {
        user: {
          include: {
            user_training_profile: true,
          },
        },
      },
    });

    // Initialize ranges
    const ageMap = new Map<string, number>();
    const ranges = ['<18', '18-24', '25-30', '31-40', '41-60', '>60'];
    ranges.forEach(r => ageMap.set(r, 0));

    let totalUsers = 0;

    // console.log(`[Metrics] Found ${members.length} members for age dist.`);
    for (const member of members) {
      const profile = member.user?.user_training_profile;
      // console.log(`[Metrics] User ${member.user_id} age: ${profile?.edad} (type: ${typeof profile?.edad})`);
      if (profile && profile.edad !== null && profile.edad !== undefined) {
        const age = profile.edad;
        let range = '';

        if (age < 18) range = '<18';
        else if (age >= 18 && age <= 24) range = '18-24';
        else if (age >= 25 && age <= 30) range = '25-30';
        else if (age >= 31 && age <= 40) range = '31-40';
        else if (age >= 41 && age <= 60) range = '41-60';
        else range = '>60';

        ageMap.set(range, (ageMap.get(range) || 0) + 1);
        totalUsers++;
      }
    }

    const result: { range: string; count: number; percentage: number }[] = [];
    ranges.forEach((range) => {
      const count = ageMap.get(range) || 0;
      result.push({
        range,
        count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
      });
    });

    return result;
  }

  async getMostPopularExercises(gymId: string) {
    // 1. Get all active members of the gym
    const members = await this.prisma.memberships.findMany({
      where: {
        gym_id: gymId,
        status: 'active',
      },
      select: {
        user_id: true,
      },
    });

    const userIds = members.map((m) => m.user_id);

    if (userIds.length === 0) {
      return [];
    }

    // 2. Group exercise history by exercise_name for these users
    const exerciseStats = await this.prisma.exercise_history.groupBy({
      by: ['exercise_name'],
      where: {
        user_id: { in: userIds },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5, // Top 5
    });

    // Calculate total exercises for percentage
    const totalExercises = exerciseStats.reduce((acc, curr) => acc + curr._count.id, 0);

    // 3. Construct result
    return exerciseStats.map((stat) => ({
      name: stat.exercise_name,
      count: stat._count.id,
      percentage: totalExercises > 0 ? (stat._count.id / totalExercises) * 100 : 0,
    }));
  }
  async getAverageWorkoutDuration(gymId: string) {
    const result = await this.prisma.gym_attendance.aggregate({
      where: {
        user: {
          memberships: {
            some: {
              gym_id: gymId,
              status: 'active',
            },
          },
        },
        duration_minutes: {
          not: null,
          gt: 0,
        },
      },
      _avg: {
        duration_minutes: true,
      },
    });

    return {
      averageMinutes: Math.round(result._avg.duration_minutes || 0),
    };
  }

  async getAverageWorkoutDurationByAge(gymId: string) {
    const attendanceRecords = await this.prisma.gym_attendance.findMany({
      where: {
        user: {
          memberships: {
            some: {
              gym_id: gymId,
              status: 'active',
            },
          },
        },
        duration_minutes: {
          not: null,
          gt: 0,
        },
      },
      select: {
        duration_minutes: true,
        user: {
          select: {
            user_training_profile: {
              select: {
                edad: true,
              },
            },
          },
        },
      },
    });

    const buckets: Record<string, { totalMinutes: number; count: number }> = {
      '<18': { totalMinutes: 0, count: 0 },
      '18-24': { totalMinutes: 0, count: 0 },
      '25-30': { totalMinutes: 0, count: 0 },
      '31-40': { totalMinutes: 0, count: 0 },
      '41-60': { totalMinutes: 0, count: 0 },
      '>60': { totalMinutes: 0, count: 0 },
    };

    for (const record of attendanceRecords) {
      const age = record.user?.user_training_profile?.edad;

      if (age !== null && age !== undefined) {
        let range = '';
        if (age < 18) range = '<18';
        else if (age >= 18 && age <= 24) range = '18-24';
        else if (age >= 25 && age <= 30) range = '25-30';
        else if (age >= 31 && age <= 40) range = '31-40';
        else if (age >= 41 && age <= 60) range = '41-60';
        else range = '>60';

        buckets[range].totalMinutes += record.duration_minutes || 0;
        buckets[range].count++;
      }
    }

    return Object.entries(buckets).map(([range, data]) => ({
      range,
      averageMinutes: data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0,
    }));
  }
}
