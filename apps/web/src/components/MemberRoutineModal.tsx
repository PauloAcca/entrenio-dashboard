import { useEffect, useState } from "react";
import { getMemberRoutine, updateMemberRoutineExercises, getMemberProfile, createMemberRoutine, upsertMemberProfile } from "@/lib/api/members";
import { searchExercises, ExerciseData } from "@/lib/api/exercises";
import { membership, user } from "@/types/entities";

type MemberModalProps = {
    member: membership & { user: user };
    onClose: () => void;
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url: string | null) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
type NewExercise = {
    id: string; // temp id for UI
    name: string;
    exerciseId?: number;
    sets: number;
    reps: string;
    rest: string;
};

type NewSession = {
    id: string; // temp id for UI
    day_label: string;
    focus: string;
    exercises: NewExercise[];
};

type NewRoutineForm = {
    name: string;
    goal: string;
    intensity: string;
    days_per_week: number;
    sessions: NewSession[];
};

type ProfileForm = {
    sexo: string;
    fechaNacimiento: string;
    peso: string;
    altura: string;
    objetivo: string;
    enfoque: string;
    intensidad: string;
    experiencia: string;
    dias: string;
    tiempo: string;
    actividad: string;
    lesion: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const normalizeValue = (value: string | null) => {
    if (!value) return '-';
    const mapping: Record<string, string> = {
        ganar_masa_muscular: 'Ganar masa muscular',
        perder_peso: 'Perder peso',
        mantener_peso: 'Mantener peso',
        mejorar_salud: 'Mejorar salud',
        strength: 'Fuerza',
        hybrid: 'Híbrido',
        cardio: 'Cardio',
        hypertrophy: 'Hipertrofia',
        fuerza: 'Fuerza',
        hipertrofia: 'Hipertrofia',
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        baja: 'Baja',
        media: 'Media',
        alta: 'Alta',
        male: 'Hombre',
        female: 'Mujer',
        other: 'Otro',
        principiante: 'Principiante',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado',
        sedentario: 'Sedentario',
        ligero: 'Ligero',
        moderado: 'Moderado',
        activo: 'Activo',
        muy_activo: 'Muy activo',
    };
    const key = value.toLowerCase().trim();
    if (mapping[key]) return mapping[key];
    const normalized = value.replace(/_/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const emptyProfileForm = (): ProfileForm => ({
    sexo: '',
    fechaNacimiento: '',
    peso: '',
    altura: '',
    objetivo: '',
    enfoque: '',
    intensidad: '',
    experiencia: '',
    dias: '',
    tiempo: '',
    actividad: '',
    lesion: '',
});

const profileFromData = (data: any): ProfileForm => ({
    sexo: data.sexo ?? '',
    fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString().split('T')[0] : '',
    peso: data.peso != null ? String(data.peso) : '',
    altura: data.altura != null ? String(data.altura) : '',
    objetivo: data.objetivo ?? '',
    enfoque: data.enfoque ?? '',
    intensidad: data.intensidad ?? '',
    experiencia: data.experiencia ?? '',
    dias: data.dias != null ? String(data.dias) : '',
    tiempo: data.tiempo != null ? String(data.tiempo) : '',
    actividad: data.actividad ?? '',
    lesion: data.lesion ?? '',
});

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export default function MemberRoutineModal({ member, onClose }: MemberModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'routine' | 'nutrition'>('info');

    // ── Profile ──────────────────────────────────────────────────────────────
    const [profile, setProfile] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm());
    const [savingProfile, setSavingProfile] = useState(false);

    // ── Existing Routine ─────────────────────────────────────────────────────
    const [routine, setRoutine] = useState<any>(null);
    const [loadingRoutine, setLoadingRoutine] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [localRoutine, setLocalRoutine] = useState<any>(null);
    const [removes, setRemoves] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    // ── New Routine Creator ──────────────────────────────────────────────────
    const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
    const [newRoutineForm, setNewRoutineForm] = useState<NewRoutineForm>({
        name: '',
        goal: '',
        intensity: '',
        days_per_week: 3,
        sessions: [],
    });
    const [savingNewRoutine, setSavingNewRoutine] = useState(false);

    // ── Exercise Search ──────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMuscle, setSearchMuscle] = useState('');
    const [searchEquipment, setSearchEquipment] = useState('');
    const [onlyGymEquipment, setOnlyGymEquipment] = useState(true);
    const [searchResults, setSearchResults] = useState<ExerciseData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    // For existing routine edit
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    // For new routine creator: { sessionTempId }
    const [newRoutineSearchSessionId, setNewRoutineSearchSessionId] = useState<string | null>(null);

    const userId = member.user?.id || null;

    // ── Effects ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userId) fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (activeTab === 'routine' && !routine && userId) fetchRoutine();
    }, [activeTab, userId]);

    // ── Nutrition Plan ───────────────────────────────────────────────────────
    const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
    const [loadingNutrition, setLoadingNutrition] = useState(false);

    useEffect(() => {
        if (activeTab === 'nutrition' && nutritionPlans.length === 0 && userId) {
            setLoadingNutrition(true);
            import('@/lib/api/gymNutrition')
                .then(m => m.getNutritionPlans(userId))
                .then(data => setNutritionPlans(data))
                .catch(err => console.error(err))
                .finally(() => setLoadingNutrition(false));
        }
    }, [activeTab, userId, nutritionPlans.length]);

    useEffect(() => {
        const sessionActive = activeSessionId !== null || newRoutineSearchSessionId !== null;
        if (!sessionActive) return;
        const delay = setTimeout(() => {
            setIsSearching(true);
            searchExercises(searchQuery, searchMuscle, searchEquipment, member.gym_id, onlyGymEquipment).then(setSearchResults).finally(() => setIsSearching(false));
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery, searchMuscle, searchEquipment, onlyGymEquipment, activeSessionId, newRoutineSearchSessionId, member.gym_id]);

    // ── Fetch helpers ─────────────────────────────────────────────────────────
    const fetchProfile = async () => {
        if (!userId) return;
        setProfileLoading(true);
        try {
            const data = await getMemberProfile(userId);
            setProfile(data);
            if (data) setProfileForm(profileFromData(data));
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchRoutine = () => {
        if (!userId) return;
        setLoadingRoutine(true);
        getMemberRoutine(userId)
            .then(data => {
                setRoutine(data);
                setLocalRoutine(JSON.parse(JSON.stringify(data)));
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError('No se pudo cargar la rutina.');
            })
            .finally(() => setLoadingRoutine(false));
    };

    // ── Profile Save ──────────────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        if (!userId) return;
        setSavingProfile(true);
        try {
            await upsertMemberProfile(userId, {
                ...profileForm,
                dias: profileForm.dias ? Number(profileForm.dias) : undefined,
                tiempo: profileForm.tiempo ? Number(profileForm.tiempo) : undefined,
                peso: profileForm.peso ? Number(profileForm.peso) : undefined,
                altura: profileForm.altura ? Number(profileForm.altura) : undefined,
            });
            await fetchProfile();
            setIsEditingProfile(false);
            alert('Perfil guardado correctamente.');
        } catch (err) {
            console.error(err);
            alert('Error al guardar el perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    // ── Existing Routine Edit ─────────────────────────────────────────────────
    const handleEditToggle = () => {
        if (isEditing) {
            if (confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.')) {
                setLocalRoutine(JSON.parse(JSON.stringify(routine)));
                setRemoves([]);
                setIsEditing(false);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (!localRoutine || !userId) return;
        setSaving(true);
        const updates: any[] = [];
        const adds: any[] = [];
        localRoutine.routine_sessions?.forEach((session: any) => {
            session.routine_exercises?.forEach((ex: any, idx: number) => {
                const isNew = String(ex.id).startsWith('temp-');
                const exData = { reps: ex.reps, sets: Number(ex.sets), rest: ex.rest, name: ex.name, order: idx, exerciseId: ex.exerciseId };
                if (isNew) adds.push({ sessionId: session.id, ...exData });
                else updates.push({ id: ex.id, ...exData });
            });
        });
        try {
            await updateMemberRoutineExercises(userId, { updates, adds, removes });
            setIsEditing(false);
            alert('Rutina actualizada correctamente.');
            fetchRoutine();
        } catch (err) {
            console.error(err);
            alert('Error al guardar la rutina.');
        } finally {
            setSaving(false);
        }
    };

    const updateExerciseField = (sessionId: number, exerciseId: any, field: string, value: string) => {
        setLocalRoutine((prev: any) => {
            const next = { ...prev };
            const session = next.routine_sessions.find((s: any) => s.id === sessionId);
            if (session) {
                const ex = session.routine_exercises.find((e: any) => e.id === exerciseId);
                if (ex) ex[field] = value;
            }
            return next;
        });
    };

    const removeExercise = (sessionId: number, exerciseId: any) => {
        if (!String(exerciseId).startsWith('temp-')) setRemoves(prev => [...prev, exerciseId]);
        setLocalRoutine((prev: any) => {
            const next = { ...prev };
            const session = next.routine_sessions.find((s: any) => s.id === sessionId);
            if (session) session.routine_exercises = session.routine_exercises.filter((e: any) => e.id !== exerciseId);
            return next;
        });
    };

    const addExerciseFromSearch = (exercise: ExerciseData) => {
        if (activeSessionId !== null) {
            // Existing routine edit
            setLocalRoutine((prev: any) => {
                const next = { ...prev };
                const session = next.routine_sessions.find((s: any) => s.id === activeSessionId);
                if (session) {
                    if (!session.routine_exercises) session.routine_exercises = [];
                    session.routine_exercises.push({ id: 'temp-' + Date.now(), name: exercise.nameEs, exerciseId: exercise.id, sets: 3, reps: '10', rest: '60s' });
                }
                return next;
            });
            setActiveSessionId(null);
        } else if (newRoutineSearchSessionId !== null) {
            // New routine creator
            setNewRoutineForm(prev => ({
                ...prev,
                sessions: prev.sessions.map(s =>
                    s.id !== newRoutineSearchSessionId ? s : {
                        ...s,
                        exercises: [...s.exercises, { id: 'temp-' + Date.now(), name: exercise.nameEs, exerciseId: exercise.id, sets: 3, reps: '10', rest: '60s' }]
                    }
                )
            }));
            setNewRoutineSearchSessionId(null);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    // ── New Routine Creator ───────────────────────────────────────────────────
    const addSession = () => {
        setNewRoutineForm(prev => ({
            ...prev,
            sessions: [...prev.sessions, { id: 'session-' + Date.now(), day_label: `Día ${prev.sessions.length + 1}`, focus: '', exercises: [] }]
        }));
    };

    const removeSession = (sessionId: string) => {
        setNewRoutineForm(prev => ({ ...prev, sessions: prev.sessions.filter(s => s.id !== sessionId) }));
    };

    const updateSessionField = (sessionId: string, field: 'day_label' | 'focus', value: string) => {
        setNewRoutineForm(prev => ({ ...prev, sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, [field]: value } : s) }));
    };

    const removeNewExercise = (sessionId: string, exerciseId: string) => {
        setNewRoutineForm(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id !== sessionId ? s : { ...s, exercises: s.exercises.filter(e => e.id !== exerciseId) })
        }));
    };

    const updateNewExerciseField = (sessionId: string, exerciseId: string, field: string, value: string) => {
        setNewRoutineForm(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id !== sessionId ? s : {
                ...s,
                exercises: s.exercises.map(e => e.id !== exerciseId ? e : { ...e, [field]: value })
            })
        }));
    };

    const handleCreateRoutine = async () => {
        if (!userId) return;
        if (!newRoutineForm.name.trim()) { alert('Ingresá un nombre para la rutina.'); return; }
        if (newRoutineForm.sessions.length === 0) { alert('Agregá al menos una sesión.'); return; }
        setSavingNewRoutine(true);
        try {
            await createMemberRoutine(userId, {
                name: newRoutineForm.name,
                goal: newRoutineForm.goal || undefined,
                intensity: newRoutineForm.intensity || undefined,
                days_per_week: newRoutineForm.days_per_week,
                sessions: newRoutineForm.sessions.map((s, idx) => ({
                    day_label: s.day_label,
                    focus: s.focus || undefined,
                    order: idx,
                    exercises: s.exercises.map((ex, exIdx) => ({
                        name: ex.name,
                        exerciseId: ex.exerciseId,
                        sets: Number(ex.sets),
                        reps: ex.reps,
                        rest: ex.rest || undefined,
                        order: exIdx,
                    }))
                }))
            });
            alert('Rutina creada correctamente.');
            setIsCreatingRoutine(false);
            setRoutine(null);
            fetchRoutine();
        } catch (err) {
            console.error(err);
            alert('Error al crear la rutina.');
        } finally {
            setSavingNewRoutine(false);
        }
    };

    const displayRoutine = isEditing ? localRoutine : routine;
    const searchActive = activeSessionId !== null || newRoutineSearchSessionId !== null;

    // ──────────────────────────────────────────────────────────────────────────
    return (
    <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full h-dvh md:h-auto max-w-4xl md:max-h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col border-0 md:border border-border overflow-hidden">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col border-b border-border bg-muted/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 pb-2 gap-4 sm:gap-0">
                        <div className="flex items-center gap-4">
                            {member.user?.avatarUrl ? (
                                <img src={member.user.avatarUrl} alt={member.user?.name || 'Avatar'} className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm border border-border" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
                                    <span className="text-primary font-bold text-lg">{(member.user?.name || member.user?.email || '?').charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{member.user?.name || 'Sin Nombre'}</h2>
                                <p className="text-sm text-muted-foreground">{member.user?.email || 'Sin Email'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Info tab header actions */}
                            {activeTab === 'info' && userId && (
                                isEditingProfile ? (
                                    <>
                                        <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" disabled={savingProfile}>Cancelar</button>
                                        <button onClick={handleSaveProfile} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors" disabled={savingProfile}>
                                            {savingProfile ? 'Guardando...' : 'Guardar Perfil'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => { setIsEditingProfile(true); if (!profile) setProfileForm(emptyProfileForm()); }} className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded hover:bg-muted transition-colors">
                                        {profile ? 'Editar Perfil' : 'Completar Perfil'}
                                    </button>
                                )
                            )}

                            {/* Routine tab header actions */}
                            {activeTab === 'routine' && !isCreatingRoutine && routine && (
                                isEditing ? (
                                    <>
                                        <button onClick={handleEditToggle} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" disabled={saving}>Cancelar</button>
                                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors" disabled={saving}>
                                            {saving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={handleEditToggle} className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded hover:bg-muted transition-colors">
                                        Editar Rutina
                                    </button>
                                )
                            )}
                            {activeTab === 'routine' && isCreatingRoutine && (
                                <>
                                    <button onClick={() => setIsCreatingRoutine(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" disabled={savingNewRoutine}>Cancelar</button>
                                    <button onClick={handleCreateRoutine} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors" disabled={savingNewRoutine}>
                                        {savingNewRoutine ? 'Creando...' : 'Crear Rutina'}
                                    </button>
                                </>
                            )}

                            <button onClick={onClose} className="p-2 ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">✕</button>
                        </div>
                    </div>

                    <div className="flex gap-4 px-4">
                        <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            Información
                        </button>
                        <button onClick={() => setActiveTab('routine')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'routine' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            Rutina
                        </button>
                        <button onClick={() => setActiveTab('nutrition')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'nutrition' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            Alimentación
                        </button>
                    </div>
                </div>

                {/* ── Body ────────────────────────────────────────────────── */}
                <div className="p-6 overflow-y-auto flex-1 relative">

                    {/* ══ INFO TAB ══════════════════════════════════════════ */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Datos del Socio</h3>
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">ID Externo</span>
                                            <span className="text-sm font-medium">{member.external_member_id || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">DNI</span>
                                            <span className="text-sm font-medium">{member.user?.dni || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">Teléfono</span>
                                            <span className="text-sm font-medium">{member.user?.phone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Email</span>
                                            <span className="text-sm font-medium">{member.user?.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Membresía Gimnasio</h3>
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">Estado</span>
                                            {isExpired(member.ends_at) ? (
                                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Vencido</span>
                                            ) : (
                                                <span className={`text-sm font-bold ${member.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {member.status === 'active' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">Inicio</span>
                                            <span className="text-sm font-medium">{member.starts_at ? new Date(member.starts_at).toLocaleDateString() : '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">Vencimiento</span>
                                            <span className="text-sm font-medium">{member.ends_at ? new Date(member.ends_at).toLocaleDateString() : '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/50 pb-2">
                                            <span className="text-sm text-muted-foreground">Registrado en App</span>
                                            <span className="text-sm font-medium">{member.user_id ? 'Sí' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Tiene Rutina Activa</span>
                                            <span className={`text-sm font-bold ${member.has_routine ? 'text-blue-600' : 'text-slate-500'}`}>
                                                {member.has_routine ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Training Profile */}
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Perfil de Entrenamiento</h3>

                                {profileLoading ? (
                                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                                ) : isEditingProfile ? (
                                    /* ── Profile Edit Form ── */
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Fecha de Nacimiento</label>
                                                <input type="date" value={profileForm.fechaNacimiento} onChange={e => setProfileForm(p => ({ ...p, fechaNacimiento: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Sexo</label>
                                                <select value={profileForm.sexo} onChange={e => setProfileForm(p => ({ ...p, sexo: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Seleccionar</option>
                                                    <option value="male">Hombre</option>
                                                    <option value="female">Mujer</option>
                                                    <option value="other">Otro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Peso (kg)</label>
                                                <input type="number" step="0.1" value={profileForm.peso} onChange={e => setProfileForm(p => ({ ...p, peso: e.target.value }))} placeholder="70" className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Altura (cm)</label>
                                                <input type="number" value={profileForm.altura} onChange={e => setProfileForm(p => ({ ...p, altura: e.target.value }))} placeholder="170" className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Objetivo</label>
                                            <select value={profileForm.objetivo} onChange={e => setProfileForm(p => ({ ...p, objetivo: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                <option value="">Seleccionar</option>
                                                <option value="ganar_masa_muscular">Ganar masa muscular</option>
                                                <option value="perder_peso">Perder peso</option>
                                                <option value="mantener_peso">Mantener peso</option>
                                                <option value="mejorar_salud">Mejorar salud</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Enfoque</label>
                                                <select value={profileForm.enfoque} onChange={e => setProfileForm(p => ({ ...p, enfoque: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Seleccionar</option>
                                                    <option value="strength">Fuerza</option>
                                                    <option value="hybrid">Híbrido</option>
                                                    <option value="cardio">Cardio</option>
                                                    <option value="hypertrophy">Hipertrofia</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Intensidad</label>
                                                <select value={profileForm.intensidad} onChange={e => setProfileForm(p => ({ ...p, intensidad: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Seleccionar</option>
                                                    <option value="low">Baja</option>
                                                    <option value="medium">Media</option>
                                                    <option value="high">Alta</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Experiencia</label>
                                                <select value={profileForm.experiencia} onChange={e => setProfileForm(p => ({ ...p, experiencia: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Seleccionar</option>
                                                    <option value="principiante">Principiante</option>
                                                    <option value="intermedio">Intermedio</option>
                                                    <option value="avanzado">Avanzado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Actividad</label>
                                                <select value={profileForm.actividad} onChange={e => setProfileForm(p => ({ ...p, actividad: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Seleccionar</option>
                                                    <option value="sedentario">Sedentario</option>
                                                    <option value="ligero">Ligero</option>
                                                    <option value="moderado">Moderado</option>
                                                    <option value="activo">Activo</option>
                                                    <option value="muy_activo">Muy activo</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Días/semana disponibles</label>
                                                <input type="number" min={1} max={7} value={profileForm.dias} onChange={e => setProfileForm(p => ({ ...p, dias: e.target.value }))} placeholder="3" className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Tiempo/sesión (min)</label>
                                                <input type="number" min={15} step={15} value={profileForm.tiempo} onChange={e => setProfileForm(p => ({ ...p, tiempo: e.target.value }))} placeholder="60" className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-red-600 uppercase font-bold block mb-1">Lesiones / Observaciones</label>
                                            <textarea value={profileForm.lesion} onChange={e => setProfileForm(p => ({ ...p, lesion: e.target.value }))} placeholder="Ej: dolor lumbar, sin restricciones, etc." rows={2} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                        </div>
                                    </div>
                                ) : profile ? (
                                    /* ── Profile View ── */
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Edad</p>
                                                <p className="text-sm font-medium">{profile.fechaNacimiento ? calculateAge(profile.fechaNacimiento) : (profile.edad || '-')} años</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Sexo</p>
                                                <p className="text-sm font-medium">{normalizeValue(profile.sexo)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Peso</p>
                                                <p className="text-sm font-medium">{profile.peso ? `${profile.peso} kg` : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Altura</p>
                                                <p className="text-sm font-medium">{profile.altura ? `${profile.altura} cm` : '-'}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Objetivo</p>
                                            <p className="text-sm font-medium">{normalizeValue(profile.objetivo)}</p>
                                        </div>
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Enfoque Principal</p>
                                            <p className="text-sm font-medium">{normalizeValue(profile.enfoque)}</p>
                                        </div>
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Intensidad deseada</p>
                                            <p className="text-sm font-medium">{normalizeValue(profile.intensidad)}</p>
                                        </div>
                                        <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Experiencia</p>
                                                <p className="text-sm font-medium">{normalizeValue(profile.experiencia)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Actividad</p>
                                                <p className="text-sm font-medium">{normalizeValue(profile.actividad)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Días/semana</p>
                                                <p className="text-sm font-medium">{profile.dias ?? '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Tiempo/sesión</p>
                                                <p className="text-sm font-medium">{profile.tiempo ? `${profile.tiempo} min` : '-'}</p>
                                            </div>
                                        </div>
                                        {profile.lesion && (
                                            <div className="pt-2 border-t border-border/50 italic">
                                                <p className="text-[10px] text-red-600 uppercase font-bold">Lesiones / Observaciones</p>
                                                <p className="text-sm font-medium text-red-600/80">{profile.lesion}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* ── No Profile ── */
                                    <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border flex flex-col items-center justify-center gap-3" style={{ minHeight: 200 }}>
                                        <span className="text-3xl">📋</span>
                                        {userId ? (
                                            <>
                                                <p className="text-sm text-muted-foreground max-w-[220px]">El miembro aún no tiene un perfil de entrenamiento.</p>
                                                <button
                                                    onClick={() => setIsEditingProfile(true)}
                                                    className="mt-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    Completar perfil ahora
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground max-w-[220px]">
                                                Este miembro no se registró en la app aún. El perfil de entrenamiento se crea desde la app móvil.
                                            </p>
                                        )}
                                    </div>

                                )}

                                {userId && !isEditingProfile && (
                                    <button onClick={() => setActiveTab('routine')} className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 group">
                                        Ver Rutina Actual
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══ ROUTINE TAB ═══════════════════════════════════════ */}
                    {activeTab === 'routine' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {loadingRoutine ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 py-8">{error}</div>
                            ) : isCreatingRoutine ? (
                                /* ── New Routine Creator ──────────────────── */
                                <div className="flex flex-col gap-6">
                                    <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
                                        <h3 className="text-base font-bold text-primary mb-4">Nueva Rutina</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Nombre de la Rutina *</label>
                                                <input type="text" value={newRoutineForm.name} onChange={e => setNewRoutineForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Rutina de hipertrofia A/B" className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Objetivo</label>
                                                <select value={newRoutineForm.goal} onChange={e => setNewRoutineForm(p => ({ ...p, goal: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Sin objetivo</option>
                                                    <option value="ganar_masa_muscular">Ganar masa muscular</option>
                                                    <option value="perder_peso">Perder peso</option>
                                                    <option value="mantener_peso">Mantener peso</option>
                                                    <option value="mejorar_salud">Mejorar salud</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Intensidad</label>
                                                <select value={newRoutineForm.intensity} onChange={e => setNewRoutineForm(p => ({ ...p, intensity: e.target.value }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                                    <option value="">Sin especificar</option>
                                                    <option value="low">Baja</option>
                                                    <option value="medium">Media</option>
                                                    <option value="high">Alta</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Días por semana</label>
                                                <input type="number" min={1} max={7} value={newRoutineForm.days_per_week} onChange={e => setNewRoutineForm(p => ({ ...p, days_per_week: Number(e.target.value) }))} className="w-full p-2 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sessions */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-foreground">Sesiones ({newRoutineForm.sessions.length})</h4>
                                            <button onClick={addSession} className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors border border-primary/20">
                                                + Añadir Sesión
                                            </button>
                                        </div>

                                        {newRoutineForm.sessions.length === 0 && (
                                            <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                                                Aún no hay sesiones. Añadí al menos una para continuar.
                                            </div>
                                        )}

                                        {newRoutineForm.sessions.map((session, idx) => (
                                            <div key={session.id} className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
                                                <div className="bg-muted p-3 border-b border-border flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase w-5">{idx + 1}</span>
                                                    <input type="text" value={session.day_label} onChange={e => updateSessionField(session.id, 'day_label', e.target.value)} placeholder="Ej: Pecho y Tríceps" className="flex-1 min-w-[140px] p-1.5 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                                    <input type="text" value={session.focus} onChange={e => updateSessionField(session.id, 'focus', e.target.value)} placeholder="Enfoque (opcional)" className="flex-1 min-w-[120px] p-1.5 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                                    <button onClick={() => setNewRoutineSearchSessionId(session.id)} className="px-2.5 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors">
                                                        + Ejercicio
                                                    </button>
                                                    <button onClick={() => removeSession(session.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors text-xs">✕</button>
                                                </div>

                                                {session.exercises.length === 0 ? (
                                                    <div className="p-4 text-center text-xs text-muted-foreground italic">Sin ejercicios. Presioná "+ Ejercicio" para agregar.</div>
                                                ) : (
                                                    <div className="p-0 overflow-x-auto">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                                                                <tr>
                                                                    <th className="px-4 py-2 font-medium min-w-[180px]">Ejercicio</th>
                                                                    <th className="px-3 py-2 font-medium w-20">Series</th>
                                                                    <th className="px-3 py-2 font-medium w-20">Reps</th>
                                                                    <th className="px-3 py-2 font-medium w-24">Descanso</th>
                                                                    <th className="px-3 py-2 font-medium w-8"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border">
                                                                {session.exercises.map(ex => (
                                                                    <tr key={ex.id} className="hover:bg-muted/10">
                                                                        <td className="px-4 py-2 font-medium text-foreground text-sm">{ex.name}</td>
                                                                        <td className="px-3 py-2">
                                                                            <input type="number" value={ex.sets} onChange={e => updateNewExerciseField(session.id, ex.id, 'sets', e.target.value)} className="w-16 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input type="text" value={ex.reps} onChange={e => updateNewExerciseField(session.id, ex.id, 'reps', e.target.value)} className="w-16 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input type="text" value={ex.rest} onChange={e => updateNewExerciseField(session.id, ex.id, 'rest', e.target.value)} placeholder="60s" className="w-20 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            <button onClick={() => removeNewExercise(session.id, ex.id)} className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors">✕</button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : !displayRoutine ? (
                                /* ── No Routine ─────────────────────────── */
                                <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-border rounded-xl">
                                    <span className="text-5xl">🏋️</span>
                                    {userId ? (
                                        <>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-foreground mb-1">Sin rutina activa</p>
                                                <p className="text-sm text-muted-foreground max-w-xs">Este cliente no tiene una rutina asignada. Podés crearle una desde acá.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsCreatingRoutine(true)}
                                                className="mt-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                            >
                                                <span>✚</span> Crear Rutina
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-foreground mb-1">Sin rutina activa</p>
                                            <p className="text-sm text-muted-foreground max-w-xs">
                                                Este miembro no tiene una cuenta en la app todavía. Las rutinas solo pueden asignarse a miembros registrados.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── Existing Routine View / Edit ─────────── */
                                <div className="flex flex-col gap-6">
                                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary mb-1">{displayRoutine.name}</h3>
                                            {displayRoutine.goal && <p className="text-sm text-foreground/80 mb-2">Objetivo: {normalizeValue(displayRoutine.goal)}</p>}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-2 py-1 bg-background rounded-md text-xs border border-border shadow-sm">{displayRoutine.days_per_week} días/sem</span>
                                                {displayRoutine.intensity && <span className="px-2 py-1 bg-background rounded-md text-xs border border-border shadow-sm">Intensidad: {normalizeValue(displayRoutine.intensity)}</span>}
                                            </div>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsCreatingRoutine(true)} className="text-xs px-3 py-1.5 border border-border rounded text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap ml-4">
                                                Reemplazar rutina
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {displayRoutine.routine_sessions?.map((session: any, index: number) => (
                                            <div key={session.id} className="border border-border rounded-lg overflow-hidden bg-background shadow-sm">
                                                <div className="bg-muted p-3 border-b border-border flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-foreground">Día {index + 1}: {session.day_label}</h4>
                                                        {session.focus && <p className="text-xs text-muted-foreground">Enfoque: {session.focus}</p>}
                                                    </div>
                                                    {isEditing && (
                                                        <button onClick={() => setActiveSessionId(session.id)} className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors">
                                                            + Añadir Ejercicio
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-0 overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium min-w-[200px]">Ejercicio</th>
                                                                <th className="px-4 py-3 font-medium min-w-[100px]">Series</th>
                                                                <th className="px-4 py-3 font-medium min-w-[100px]">Reps</th>
                                                                <th className="px-4 py-3 font-medium min-w-[100px]">Descanso</th>
                                                                {isEditing && <th className="px-4 py-3 font-medium w-10"></th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {session.routine_exercises?.map((exercise: any) => (
                                                                <tr key={exercise.id} className="hover:bg-muted/10">
                                                                    <td className="px-4 py-3 font-medium text-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{exercise.name}</span>
                                                                            {exercise.exercise?.videoUrl && (
                                                                                <button onClick={() => setSelectedVideo(exercise.exercise.videoUrl)} className="text-blue-500 hover:text-blue-600 p-1 bg-blue-500/10 rounded-full transition-colors flex-shrink-0" title="Ver video">
                                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isEditing ? (
                                                                            <input type="number" value={exercise.sets} onChange={e => updateExerciseField(session.id, exercise.id, 'sets', e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary" />
                                                                        ) : (
                                                                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded font-medium text-xs">{exercise.sets} series</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isEditing ? (
                                                                            <input type="text" value={exercise.reps} onChange={e => updateExerciseField(session.id, exercise.id, 'reps', e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary" />
                                                                        ) : (
                                                                            <span className="inline-flex items-center justify-center bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium text-xs">{exercise.reps} reps</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isEditing ? (
                                                                            <input type="text" value={exercise.rest || ''} onChange={e => updateExerciseField(session.id, exercise.id, 'rest', e.target.value)} placeholder="Ej: 60s" className="w-full bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary" />
                                                                        ) : (
                                                                            <span className="text-muted-foreground text-xs">{exercise.rest || '-'}</span>
                                                                        )}
                                                                    </td>
                                                                    {isEditing && (
                                                                        <td className="px-4 py-3 text-center">
                                                                            <button onClick={() => removeExercise(session.id, exercise.id)} className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors" title="Eliminar">✕</button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                            {(!session.routine_exercises || session.routine_exercises.length === 0) && (
                                                                <tr>
                                                                    <td colSpan={isEditing ? 5 : 4} className="px-4 py-4 text-center text-muted-foreground italic text-xs">Sin ejercicios asignados</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Exercise Search Overlay ──────────────────────────── */}
                    {searchActive && (
                        <div className="absolute inset-0 bg-background/95 backdrop-blur z-20 p-6 flex flex-col animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Buscar Ejercicio</h3>
                                <button onClick={() => { setActiveSessionId(null); setNewRoutineSearchSessionId(null); setSearchQuery(''); setSearchMuscle(''); setSearchEquipment(''); setSearchResults([]); }} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                                    Cerrar
                                </button>
                            </div>
                            <input type="text" autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Ej: Press de banca, Sentadilla..." className="w-full p-3 rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary focus:outline-none text-foreground mb-3 shadow-sm" />
                            <div className="flex gap-2 mb-4">
                                <select 
                                    value={searchMuscle} 
                                    onChange={e => setSearchMuscle(e.target.value)}
                                    className="flex-1 p-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Cualquier Músculo</option>
                                    <option value="pecho">Pecho</option>
                                    <option value="espalda">Espalda</option>
                                    <option value="piernas">Piernas</option>
                                    <option value="hombros">Hombros</option>
                                    <option value="brazos">Brazos</option>
                                    <option value="abdomen">Abdomen</option>
                                    <option value="gluteos">Glúteos</option>
                                    <option value="cardio">Cardio</option>
                                </select>
                                <select 
                                    value={searchEquipment} 
                                    onChange={e => setSearchEquipment(e.target.value)}
                                    className="flex-1 p-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Cualquier Equipo</option>
                                    <option value="mancuernas">Mancuernas</option>
                                    <option value="barra">Barra</option>
                                    <option value="maquina">Máquina</option>
                                    <option value="polea">Polea</option>
                                    <option value="peso corporal">Peso Corporal</option>
                                    <option value="kettlebell">Kettlebell</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={onlyGymEquipment}
                                        onChange={(e) => setOnlyGymEquipment(e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ml-2 text-xs font-medium text-muted-foreground flex items-center gap-1">Solo mi equipamiento y peso libre</span>
                                </label>
                            </div>
                            <div className="flex-1 overflow-y-auto border border-border rounded-lg bg-card">
                                {isSearching ? (
                                    <div className="p-8 text-center text-muted-foreground flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div> Buscando...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="divide-y divide-border">
                                        {searchResults.map(ex => (
                                            <li key={ex.id} className="p-3 hover:bg-muted/50 flex justify-between items-center transition-colors">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{ex.nameEs}</p>
                                                    <p className="text-xs text-muted-foreground">{ex.primaryMuscleEs} • {ex.equipmentType}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {ex.videoUrl && (
                                                        <button onClick={() => setSelectedVideo(ex.videoUrl!)} className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded hover:bg-blue-200 transition-colors" title="Ver video">
                                                            <svg className="w-3 h-3 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            Video
                                                        </button>
                                                    )}
                                                    <button onClick={() => addExerciseFromSearch(ex)} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20 transition-colors">
                                                        Agregar
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        {searchQuery.length > 0 ? 'No se encontraron ejercicios.' : 'Escribe para buscar...'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══ NUTRITION TAB ═══════════════════════════════════════ */}
                    {activeTab === 'nutrition' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {loadingNutrition ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : nutritionPlans.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/30 border-2 border-dashed border-border rounded-xl text-center">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <p className="text-lg font-bold text-foreground mb-1">Sin plan de alimentación</p>
                                    <p className="text-sm text-muted-foreground max-w-md">El socio no tiene ningún plan de alimentación activo en este momento.</p>
                                    <a href="/nutrition" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2">
                                        Ir a Planes de Alimentación
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {nutritionPlans.map(plan => (
                                        <div key={plan.id} className="border border-border rounded-xl p-5 bg-card hover:border-emerald-500/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                        {plan.title}
                                                        {plan.status === 'active' && <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">Activo</span>}
                                                        {plan.status === 'draft' && <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full">Borrador</span>}
                                                    </h3>
                                                    {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                                                </div>
                                                <a href={`/nutrition/${plan.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline font-medium flex items-center gap-1">
                                                    Ver / Editar <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                    <p className="text-xs text-muted-foreground mb-1">Días</p>
                                                    <p className="text-sm font-bold">{plan.days?.length || 0}</p>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                    <p className="text-xs text-muted-foreground mb-1">Comidas totales</p>
                                                    <p className="text-sm font-bold">{plan.days?.reduce((acc: number, d: any) => acc + (d.meals?.length || 0), 0) || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
        
        {/* ── Video Modal ──────────────────────────── */}
        {selectedVideo && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Video del Ejercicio
                        </h3>
                        <button onClick={() => setSelectedVideo(null)} className="p-2 bg-muted hover:bg-border text-foreground rounded-full transition-colors">
                            ✕
                        </button>
                    </div>
                    <div className="p-4 aspect-video">
                        {getYouTubeEmbedUrl(selectedVideo) ? (
                            <iframe className="w-full h-full rounded-lg" src={getYouTubeEmbedUrl(selectedVideo)!} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted rounded-lg p-6 text-center">
                                <p className="mb-4">No se puede reproducir este video directamente aquí.</p>
                                <a href={selectedVideo} target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors">Abrir en otra pestaña</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
    );
}
