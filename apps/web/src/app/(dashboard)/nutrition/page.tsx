"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { getNutritionPlans, createNutritionPlan, deleteNutritionPlan, getGymRecipes, GymNutritionPlan, GymRecipe } from "@/lib/api/gymNutrition"
import { getAppMembers } from "@/lib/api/members"
import { membership, user } from "@/types/entities"
import {
    Salad, Plus, ChevronRight, Clock, User, BookOpen, MoreVertical, Trash2, Edit3,
    Archive, CheckCircle2, FileText, UtensilsCrossed, Search, X, Loader2
} from "lucide-react"

const STATUS_CONFIG = {
    draft: { label: "Borrador", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: FileText },
    active: { label: "Activo", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
    archived: { label: "Archivado", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: Archive },
}

const MEAL_TYPE_LABELS: Record<string, string> = {
    breakfast: "Desayuno", lunch: "Almuerzo", dinner: "Cena",
    snack: "Merienda", pre_workout: "Pre-entrenamiento", post_workout: "Post-entrenamiento",
}

export default function NutritionPage() {
    const router = useRouter()
    const gym = useAuthStore((s) => s.gym)

    const [plans, setPlans] = useState<GymNutritionPlan[]>([])
    const [members, setMembers] = useState<(membership & { user: user })[]>([])
    const [gymRecipes, setGymRecipes] = useState<GymRecipe[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewPlan, setShowNewPlan] = useState(false)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    // New plan form
    const [newPlan, setNewPlan] = useState({ userId: "", title: "", description: "", notes: "", status: "draft" })
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        Promise.all([
            getNutritionPlans(),
            getAppMembers(),
            getGymRecipes(),
        ]).then(([p, m, r]) => {
            setPlans(p)
            setMembers(m.filter(m => m.user?.id))
            setGymRecipes(r)
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const filteredPlans = plans.filter(p => {
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === "all" || p.status === statusFilter
        return matchSearch && matchStatus
    })

    const getMemberName = (userId: number) => {
        const m = members.find(m => m.user?.id === userId)
        return m?.user ? `${m.user.name ?? ""} ${m.user.email ?? ""}`.trim() : `Usuario #${userId}`
    }

    const handleCreate = async () => {
        if (!newPlan.userId || !newPlan.title.trim()) return
        setCreating(true)
        try {
            const plan = await createNutritionPlan({
                userId: Number(newPlan.userId),
                title: newPlan.title,
                description: newPlan.description || undefined,
                notes: newPlan.notes || undefined,
                status: newPlan.status,
                days: [
                    { dayNumber: 1, dayLabel: "Lunes", meals: [] },
                    { dayNumber: 2, dayLabel: "Martes", meals: [] },
                    { dayNumber: 3, dayLabel: "Miércoles", meals: [] },
                    { dayNumber: 4, dayLabel: "Jueves", meals: [] },
                    { dayNumber: 5, dayLabel: "Viernes", meals: [] },
                    { dayNumber: 6, dayLabel: "Sábado", meals: [] },
                    { dayNumber: 7, dayLabel: "Domingo", meals: [] },
                ],
            })
            setShowNewPlan(false)
            setNewPlan({ userId: "", title: "", description: "", notes: "", status: "draft" })
            router.push(`/nutrition/${plan.id}`)
        } catch (e) {
            console.error(e)
            alert("Error al crear el plan")
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (planId: string) => {
        if (!confirm("¿Eliminar este plan nutricional?")) return
        await deleteNutritionPlan(planId)
        setPlans(p => p.filter(pl => pl.id !== planId))
        setActiveMenu(null)
    }

    const totalByStatus = {
        active: plans.filter(p => p.status === "active").length,
        draft: plans.filter(p => p.status === "draft").length,
        archived: plans.filter(p => p.status === "archived").length,
    }

    return (
        <div className="w-full min-h-full p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                            <Salad className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Nutrición</h1>
                    </div>
                    <p className="text-muted-foreground pl-1">
                        Creá y gestioná planes nutricionales personalizados para tus socios.
                    </p>
                </div>
                <button
                    onClick={() => setShowNewPlan(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Plan
                </button>
            </div>

            {/* ─── Stats ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: plans.length, color: "text-foreground", bg: "bg-card" },
                    { label: "Activos", value: totalByStatus.active, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                    { label: "Borradores", value: totalByStatus.draft, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
                    { label: "Recetas propias", value: gymRecipes.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} border border-border rounded-2xl p-5 space-y-1`}>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ─── Filters ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por título..."
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["all", "active", "draft", "archived"] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${statusFilter === s
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                        >
                            {s === "all" ? "Todos" : STATUS_CONFIG[s]?.label ?? s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Plans List ─────────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-2xl">
                        <UtensilsCrossed className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">No hay planes nutricionales</p>
                        <p className="text-sm text-muted-foreground mt-1">Creá el primer plan para un socio</p>
                    </div>
                    <button onClick={() => setShowNewPlan(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                        <Plus className="w-4 h-4" /> Nuevo Plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPlans.map(plan => {
                        const statusCfg = STATUS_CONFIG[plan.status]
                        const StatusIcon = statusCfg?.icon ?? FileText
                        const mealCount = plan.days?.reduce((acc, d) => acc + (d.meals?.length ?? 0), 0) ?? 0
                        return (
                            <div key={plan.id} className="group bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${statusCfg?.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusCfg?.label}
                                        </span>
                                        <h3 className="font-semibold text-foreground truncate text-lg leading-tight">{plan.title}</h3>
                                        {plan.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>}
                                    </div>
                                    <div className="relative">
                                        <button onClick={() => setActiveMenu(activeMenu === plan.id ? null : plan.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {activeMenu === plan.id && (
                                            <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-lg z-10 min-w-[160px] overflow-hidden">
                                                <button onClick={() => router.push(`/nutrition/${plan.id}`)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent text-left">
                                                    <Edit3 className="w-4 h-4" /> Editar
                                                </button>
                                                <button onClick={() => handleDelete(plan.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[140px]">{getMemberName(plan.userId)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{plan.days?.length ?? 0} días</span>
                                    </div>
                                    {mealCount > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <UtensilsCrossed className="w-3.5 h-3.5" />
                                            <span>{mealCount} comidas</span>
                                        </div>
                                    )}
                                </div>

                                {plan.notes && (
                                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic border border-border line-clamp-2">
                                        "{plan.notes}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-1 border-t border-border">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(plan.createdAt).toLocaleDateString("es-AR")}
                                    </span>
                                    <button
                                        onClick={() => router.push(`/nutrition/${plan.id}`)}
                                        className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                    >
                                        Editar <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ─── New Plan Modal ──────────────────────────────────────── */}
            {showNewPlan && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowNewPlan(false) }}>
                    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">Nuevo Plan Nutricional</h2>
                            <button onClick={() => setShowNewPlan(false)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Título del plan *</label>
                                <input
                                    value={newPlan.title}
                                    onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Ej: Plan de definición verano"
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Socio *</label>
                                <select
                                    value={newPlan.userId}
                                    onChange={e => setNewPlan(p => ({ ...p, userId: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                >
                                    <option value="">Seleccionar socio...</option>
                                    {members.map(m => (
                                        <option key={m.user.id} value={m.user.id ?? ""}>
                                            {m.user.name ? `${m.user.name} (${m.user.email})` : m.user.email ?? `#${m.user.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
                                <textarea
                                    value={newPlan.description}
                                    onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Descripción general del plan..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Notas del nutricionista</label>
                                <textarea
                                    value={newPlan.notes}
                                    onChange={e => setNewPlan(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Indicaciones especiales, restricciones, objetivos..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Estado inicial</label>
                                <select
                                    value={newPlan.status}
                                    onChange={e => setNewPlan(p => ({ ...p, status: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="active">Activo (visible para el socio)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowNewPlan(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newPlan.userId || !newPlan.title.trim()}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? "Creando..." : "Crear y editar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeMenu && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}
        </div>
    )
}
