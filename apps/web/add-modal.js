const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(dashboard)/nutrition/[planId]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const modalComponent = `
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
`;

content = content + '\n\n' + modalComponent;
fs.writeFileSync(filePath, content);
console.log('Appended RecipeDetailsModal to page.tsx');
