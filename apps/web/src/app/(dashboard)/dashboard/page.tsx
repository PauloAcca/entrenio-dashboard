"use client"
import { useAuthStore } from "@/store/authStore"
import { CheckCircle, Crown, Info, Sparkles, Dumbbell } from "lucide-react"

export default function Dashboard() {
    const gym = useAuthStore((state) => state.gym)

    const PLANS = {
        "plan basico": {
            "titulo": "Plan Básico",
            "descripcion": "Gestión esencial para tu gimnasio sin costos adicionales.",
            "bg": "bg-card border-border",
            "badge": "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
            "icon": <Dumbbell className="w-6 h-6 text-gray-700 dark:text-gray-300" />,
            "beneficios": [
                "Gestión de máquinas",
                "Gestión de miembros",
                "Códigos QR para máquinas",
                "Registro de comidas manual",
                "Análisis de progreso básico",
                "Creación de rutinas manual",
                "Base de datos de ejercicios"
            ]
        },
        "plan premium": {
            "titulo": "Plan Premium",
            "descripcion": "Potencia tu negocio con Inteligencia Artificial y funciones avanzadas.",
            "bg": "bg-gradient-to-br from-indigo-50 to-card border-indigo-100 dark:from-indigo-950/20 dark:to-card dark:border-indigo-900/50",
            "badge": "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
            "icon": <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
            "beneficios": [
                "Todo lo del Plan Básico",
                "Creación de rutinas ilimitada con IA",
                "Recomendaciones de comidas con IA",
                "Análisis de comidas con IA",
                "Soporte prioritario",
                "Métricas avanzadas de miembros"
            ]
        }
    }

    const currentPlanKey = gym?.plan === "basic" ? "plan basico" : "plan premium"
    const currentPlan = PLANS[currentPlanKey]

    if (!gym) return null

    return (
        <div className="w-full min-h-full p-6 md:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{gym.name}</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                    Bienvenido a tu panel de control. Aquí tienes un resumen de tu suscripción y herramientas disponibles.
                </p>
            </div>

            {/* Plan Card */}
            <div className={`relative overflow-hidden rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md ${currentPlan.bg}`}>
                {gym.plan !== "basic" && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-32 h-32 text-indigo-600 dark:text-indigo-400" />
                    </div>
                )}
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${currentPlan.badge}`}>
                                {gym.plan === "basic" ? "Plan Actual" : "Plan Activo"}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {currentPlan.icon}
                                <h2 className="text-3xl font-bold text-foreground">{currentPlan.titulo}</h2>
                            </div>
                            <p className="text-muted-foreground text-lg max-w-xl">{currentPlan.descripcion}</p>
                        </div>
                    </div>
                    {/* Add CTA or Status if needed here */}
                </div>

                <div className="relative z-10 pt-8 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                        Lo que incluye tu plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentPlan.beneficios.map((beneficio) => (
                            <div key={beneficio} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-transparent hover:border-border transition-colors">
                                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${gym.plan === "basic" ? "text-green-500 dark:text-green-400" : "text-indigo-500 dark:text-indigo-400"}`} />
                                <span className="text-foreground font-medium">{beneficio}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Upsell - Only for Basic Plan */}
            {gym.plan === "basic" && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-indigo-900 p-8 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10">
                        <Sparkles className="h-40 w-40 text-indigo-500/20 rotate-12" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-2 text-indigo-300 font-semibold tracking-wide uppercase text-sm">
                                <Crown className="w-5 h-5" />
                                <span>Potencia tu gimnasio</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                Pásate al Plan Premium y desbloquea el poder de la IA
                            </h2>
                            <p className="text-indigo-100 text-lg">
                                Obtén rutinas ilimitadas generadas por IA, análisis de nutrición inteligente y métricas avanzadas para retener a tus miembros.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 text-sm text-indigo-200 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                                    <Sparkles className="w-4 h-4" />
                                    <span>IA Generativa</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-indigo-200 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Soporte Prioritario</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 text-center md:text-right">
                            <p className="text-lg font-medium text-indigo-100">
                                ¿Te interesa actualizar?
                            </p>
                            <p className="text-xl font-bold text-white mt-1">
                                Contáctanos para más información
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer / Quick Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
                <Info className="w-4 h-4" />
                <p>
                    Para gestionar tus máquinas, miembros o actualizar tu plan, utiliza el menú de navegación.
                </p>
            </div>
        </div>
    )
}