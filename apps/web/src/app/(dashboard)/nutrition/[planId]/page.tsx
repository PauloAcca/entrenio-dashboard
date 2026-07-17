"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import {
    getNutritionPlan, updateNutritionPlan, getGymRecipes, searchGlobalRecipes,
    createGymRecipe, deleteGymRecipe,
    GymNutritionPlan, GymNutritionPlanDay, GymNutritionPlanMeal,
    GymRecipe, GlobalRecipeSummary,
} from "@/lib/api/gymNutrition"
import { getAppMembers } from "@/lib/api/members"
import { membership, user } from "@/types/entities"
import {
    ArrowLeft, Save, ChevronDown, ChevronUp, Plus, Trash2, X, Search,
    Salad, UtensilsCrossed, BookOpen, Loader2, CheckCircle2, Archive,
    FileText, StickyNote, Tag, AlertCircle, ChefHat, Globe, Sparkles
} from "lucide-react"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const MEAL_TYPES = [
    { value: "breakfast", label: "🌅 Desayuno" },
    { value: "lunch", label: "☀️ Almuerzo" },
    { value: "dinner", label: "🌙 Cena" },
    { value: "snack", label: "🍎 Merienda" },
    { value: "pre_workout", label: "⚡ Pre-Entrenamiento" },
    { value: "post_workout", label: "💪 Post-Entrenamiento" },
]
const MEAL_TYPE_LABEL: Record<string, string> = Object.fromEntries(MEAL_TYPES.map(m => [m.value, m.label]))

const STATUS_OPTIONS = [
    { value: "draft", label: "Borrador", icon: FileText, color: "text-amber-600" },
    { value: "active", label: "Activo", icon: CheckCircle2, color: "text-emerald-600" },
    { value: "archived", label: "Archivado", icon: Archive, color: "text-gray-500" },
]

// ─── Meal Editor Component ────────────────────────────────────────────────────

interface MealEditorProps {
    meal: Partial<GymNutritionPlanMeal>
    gymRecipes: GymRecipe[]
    onUpdate: (meal: Partial<GymNutritionPlanMeal>) => void
    onDelete: () => void
}

function MealEditor({ meal, gymRecipes, onUpdate, onDelete }: MealEditorProps) {
    const [expanded, setExpanded] = useState(true)
    const [recipeSearch, setRecipeSearch] = useState("")
    const [recipeFilter, setRecipeFilter] = useState("")
    const [globalResults, setGlobalResults] = useState<GlobalRecipeSummary[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [showRecipePicker, setShowRecipePicker] = useState(false)
    const [pickerTab, setPickerTab] = useState<"global" | "gym">("global")

    const doSearch = useCallback(async (q: string, filter: string) => {
        setSearchLoading(true)
        try {
            const results = await searchGlobalRecipes(q, 100)
            if (filter) {
                setGlobalResults(results.filter(r => r.mealType === filter))
            } else {
                setGlobalResults(results)
            }
        } finally {
            setSearchLoading(false)
        }
    }, [])

    useEffect(() => {
        const t = setTimeout(() => doSearch(recipeSearch, recipeFilter), 400)
        return () => clearTimeout(t)
    }, [recipeSearch, recipeFilter, doSearch])

    const selectedRecipeName = meal.recipe?.title ?? meal.gymRecipe?.title ?? null
    const selectedRecipeImage = meal.recipe?.imageUrl ?? meal.gymRecipe?.imageUrl ?? null

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Meal header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                <select
                    value={meal.mealType ?? "breakfast"}
                    onChange={e => onUpdate({ ...meal, mealType: e.target.value })}
                    className="text-sm font-semibold bg-transparent border-none outline-none text-foreground cursor-pointer"
                >
                    {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="flex-1" />
                <button onClick={() => setExpanded(v => !v)} className="p-1 hover:bg-accent rounded-lg text-muted-foreground">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={onDelete} className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Recipe link */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Receta vinculada</label>
                        {selectedRecipeName ? (
                            <div className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200/50 dark:border-emerald-800/50">
                                    {selectedRecipeImage ? (
                                        <img src={selectedRecipeImage} alt={selectedRecipeName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Salad className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300 flex-1 truncate">{selectedRecipeName}</span>
                                <button onClick={() => onUpdate({ ...meal, recipeId: null, recipe: null, gymRecipeId: null, gymRecipe: null })} className="p-1.5 text-emerald-600 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors mr-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowRecipePicker(true)}
                                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-emerald-400 transition-colors w-full"
                            >
                                <Plus className="w-4 h-4" /> Vincular receta (opcional)
                            </button>
                        )}
                    </div>

                    {/* Manual title/description */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Título de la comida</label>
                        <input
                            value={meal.title ?? ""}
                            onChange={e => onUpdate({ ...meal, title: e.target.value || null })}
                            placeholder={selectedRecipeName ?? "Ej: Tostadas con palta y huevo..."}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Descripción / Instrucciones</label>
                        <textarea
                            value={meal.description ?? ""}
                            onChange={e => onUpdate({ ...meal, description: e.target.value || null })}
                            placeholder="Describe la preparación, cantidad, modo de consumo..."
                            rows={2}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                        />
                    </div>

                    {/* Macros manuales */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Macros (opcional)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { key: "customCalories", label: "Kcal" },
                                { key: "customProtein", label: "Proteína (g)" },
                                { key: "customCarbs", label: "Carbos (g)" },
                                { key: "customFats", label: "Grasas (g)" },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                                    <input
                                        type="number"
                                        value={(meal as any)[key] ?? ""}
                                        onChange={e => onUpdate({ ...meal, [key]: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notas del nutricionista</label>
                        <input
                            value={meal.notes ?? ""}
                            onChange={e => onUpdate({ ...meal, notes: e.target.value || null })}
                            placeholder="Indicaciones para el socio..."
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                    </div>
                </div>
            )}

            {/* Recipe Picker Modal */}
            {showRecipePicker && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowRecipePicker(false) }}>
                    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-foreground">Vincular receta</h3>
                            <button onClick={() => setShowRecipePicker(false)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground"><X className="w-4 h-4" /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button onClick={() => setPickerTab("global")} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${pickerTab === "global" ? "border-emerald-600 text-emerald-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                                <Globe className="w-4 h-4" /> DB Global
                            </button>
                            <button onClick={() => setPickerTab("gym")} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${pickerTab === "gym" ? "border-emerald-600 text-emerald-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                                <ChefHat className="w-4 h-4" /> Mis recetas
                            </button>
                        </div>

                        {pickerTab === "global" && (
                            <>
                                <div className="p-3 border-b border-border space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            value={recipeSearch}
                                            onChange={e => setRecipeSearch(e.target.value)}
                                            placeholder="Buscar receta..."
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        <button
                                            onClick={() => setRecipeFilter("")}
                                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${recipeFilter === "" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                        >
                                            Todas
                                        </button>
                                        {MEAL_TYPES.map(t => (
                                            <button
                                                key={t.value}
                                                onClick={() => setRecipeFilter(t.value)}
                                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${recipeFilter === t.value ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-y-auto flex-1 p-2">
                                    {searchLoading ? (
                                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                    ) : globalResults.length === 0 ? (
                                        <p className="text-center text-sm text-muted-foreground py-8">Sin resultados</p>
                                    ) : (
                                        globalResults.map(r => (
                                            <button key={r.id} onClick={() => { onUpdate({ ...meal, recipeId: r.id, recipe: r as any, gymRecipeId: null, gymRecipe: null, title: meal.title ?? r.title }); setShowRecipePicker(false) }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-left group"
                                            >
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                                    {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover" /> : <Salad className="w-5 h-5 text-emerald-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                                    <p className="text-xs text-muted-foreground">{r.calories ? `${Math.round(r.calories)} kcal` : ""} {r.mealType ? `· ${r.mealType}` : ""}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {pickerTab === "gym" && (
                            <div className="overflow-y-auto flex-1 p-2">
                                {gymRecipes.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">No hay recetas propias del gym aún</p>
                                ) : (
                                    gymRecipes.map(r => (
                                        <button key={r.id} onClick={() => { onUpdate({ ...meal, gymRecipeId: r.id, gymRecipe: r, recipeId: null, recipe: null, title: meal.title ?? r.title }); setShowRecipePicker(false) }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-left"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                                <ChefHat className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                                <p className="text-xs text-muted-foreground">{r.calories ? `${Math.round(r.calories)} kcal` : "Sin macros"} · {r.mealType ?? ""}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Plan Editor Page ────────────────────────────────────────────────────

export default function PlanEditorPage() {
    const router = useRouter()
    const params = useParams()
    const planId = params.planId as string
    const gym = useAuthStore(s => s.gym)

    const [plan, setPlan] = useState<GymNutritionPlan | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeDay, setActiveDay] = useState(0)
    const [gymRecipes, setGymRecipes] = useState<GymRecipe[]>([])
    const [members, setMembers] = useState<(membership & { user: user })[]>([])
    const [showGymRecipeModal, setShowGymRecipeModal] = useState(false)

    // Gym recipe form
    const [newGymRecipe, setNewGymRecipe] = useState({
        title: "", description: "", calories: "", protein: "", carbs: "", fats: "",
        prepTimeMinutes: "", servings: "", mealType: "", notes: "",
    })
    const [creatingGymRecipe, setCreatingGymRecipe] = useState(false)

    useEffect(() => {
        Promise.all([
            getNutritionPlan(planId),
            getGymRecipes(),
            getAppMembers(),
        ]).then(([p, r, m]) => {
            setPlan(p)
            setGymRecipes(r)
            setMembers(m.filter(m => m.user?.id))
        }).catch(console.error).finally(() => setLoading(false))
    }, [planId])

    const getMemberName = (userId: number) => {
        const m = members.find(m => m.user?.id === userId)
        return m?.user ? (m.user.name ? `${m.user.name} (${m.user.email})` : m.user.email) : `Usuario #${userId}`
    }

    const handleSave = async () => {
        if (!plan) return
        setSaving(true)
        try {
            const updated = await updateNutritionPlan(planId, {
                gymId: gym!.id,
                userId: plan.userId,
                title: plan.title,
                description: plan.description,
                notes: plan.notes,
                status: plan.status,
                startsAt: plan.startsAt,
                endsAt: plan.endsAt,
                days: plan.days.map((day, di) => ({
                    dayNumber: di + 1,
                    dayLabel: day.dayLabel,
                    notes: day.notes,
                    meals: day.meals.map((meal, mi) => ({
                        mealType: meal.mealType,
                        order: mi,
                        title: meal.title,
                        description: meal.description,
                        customCalories: meal.customCalories,
                        customProtein: meal.customProtein,
                        customCarbs: meal.customCarbs,
                        customFats: meal.customFats,
                        recipeId: meal.recipeId,
                        gymRecipeId: meal.gymRecipeId,
                        notes: meal.notes,
                    })),
                })),
            } as any)
            setPlan(updated)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (e) {
            console.error(e)
            alert("Error al guardar")
        } finally {
            setSaving(false)
        }
    }

    const updateMeal = (dayIdx: number, mealIdx: number, updated: Partial<GymNutritionPlanMeal>) => {
        setPlan(p => {
            if (!p) return p
            const days = [...p.days]
            const meals = [...days[dayIdx].meals]
            meals[mealIdx] = { ...meals[mealIdx], ...updated } as GymNutritionPlanMeal
            days[dayIdx] = { ...days[dayIdx], meals }
            return { ...p, days }
        })
    }

    const addMeal = (dayIdx: number) => {
        setPlan(p => {
            if (!p) return p
            const days = [...p.days]
            const meals = [...days[dayIdx].meals, {
                id: `new-${Date.now()}`,
                dayId: days[dayIdx].id,
                mealType: "breakfast",
                order: days[dayIdx].meals.length,
                title: null, description: null,
                customCalories: null, customProtein: null, customCarbs: null, customFats: null,
                recipeId: null, recipe: null, gymRecipeId: null, gymRecipe: null, notes: null,
            } as GymNutritionPlanMeal]
            days[dayIdx] = { ...days[dayIdx], meals }
            return { ...p, days }
        })
    }

    const removeMeal = (dayIdx: number, mealIdx: number) => {
        setPlan(p => {
            if (!p) return p
            const days = [...p.days]
            const meals = days[dayIdx].meals.filter((_, i) => i !== mealIdx)
            days[dayIdx] = { ...days[dayIdx], meals }
            return { ...p, days }
        })
    }

    const updateDayNotes = (dayIdx: number, notes: string) => {
        setPlan(p => {
            if (!p) return p
            const days = [...p.days]
            days[dayIdx] = { ...days[dayIdx], notes: notes || null }
            return { ...p, days }
        })
    }

    const handleCreateGymRecipe = async () => {
        if (!newGymRecipe.title.trim()) return
        setCreatingGymRecipe(true)
        try {
            const r = await createGymRecipe({
                title: newGymRecipe.title,
                description: newGymRecipe.description || null,
                calories: newGymRecipe.calories ? Number(newGymRecipe.calories) : null,
                protein: newGymRecipe.protein ? Number(newGymRecipe.protein) : null,
                carbs: newGymRecipe.carbs ? Number(newGymRecipe.carbs) : null,
                fats: newGymRecipe.fats ? Number(newGymRecipe.fats) : null,
                prepTimeMinutes: newGymRecipe.prepTimeMinutes ? Number(newGymRecipe.prepTimeMinutes) : null,
                servings: newGymRecipe.servings ? Number(newGymRecipe.servings) : null,
                mealType: newGymRecipe.mealType || null,
                notes: newGymRecipe.notes || null,
                imageUrl: null,
                ingredients: [],
            })
            setGymRecipes(prev => [...prev, r])
            setShowGymRecipeModal(false)
            setNewGymRecipe({ title: "", description: "", calories: "", protein: "", carbs: "", fats: "", prepTimeMinutes: "", servings: "", mealType: "", notes: "" })
        } catch (e) {
            alert("Error al crear la receta")
        } finally {
            setCreatingGymRecipe(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    )

    if (!plan) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-foreground font-medium">Plan no encontrado</p>
            <button onClick={() => router.push("/nutrition")} className="text-sm text-emerald-600 hover:underline">Volver</button>
        </div>
    )

    const currentDay = plan.days[activeDay]

    return (
        <div className="w-full min-h-full flex flex-col">
            {/* ─── Top Bar ────────────────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => router.push("/nutrition")} className="p-2 hover:bg-accent rounded-xl text-muted-foreground shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <input
                            value={plan.title}
                            onChange={e => setPlan(p => p ? { ...p, title: e.target.value } : p)}
                            className="text-xl font-bold text-foreground bg-transparent border-none outline-none w-full min-w-0 focus:ring-0"
                        />
                        <p className="text-xs text-muted-foreground truncate">
                            {getMemberName(plan.userId)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Status selector */}
                    <select
                        value={plan.status}
                        onChange={e => setPlan(p => p ? { ...p, status: e.target.value as any } : p)}
                        className="text-sm bg-card border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    <button
                        onClick={() => setShowGymRecipeModal(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-emerald-400 transition-colors"
                    >
                        <ChefHat className="w-4 h-4" /> Nueva receta
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ─── Day Sidebar ────────────────────────────────────── */}
                <div className="hidden md:flex flex-col w-48 shrink-0 border-r border-border bg-sidebar p-3 gap-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">Días</p>
                    {plan.days.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveDay(idx)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeDay === idx ? "bg-emerald-600 text-white" : "text-sidebar-foreground hover:bg-accent"}`}
                        >
                            <span>{day.dayLabel}</span>
                            <span className={`text-xs ${activeDay === idx ? "text-emerald-100" : "text-muted-foreground"}`}>{day.meals.length}</span>
                        </button>
                    ))}
                </div>

                {/* ─── Mobile day tabs ────────────────────────────────── */}
                <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 border-b border-border bg-card shrink-0 w-full">
                    {plan.days.map((day, idx) => (
                        <button key={idx} onClick={() => setActiveDay(idx)} className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium ${activeDay === idx ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                            {day.dayLabel.slice(0, 3)}
                        </button>
                    ))}
                </div>

                {/* ─── Day Content ─────────────────────────────────────── */}
                {currentDay && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Plan header info */}
                        {activeDay === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-muted/30 border border-border rounded-2xl">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descripción del plan</label>
                                    <textarea
                                        value={plan.description ?? ""}
                                        onChange={e => setPlan(p => p ? { ...p, description: e.target.value || null } : p)}
                                        placeholder="Descripción general..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notas del nutricionista</label>
                                    <textarea
                                        value={plan.notes ?? ""}
                                        onChange={e => setPlan(p => p ? { ...p, notes: e.target.value || null } : p)}
                                        placeholder="Indicaciones especiales..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Day title */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">{currentDay.dayLabel}</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {currentDay.meals.length} comida{currentDay.meals.length !== 1 ? "s" : ""}
                                    {currentDay.meals.length > 0 && ` · ${currentDay.meals.filter(m => m.recipeId || m.gymRecipeId).length} con receta`}
                                </p>
                            </div>
                        </div>

                        {/* Day notes */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><StickyNote className="w-3 h-3" /> Notas del día</label>
                            <input
                                value={currentDay.notes ?? ""}
                                onChange={e => updateDayNotes(activeDay, e.target.value)}
                                placeholder="Indicaciones especiales para este día..."
                                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            />
                        </div>

                        {/* Meals */}
                        <div className="space-y-3">
                            {currentDay.meals.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center border-2 border-dashed border-border rounded-2xl">
                                    <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-foreground">Sin comidas para {currentDay.dayLabel}</p>
                                        <p className="text-sm text-muted-foreground">Agregá comidas o recetas</p>
                                    </div>
                                    <button onClick={() => addMeal(activeDay)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
                                        <Plus className="w-4 h-4" /> Agregar comida
                                    </button>
                                </div>
                            ) : (
                                currentDay.meals.map((meal, mealIdx) => (
                                    <MealEditor
                                        key={meal.id ?? mealIdx}
                                        meal={meal}
                                        gymRecipes={gymRecipes}
                                        onUpdate={(updated) => updateMeal(activeDay, mealIdx, updated)}
                                        onDelete={() => removeMeal(activeDay, mealIdx)}
                                    />
                                ))
                            )}
                        </div>

                        {currentDay.meals.length > 0 && (
                            <button onClick={() => addMeal(activeDay)} className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-emerald-400 transition-colors w-full justify-center">
                                <Plus className="w-4 h-4" /> Agregar otra comida
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ─── New Gym Recipe Modal ─────────────────────────────────── */}
            {showGymRecipeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowGymRecipeModal(false) }}>
                    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ChefHat className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-foreground">Nueva receta del gym</h2>
                            </div>
                            <button onClick={() => setShowGymRecipeModal(false)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-muted-foreground">Esta receta quedará guardada en tu biblioteca y podrás reutilizarla en cualquier plan.</p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre *</label>
                                <input value={newGymRecipe.title} onChange={e => setNewGymRecipe(r => ({ ...r, title: e.target.value }))} placeholder="Ej: Bowl de arroz con pollo" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción / Preparación</label>
                                <textarea value={newGymRecipe.description} onChange={e => setNewGymRecipe(r => ({ ...r, description: e.target.value }))} rows={3} placeholder="Cómo se prepara..." className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de comida</label>
                                <select value={newGymRecipe.mealType} onChange={e => setNewGymRecipe(r => ({ ...r, mealType: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none">
                                    <option value="">Sin especificar</option>
                                    {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: "calories", label: "Calorías (kcal)" },
                                    { key: "protein", label: "Proteína (g)" },
                                    { key: "carbs", label: "Carbos (g)" },
                                    { key: "fats", label: "Grasas (g)" },
                                    { key: "prepTimeMinutes", label: "Tiempo prep. (min)" },
                                    { key: "servings", label: "Porciones" },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                                        <input type="number" value={(newGymRecipe as any)[key]} onChange={e => setNewGymRecipe(r => ({ ...r, [key]: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none" placeholder="0" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Notas</label>
                                <input value={newGymRecipe.notes} onChange={e => setNewGymRecipe(r => ({ ...r, notes: e.target.value }))} placeholder="Consejos, variantes..." className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowGymRecipeModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">Cancelar</button>
                            <button onClick={handleCreateGymRecipe} disabled={creatingGymRecipe || !newGymRecipe.title.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                                {creatingGymRecipe ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creatingGymRecipe ? "Creando..." : "Crear receta"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
