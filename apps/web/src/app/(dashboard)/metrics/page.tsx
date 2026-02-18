"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { getMostUsedMachinesWithGymId, getUserGoalsDistribution, getUserGenderDistribution, getUserAgeDistribution, getMostPopularExercises, getAverageWorkoutDuration, getAverageWorkoutDurationByAge, MachineUsageMetric, UserGoalMetric, UserGenderMetric, UserAgeMetric, PopularExerciseMetric, AverageWorkoutDurationMetric, AverageWorkoutDurationByAgeMetric } from "@/lib/api/metrics"
import { BarChart, Activity, Dumbbell, UsersRound, Clock, Timer } from "lucide-react"

export default function Metrics() {
    const gym = useAuthStore((state) => state.gym)
    const [metrics, setMetrics] = useState<MachineUsageMetric[]>([])
    const [goals, setGoals] = useState<UserGoalMetric[]>([])
    const [genders, setGenders] = useState<UserGenderMetric[]>([])
    const [ages, setAges] = useState<UserAgeMetric[]>([])
    const [popularExercises, setPopularExercises] = useState<PopularExerciseMetric[]>([])
    const [avgDuration, setAvgDuration] = useState<AverageWorkoutDurationMetric | null>(null)
    const [avgDurationByAge, setAvgDurationByAge] = useState<AverageWorkoutDurationByAgeMetric[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (gym?.id) {
            Promise.all([
                getMostUsedMachinesWithGymId(gym.id),
                getUserGoalsDistribution(gym.id),
                getUserGenderDistribution(gym.id),
                getUserAgeDistribution(gym.id),
                getMostPopularExercises(gym.id),
                getAverageWorkoutDuration(gym.id),
                getAverageWorkoutDurationByAge(gym.id)
            ])
            .then(([machinesData, goalsData, gendersData, agesData, popularExercisesData, avgDurationData, avgDurationByAgeData]) => {
                setMetrics(machinesData)
                setGoals(goalsData)
                setGenders(gendersData)
                setAges(agesData)
                setPopularExercises(popularExercisesData)
                setAvgDuration(avgDurationData)
                setAvgDurationByAge(avgDurationByAgeData)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
        }
    }, [gym?.id])

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Métricas</h1>
                <p className="text-muted-foreground">Analiza el rendimiento de tu gimnasio y el uso del equipamiento.</p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Average Duration Card */}
                 <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Duración Promedio de Sesión</p>
                        <h3 className="text-2xl font-bold text-foreground">
                            {loading ? "..." : avgDuration ? `${avgDuration.averageMinutes} min` : "N/A"}
                        </h3>
                    </div>
                 </div>
            </div>

            {/* Age Based Duration Chart */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden lg:col-span-2">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                            <Timer className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Duración Promedio por Edad</h2>
                            <p className="text-sm text-muted-foreground">Tiempo promedio de entrenamiento por rango de edad</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    ) : avgDurationByAge.length > 0 ? (
                        <div className="flex justify-between gap-4 h-64 pt-8 items-end">
                            {avgDurationByAge.map((metric) => (
                                <div key={metric.range} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                                    <div className="relative w-full flex items-end justify-center flex-1">
                                        <div 
                                            className="w-full bg-teal-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-teal-600"
                                            style={{ height: `${Math.min(metric.averageMinutes * 2, 100)}%` }} // Scaling factor
                                        >
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground z-20 whitespace-nowrap">
                                                {Math.round(metric.averageMinutes)} min
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground text-center">{metric.range}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No hay datos de duración por edad registrados aún.
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Most Used Machines Card */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                                <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground">Máquinas Más Usadas</h2>
                                <p className="text-sm text-muted-foreground">Top 5 equipamiento por frecuencia de uso</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : metrics.length > 0 ? (
                            <div className="space-y-6">
                                {metrics.map((machine, index) => (
                                    <div key={machine.id} className="relative">
                                        <div className="flex items-center justify-between mb-2 z-10 relative">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium text-foreground">{machine.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">{machine.usageCount} usos</span>
                                        </div>
                                        {/* Progress Bar Background */}
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(machine.usageCount / metrics[0].usageCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No hay datos de uso registrados aún.
                            </div>
                        )}
                    </div>
                </div>

            {/* User Goals Chart */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Objetivos de Usuarios</h2>
                            <p className="text-sm text-muted-foreground">Distribución de metas de fitness</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : goals.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                            {/* Pie Chart */}
                            <div className="relative w-48 h-48 rounded-full"
                                style={{
                                    background: `conic-gradient(
                                        #0ea5e9 0% ${goals.find(g => g.goal === 'perder peso')?.percentage || 0}%,
                                        #10b981 ${goals.find(g => g.goal === 'perder peso')?.percentage || 0}% ${(goals.find(g => g.goal === 'perder peso')?.percentage || 0) + (goals.find(g => g.goal === 'mantener peso')?.percentage || 0)}%,
                                        #f43f5e ${(goals.find(g => g.goal === 'perder peso')?.percentage || 0) + (goals.find(g => g.goal === 'mantener peso')?.percentage || 0)}% 100%
                                    )`
                                }}
                            >
                                <div className="absolute inset-0 m-auto w-32 h-32 bg-card rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-4">
                                {goals.map((goalMetric) => (
                                    <div key={goalMetric.goal} className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            goalMetric.goal === 'perder peso' ? 'bg-sky-500' :
                                            goalMetric.goal === 'mantener peso' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground capitalize">{goalMetric.goal}</span>
                                            <span className="text-xs text-muted-foreground">{goalMetric.count} usuarios ({Math.round(goalMetric.percentage)}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No hay datos de objetivos registrados aún.
                        </div>
                    )}
                </div>
            </div>

            {/* Gender Distribution Chart */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden lg:col-span-2">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <UsersRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Distribución por Género</h2>
                            <p className="text-sm text-muted-foreground">Composición demográfica</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : genders.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                            {/* Pie Chart */}
                            <div className="relative w-48 h-48 rounded-full"
                                style={{
                                    background: `conic-gradient(
                                        #3b82f6 0% ${genders.find(g => g.gender === 'Hombre')?.percentage || 0}%,
                                        #ec4899 ${genders.find(g => g.gender === 'Hombre')?.percentage || 0}% ${(genders.find(g => g.gender === 'Hombre')?.percentage || 0) + (genders.find(g => g.gender === 'Mujer')?.percentage || 0)}%,
                                        #eab308 ${(genders.find(g => g.gender === 'Hombre')?.percentage || 0) + (genders.find(g => g.gender === 'Mujer')?.percentage || 0)}% 100%
                                    )`
                                }}
                            >
                                <div className="absolute inset-0 m-auto w-32 h-32 bg-card rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-4">
                                {genders.map((genderMetric) => (
                                    <div key={genderMetric.gender} className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            genderMetric.gender === 'Hombre' ? 'bg-blue-500' :
                                            genderMetric.gender === 'Mujer' ? 'bg-pink-500' : 'bg-yellow-500'
                                        }`} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">{genderMetric.gender}</span>
                                            <span className="text-xs text-muted-foreground">{genderMetric.count} usuarios ({Math.round(genderMetric.percentage)}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No hay datos de género registrados aún.
                        </div>
                    )}
                </div>
                </div>
            </div>

            {/* Age Distribution Chart */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden lg:col-span-2">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <UsersRound className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Distribución por Edad</h2>
                            <p className="text-sm text-muted-foreground">Rangos de edad de los usuarios</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : ages.length > 0 ? (
                        <div className="flex justify-between gap-4 h-64 pt-8">
                            {ages.map((ageMetric) => (
                                <div key={ageMetric.range} className="flex flex-col items-center gap-2 flex-1 group h-full">
                                    <div className="relative w-full bg-secondary rounded-t-lg flex items-end justify-center flex-1">
                                        <div 
                                            className="w-full bg-orange-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-orange-600"
                                            style={{ height: `${Math.max(ageMetric.percentage, 5)}%` }}
                                        >
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground z-20">
                                                {Math.round(ageMetric.percentage)}%
                                            </span>
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border border-border">
                                                {ageMetric.count} usuarios ({Math.round(ageMetric.percentage)}%)
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground text-center">{ageMetric.range}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No hay datos de edad registrados aún.
                        </div>
                    )}
                </div>
            </div>

            {/* Popular Exercises Chart */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden lg:col-span-2">
                <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Ejercicios Más Populares</h2>
                            <p className="text-sm text-muted-foreground">Top 5 ejercicios realizados por los usuarios</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : popularExercises.length > 0 ? (
                        <div className="space-y-6">
                            {popularExercises.map((exercise, index) => (
                                <div key={exercise.name} className="relative">
                                    <div className="flex items-center justify-between mb-2 z-10 relative">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-foreground">{exercise.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">{exercise.count} veces</span>
                                    </div>
                                    {/* Progress Bar Background */}
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${(exercise.count / popularExercises[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No hay datos de ejercicios registrados aún.
                        </div>
                    )}
                </div>
            </div>
        </div>
    

    )
}
