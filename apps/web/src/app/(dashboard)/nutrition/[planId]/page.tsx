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
    FileText, StickyNote, Tag, AlertCircle, ChefHat, Globe, Sparkles, Flame, Clock, Printer
} from "lucide-react"

const DAYS = ["General", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const MEAL_TYPES = [
    { value: "breakfast", label: "🌅 Desayuno" },
    { value: "lunch", label: "☀️ Almuerzo" },
    { value: "dinner", label: "🌙 Cena" },
    { value: "snack", label: "🍎 Merienda" },
    { value: "dessert", label: "🍨 Postre" },
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
    const [dietFilter, setDietFilter] = useState("")
    const [viewRecipeContext, setViewRecipeContext] = useState<{ id: string; type: 'global' | 'gym'; mode: 'view' | 'select' } | null>(null)
    const [globalResults, setGlobalResults] = useState<GlobalRecipeSummary[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [showRecipePicker, setShowRecipePicker] = useState(false)
    const [pickerTab, setPickerTab] = useState<"global" | "gym">("global")

    const doSearch = useCallback(async (q: string, filter: string, diet: string) => {
        setSearchLoading(true)
        try {
            const results = await searchGlobalRecipes(q, 100, diet)
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
        const t = setTimeout(() => doSearch(recipeSearch, recipeFilter, dietFilter), 400)
        return () => clearTimeout(t)
    }, [recipeSearch, recipeFilter, dietFilter, doSearch])

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
                            <div className="flex items-start gap-4 p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl relative group">
                                <div className="w-16 h-16 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200/50 dark:border-emerald-800/50">
                                    {selectedRecipeImage ? (
                                        <img src={selectedRecipeImage} alt={selectedRecipeName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Salad className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate mb-1">{selectedRecipeName}</h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-700/80 dark:text-emerald-300/80 mb-2">
                                        {(meal.recipe?.calories != null || meal.gymRecipe?.calories != null) && <span className="flex items-center gap-1 font-medium"><Flame className="w-3 h-3 text-orange-500"/> {Math.round(meal.recipe?.calories ?? meal.gymRecipe?.calories ?? 0)} kcal</span>}
                                        {(meal.recipe?.prepTimeMinutes != null || meal.gymRecipe?.prepTimeMinutes != null) && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500"/> {meal.recipe?.prepTimeMinutes ?? meal.gymRecipe?.prepTimeMinutes} min</span>}
                                        {(meal.recipe?.carbs != null || meal.gymRecipe?.carbs != null) && <span>C: {Math.round(meal.recipe?.carbs ?? meal.gymRecipe?.carbs ?? 0)}g</span>}
                                        {(meal.recipe?.protein != null || meal.gymRecipe?.protein != null) && <span>P: {Math.round(meal.recipe?.protein ?? meal.gymRecipe?.protein ?? 0)}g</span>}
                                        {(meal.recipe?.fats != null || meal.gymRecipe?.fats != null) && <span>G: {Math.round(meal.recipe?.fats ?? meal.gymRecipe?.fats ?? 0)}g</span>}
                                    </div>
                                    {meal.recipe && (
                                        <div className="flex gap-2">
                                            <button onClick={() => setViewRecipeContext({ id: meal.recipeId!, type: 'global', mode: 'view' })} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1">
                                                <BookOpen className="w-3.5 h-3.5" /> Ver detalles
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => onUpdate({ ...meal, recipeId: null, recipe: null, gymRecipeId: null, gymRecipe: null })} className="p-1.5 text-emerald-600 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors absolute top-2 right-2">
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
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Aclaraciones</label>
                        <textarea
                            value={meal.description ?? ""}
                            onChange={e => onUpdate({ ...meal, description: e.target.value || null })}
                            placeholder="Describe la preparación, cantidad, modo de consumo..."
                            rows={2}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
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
                        <textarea
                            value={meal.notes ?? ""}
                            onChange={e => onUpdate({ ...meal, notes: e.target.value || null })}
                            placeholder="Indicaciones para el socio..."
                            rows={2}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
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
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        <button onClick={() => setDietFilter("")} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dietFilter === "" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                            Cualquier dieta
                                        </button>
                                        <button onClick={() => setDietFilter("vegetarian")} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dietFilter === "vegetarian" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                            Vegetariano
                                        </button>
                                        <button onClick={() => setDietFilter("vegan")} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dietFilter === "vegan" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                            Vegano
                                        </button>
                                        <button onClick={() => setDietFilter("gluten_free")} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dietFilter === "gluten_free" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                            Sin TACC
                                        </button>
                                        <button onClick={() => setDietFilter("lactose_free")} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dietFilter === "lactose_free" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                            Sin lactosa
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto flex-1 p-3 space-y-2">
                                    {searchLoading ? (
                                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                    ) : globalResults.length === 0 ? (
                                        <p className="text-center text-sm text-muted-foreground py-8">Sin resultados</p>
                                    ) : (
                                        globalResults.map(r => (
                                            <button key={r.id} onClick={() => setViewRecipeContext({ id: r.id, type: 'global', mode: 'select' })}
                                                className="w-full flex items-start gap-4 p-3 border border-border rounded-xl hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left group transition-all"
                                            >
                                                <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-border">
                                                    {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <Salad className="w-8 h-8 text-muted-foreground" />}
                                                </div>
                                                <div className="flex-1 min-w-0 py-0.5">
                                                    <h4 className="font-semibold text-foreground truncate mb-1">{r.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-1.5">
                                                        {r.calories != null && <span className="flex items-center gap-1 font-medium text-foreground"><Flame className="w-3.5 h-3.5 text-orange-500"/> {Math.round(r.calories)} kcal</span>}
                                                        {r.prepTimeMinutes != null && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500"/> {r.prepTimeMinutes} min</span>}
                                                        {r.carbs != null && <span className="text-muted-foreground/80">C: {Math.round(r.carbs)}g</span>}
                                                        {r.protein != null && <span className="text-muted-foreground/80">P: {Math.round(r.protein)}g</span>}
                                                        {r.fats != null && <span className="text-muted-foreground/80">G: {Math.round(r.fats)}g</span>}
                                                    </div>
                                                    {r.dietTags && r.dietTags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {r.dietTags.includes('vegetarian') && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">Vegetariano</span>}
                                                            {r.dietTags.includes('vegan') && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">Vegano</span>}
                                                            {r.dietTags.includes('gluten_free') && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">Sin TACC</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
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
            {/* Recipe Details Modal */}
            <RecipeDetailsModal
                isOpen={viewRecipeContext !== null}
                onClose={() => setViewRecipeContext(null)}
                context={viewRecipeContext}
                onSelect={(details) => {
                    onUpdate({ ...meal, recipeId: details.id, recipe: details as any, gymRecipeId: null, gymRecipe: null, title: meal.title ?? details.title })
                    setShowRecipePicker(false)
                }}
            />
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
    const [printMode, setPrintMode] = useState<'general' | 'days'>('general')

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
            if (p) {
                const existingLabels = p.days?.map((d: any) => d.dayLabel) || []
                const missingDays = DAYS.filter(d => !existingLabels.includes(d))
                if (missingDays.length > 0) {
                    missingDays.forEach(md => {
                        p.days.push({
                            id: `new-${md}-${Date.now()}`,
                            planId: p.id,
                            dayNumber: DAYS.indexOf(md),
                            dayLabel: md,
                            notes: null,
                            meals: []
                        } as any)
                    })
                }
                // Sort by DAYS order
                p.days.sort((a: any, b: any) => DAYS.indexOf(a.dayLabel) - DAYS.indexOf(b.dayLabel))
            }
            setPlan(p)
            setGymRecipes(r)
            setMembers(m.filter(m => m.user?.id))
        }).catch(console.error).finally(() => setLoading(false))
    }, [planId])

    const getMemberName = (userId: number) => {
        const m = members.find(m => m.user?.id === userId)
        return m?.user ? (m.user.name ? `${m.user.name} (${m.user.email})` : m.user.email) : `Usuario #${userId}`
    }

    const handlePrint = (mode: 'general' | 'days') => {
        setPrintMode(mode)
        setTimeout(() => window.print(), 100)
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

    const addMeal = (dayIdx: number, defaultMealType: string = "breakfast") => {
        setPlan(p => {
            if (!p) return p
            const days = [...p.days]
            const meals = [...days[dayIdx].meals, {
                id: `new-${Date.now()}`,
                dayId: days[dayIdx].id,
                mealType: defaultMealType,
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
    const isGeneralDay = currentDay?.dayLabel === "General"

    let generalDayNotes: Record<string, string> = {}
    if (isGeneralDay) {
        try {
            const parsed = JSON.parse(currentDay.notes || "{}")
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                generalDayNotes = parsed
            } else {
                generalDayNotes = { general: currentDay.notes || "" }
            }
        } catch {
            generalDayNotes = { general: currentDay.notes || "" }
        }
    }
    const updateGeneralNote = (key: string, value: string) => {
        const newNotes = { ...generalDayNotes, [key]: value }
        updateDayNotes(activeDay, JSON.stringify(newNotes))
    }

    return (
        <>
            <div className="w-full min-h-full flex flex-col print:hidden">
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
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <p className="text-xs font-medium text-emerald-600 truncate">
                                {getMemberName(plan.userId)}
                            </p>
                            {(() => {
                                const m = members.find(mbr => mbr.user?.id === plan.userId)?.user as any;
                                if (!m) return null;
                                return (
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground mt-1">
                                        {m.calories > 0 && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md shadow-sm">🔥 {m.calories} kcal</span>}
                                        {m.profile?.peso && <span className="bg-muted px-2.5 py-1 rounded-md border border-border shadow-sm">⚖️ Peso: {m.profile.peso}kg</span>}
                                        {m.targetWeight && <span className="bg-muted px-2.5 py-1 rounded-md border border-border shadow-sm">🎯 Obj: {m.targetWeight}kg</span>}
                                        {m.profile?.altura && <span className="bg-muted px-2.5 py-1 rounded-md border border-border shadow-sm">📏 {m.profile.altura}cm</span>}
                                        {m.dailyWaterGoal && <span className="bg-muted px-2.5 py-1 rounded-md border border-border shadow-sm">💧 {m.dailyWaterGoal}L</span>}
                                    </div>
                                )
                            })()}
                        </div>
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
                        className="hidden md:flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-emerald-400 transition-colors print:hidden"
                    >
                        <ChefHat className="w-4 h-4" /> Nueva receta
                    </button>

                    <div className="hidden md:flex items-center gap-2 print:hidden">
                        <button onClick={() => handlePrint('general')} className="px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-blue-400 transition-colors flex items-center gap-1.5">
                            <Printer className="w-4 h-4" /> PDF General
                        </button>
                        <button onClick={() => handlePrint('days')} className="px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-blue-400 transition-colors flex items-center gap-1.5">
                            <Printer className="w-4 h-4" /> PDF Días
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all print:hidden ${saved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ─── Day Sidebar ────────────────────────────────────── */}
                <div className="hidden md:flex flex-col w-48 shrink-0 border-r border-border bg-sidebar p-3 gap-1">
                    {plan.days[0] && (
                        <button
                            key={0}
                            onClick={() => setActiveDay(0)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeDay === 0 ? "bg-emerald-600 text-white" : "text-sidebar-foreground hover:bg-accent"}`}
                        >
                            <span>{plan.days[0].dayLabel}</span>
                            <span className={`text-xs ${activeDay === 0 ? "text-emerald-100" : "text-muted-foreground"}`}>{plan.days[0].meals.length}</span>
                        </button>
                    )}
                    
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mt-2">Días</p>
                    
                    {plan.days.slice(1).map((day, offsetIdx) => {
                        const idx = offsetIdx + 1;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveDay(idx)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeDay === idx ? "bg-emerald-600 text-white" : "text-sidebar-foreground hover:bg-accent"}`}
                            >
                                <span>{day.dayLabel}</span>
                                <span className={`text-xs ${activeDay === idx ? "text-emerald-100" : "text-muted-foreground"}`}>{day.meals.length}</span>
                            </button>
                        )
                    })}
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
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notas del nutricionista</label>
                                    <textarea
                                        value={plan.notes ?? ""}
                                        onChange={e => setPlan(p => p ? { ...p, notes: e.target.value || null } : p)}
                                        placeholder="Indicaciones especiales..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                                    />
                                </div>
                            </div>
                        )}

                        {!isGeneralDay && (
                            <>
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
                            </>
                        )}

                        {/* Day notes */}
                        {isGeneralDay ? (
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><StickyNote className="w-3 h-3" /> Notas Generales</label>
                                <textarea
                                    value={generalDayNotes.general ?? ""}
                                    onChange={e => updateGeneralNote('general', e.target.value)}
                                    placeholder="Indicaciones generales para estas opciones..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                                />
                            </div>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><StickyNote className="w-3 h-3" /> Notas del día</label>
                                <textarea
                                    value={currentDay.notes ?? ""}
                                    onChange={e => updateDayNotes(activeDay, e.target.value)}
                                    placeholder="Indicaciones especiales para este día..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                                />
                            </div>
                        )}

                        {/* Meals */}
                        {isGeneralDay ? (
                            <div className="space-y-10">
                                {MEAL_TYPES.map(mt => {
                                    const typeMeals = currentDay.meals.filter(m => m.mealType === mt.value);
                                    return (
                                        <div key={mt.value} className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-foreground">{mt.label}</h3>
                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{typeMeals.length} opciones</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notas para {mt.label.split(" ")[1] || "sección"}</label>
                                                <textarea
                                                    value={generalDayNotes[mt.value] ?? ""}
                                                    onChange={e => updateGeneralNote(mt.value, e.target.value)}
                                                    placeholder={`Indicaciones generales para ${mt.label.split(" ")[1]?.toLowerCase() || "este apartado"}...`}
                                                    rows={1}
                                                    className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                                                />
                                            </div>
                                            {typeMeals.map((meal) => {
                                                const globalIdx = currentDay.meals.findIndex(m => m.id === meal.id || m === meal);
                                                return (
                                                    <MealEditor
                                                        key={meal.id ?? globalIdx}
                                                        meal={meal}
                                                        gymRecipes={gymRecipes}
                                                        onUpdate={(updated) => updateMeal(activeDay, globalIdx, updated)}
                                                        onDelete={() => removeMeal(activeDay, globalIdx)}
                                                    />
                                                );
                                            })}
                                            <button onClick={() => addMeal(activeDay, mt.value)} className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-emerald-400 transition-colors w-full justify-center group">
                                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Agregar opción
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
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

                                {currentDay.meals.length > 0 && (
                                    <button onClick={() => addMeal(activeDay)} className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-emerald-400 transition-colors w-full justify-center">
                                        <Plus className="w-4 h-4" /> Agregar otra comida
                                    </button>
                                )}
                            </div>
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
                                <textarea value={newGymRecipe.description} onChange={e => setNewGymRecipe(r => ({ ...r, description: e.target.value }))} rows={3} placeholder="Cómo se prepara..." className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y" />
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

            {/* ─── Print View ────────────────────────────────────────────── */}
            <div className="hidden print:block p-8 bg-white text-black min-h-screen font-sans">
                <style>{`
                    @media print {
                        @page { margin: 0; }
                        body { margin: 1.6cm; }
                    }
                `}</style>
                {/* Header */}
                <div className="border-b-2 border-emerald-600 pb-6 mb-8 flex justify-between items-end">
                    <div className="flex items-center gap-4">
                        {gym?.logo_url && (
                            <img src={gym.logo_url} alt={gym.name} className="w-16 h-16 object-contain rounded-lg" />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{gym?.name || 'Gimnasio'}</h1>
                            <p className="text-sm text-gray-500 mt-1">Plan de Alimentación</p>
                        </div>
                    </div>
                </div>

                {/* Plan Info */}
                <div className="mb-8 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
                    {plan.description && <p className="text-gray-700">{plan.description}</p>}
                    {plan.notes && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-bold text-gray-800 mb-1">Notas del nutricionista:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{plan.notes}</p>
                        </div>
                    )}
                </div>

                {/* Days / Meals */}
                {plan.days
                    .filter(day => {
                        const isGeneral = day.dayLabel === "General";
                        if (printMode === 'general' && !isGeneral) return false;
                        if (printMode === 'days' && isGeneral) return false;
                        if (day.meals.length === 0) {
                            if (!day.notes || !day.notes.trim()) return false;
                            if (isGeneral) {
                                try {
                                    const parsed = JSON.parse(day.notes);
                                    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                                        const hasAnyNote = Object.values(parsed).some(v => v && typeof v === 'string' && v.trim().length > 0);
                                        if (!hasAnyNote) return false;
                                    }
                                } catch {
                                    // Not JSON, but string is not empty
                                }
                            }
                        }
                        return true;
                    })
                    .map((day, idx) => {
                    // For General plan, we might want to group by mealType in the print view as well
                    const isGeneral = day.dayLabel === "General"
                    let printGeneralNotes: Record<string, string> = {}
                    if (isGeneral && day.notes) {
                        try {
                            const parsed = JSON.parse(day.notes)
                            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) printGeneralNotes = parsed
                            else printGeneralNotes = { general: day.notes }
                        } catch {
                            printGeneralNotes = { general: day.notes }
                        }
                    }
                    
                    return (
                        <div key={idx} className="mb-10 page-break-inside-avoid">
                            <h3 className="text-xl font-bold text-emerald-700 border-b border-gray-200 pb-2 mb-4">
                                {isGeneral ? "Opciones Generales" : day.dayLabel}
                            </h3>
                            {day.notes && !isGeneral && (
                                <div className="mb-4 text-sm text-gray-600 italic">
                                    Notas del día: {day.notes}
                                </div>
                            )}
                            {isGeneral && printGeneralNotes.general && (
                                <div className="mb-4 text-sm text-gray-600 italic">
                                    Notas Generales: {printGeneralNotes.general}
                                </div>
                            )}
                            <div className="space-y-6">
                                {isGeneral ? (
                                    MEAL_TYPES.map(mt => {
                                        const typeMeals = day.meals.filter(m => m.mealType === mt.value);
                                        const hasNote = !!printGeneralNotes[mt.value] && printGeneralNotes[mt.value].trim().length > 0;
                                        if (typeMeals.length === 0 && !hasNote) return null;
                                        return (
                                            <div key={mt.value} className="mb-8">
                                                <h3 className="text-lg font-bold text-emerald-700 border-b border-gray-100 pb-2 mb-2">{mt.label}</h3>
                                                {hasNote && (
                                                    <div className="mb-4 text-sm text-gray-600 italic">
                                                        {printGeneralNotes[mt.value]}
                                                    </div>
                                                )}
                                                {typeMeals.length > 0 && (
                                                    <div className="space-y-4 mt-4">
                                                        {typeMeals.map((meal, midx) => (
                                                            <PrintMealCard key={midx} meal={meal} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    day.meals.length > 0 && (
                                        day.meals.map((meal, midx) => (
                                            <PrintMealCard key={midx} meal={meal} />
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

function PrintMealCard({ meal }: { meal: any }) {
    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm page-break-inside-avoid">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900">{meal.title || meal.recipe?.title || meal.gymRecipe?.title || 'Comida'}</h4>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {MEAL_TYPE_LABEL[meal.mealType] || meal.mealType}
                </span>
            </div>
            {(meal.description || meal.recipe?.description || meal.gymRecipe?.description) && (
                <p className="text-sm text-gray-600 mb-3">
                    {meal.description || meal.recipe?.description || meal.gymRecipe?.description}
                </p>
            )}
            <div className="flex gap-4 text-xs text-gray-500 font-medium">
                <span>🔥 {Math.round(meal.customCalories || meal.recipe?.calories || meal.gymRecipe?.calories || 0)} kcal</span>
                <span>🥩 P: {Math.round(meal.customProtein || meal.recipe?.protein || meal.gymRecipe?.protein || 0)}g</span>
                <span>🍚 C: {Math.round(meal.customCarbs || meal.recipe?.carbs || meal.gymRecipe?.carbs || 0)}g</span>
                <span>🥑 G: {Math.round(meal.customFats || meal.recipe?.fats || meal.gymRecipe?.fats || 0)}g</span>
            </div>
            {(meal.recipe?.ingredients?.length > 0 || meal.recipe?.steps?.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meal.recipe.ingredients?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-800 mb-2">Ingredientes:</p>
                            <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                                {meal.recipe.ingredients.map((ing: any) => (
                                    <li key={ing.id}>{ing.name} - {ing.amount} {ing.unit}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {meal.recipe.steps?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-800 mb-2">Preparación:</p>
                            <ol className="list-decimal pl-4 text-sm text-gray-600 space-y-1">
                                {meal.recipe.steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber).map((step: any) => (
                                    <li key={step.id}>{step.instruction}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}



function RecipeDetailsModal({
    isOpen,
    onClose,
    context,
    onSelect
}: {
    isOpen: boolean;
    onClose: () => void;
    context: { id: string; type: 'global' | 'gym'; mode: 'view' | 'select' } | null;
    onSelect?: (recipe: any) => void;
}) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !context) return;
        let active = true;
        setDetails(null);
        if (context.type === 'global') {
            setLoading(true);
            import('@/lib/api/gymNutrition').then(m => m.getGlobalRecipe(context.id))
                .then(res => {
                    if (active) setDetails(res);
                })
                .catch(() => alert("Error al cargar detalles"))
                .finally(() => active && setLoading(false));
        } else {
            // Gym recipe doesn't have detailed endpoint yet, just use basic info
            // In a real app we would pass the gym recipe object or fetch it
        }
        return () => { active = false };
    }, [isOpen, context]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        Detalles de la receta
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-xl text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : details ? (
                        <>
                            <div className="flex gap-6 items-start">
                                <div className="w-32 h-32 shrink-0 bg-muted rounded-2xl overflow-hidden border border-border">
                                    {details.imageUrl ? <img src={details.imageUrl} className="w-full h-full object-cover" /> : <Salad className="w-12 h-12 text-muted-foreground m-10" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-2">{details.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                        {details.calories != null && <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500"/> {Math.round(details.calories)} kcal</span>}
                                        {details.prepTimeMinutes != null && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500"/> {details.prepTimeMinutes} min</span>}
                                        {details.carbs != null && <span>C: {Math.round(details.carbs)}g</span>}
                                        {details.protein != null && <span>P: {Math.round(details.protein)}g</span>}
                                        {details.fats != null && <span>G: {Math.round(details.fats)}g</span>}
                                    </div>
                                    {details.dietTags && details.dietTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {details.dietTags.includes('vegetarian') && <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Vegetariano</span>}
                                            {details.dietTags.includes('vegan') && <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Vegano</span>}
                                            {details.dietTags.includes('gluten_free') && <span className="px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Sin TACC</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {details.ingredients && details.ingredients.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2"><Salad className="w-4 h-4" /> Ingredientes</h4>
                                    <ul className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                                        {details.ingredients.map((ing: any) => (
                                            <li key={ing.id} className="text-sm flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                <span className="font-medium">{ing.quantity ? ing.quantity : ""} {ing.unit ? ing.unit : ""}</span>
                                                <span className="text-muted-foreground">{ing.name} {ing.optional && "(opcional)"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {details.steps && details.steps.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" /> Preparación</h4>
                                    <div className="space-y-4">
                                        {details.steps.map((step: any) => (
                                            <div key={step.id} className="flex gap-4 items-start">
                                                <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">
                                                    {step.stepNumber}
                                                </div>
                                                <div>
                                                    {step.title && <h5 className="font-medium text-sm mb-1">{step.title}</h5>}
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground">
                            No se pudieron cargar los detalles.
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {context?.mode === 'select' && onSelect && details && (
                    <div className="p-4 border-t border-border flex justify-end shrink-0">
                        <button onClick={() => { onSelect(details); onClose(); }} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Vincular a esta comida
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
