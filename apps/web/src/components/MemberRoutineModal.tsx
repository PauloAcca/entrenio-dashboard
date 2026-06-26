import { useEffect, useState } from "react";
import { getMemberRoutine, updateMemberRoutineExercises, getMemberProfile } from "@/lib/api/members";
import { searchExercises, ExerciseData } from "@/lib/api/exercises";
import { membership, user } from "@/types/entities";

type MemberModalProps = {
    member: membership & { user: user };
    onClose: () => void;
};

export default function MemberRoutineModal({ member, onClose }: MemberModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'routine'>('info');
    
    // Member Info / Profile state
    const [profile, setProfile] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Routine state
    const [routine, setRoutine] = useState<any>(null);
    const [loadingRoutine, setLoadingRoutine] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [localRoutine, setLocalRoutine] = useState<any>(null);
    const [removes, setRemoves] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    // Exercise Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ExerciseData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

    const userId = member.user_id;

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    useEffect(() => {
        if (activeTab === 'routine' && !routine && userId) {
            fetchRoutine();
        }
    }, [activeTab, userId]);

    const fetchProfile = async () => {
        if (!userId) return;
        setProfileLoading(true);
        try {
            const data = await getMemberProfile(userId);
            setProfile(data);
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setProfileLoading(false);
        }
    }

    const fetchRoutine = () => {
        if (!userId) return;
        setLoadingRoutine(true);
        getMemberRoutine(userId)
            .then(data => {
                setRoutine(data);
                setLocalRoutine(JSON.parse(JSON.stringify(data))); // deep copy
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError("No se pudo cargar la rutina.");
            })
            .finally(() => {
                setLoadingRoutine(false);
            });
    }

    // Effect for searching
    useEffect(() => {
        if (activeSessionId === null) return;
        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            searchExercises(searchQuery).then(data => {
                setSearchResults(data);
            }).finally(() => {
                setIsSearching(false);
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeSessionId]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit
            if (confirm("¿Estás seguro de cancelar? Se perderán los cambios no guardados.")) {
                setLocalRoutine(JSON.parse(JSON.stringify(routine)));
                setRemoves([]);
                setIsEditing(false);
            }
        } else {
            setIsEditing(true);
        }
    }

    const handleSave = async () => {
        if (!localRoutine || !userId) return;
        setSaving(true);
        
        // Compute changes: updates, adds
        const updates: any[] = [];
        const adds: any[] = [];
        
        localRoutine.routine_sessions?.forEach((session: any) => {
            session.routine_exercises?.forEach((ex: any, idx: number) => {
                const isNew = String(ex.id).startsWith("temp-");
                const exData = {
                    reps: ex.reps,
                    sets: Number(ex.sets),
                    rest: ex.rest,
                    name: ex.name,
                    order: idx,
                    exerciseId: ex.exerciseId
                };

                if (isNew) {
                    adds.push({
                        sessionId: session.id,
                        ...exData
                    });
                } else {
                    updates.push({
                        id: ex.id,
                        ...exData
                    });
                }
            })
        });

        try {
            await updateMemberRoutineExercises(userId, { updates, adds, removes });
            setIsEditing(false);
            alert("Rutina actualizada correctamente.");
            fetchRoutine(); // reload from server
        } catch(err) {
            console.error(err);
            alert("Error al guardar la rutina.");
        } finally {
            setSaving(false);
        }
    }

    const updateExerciseField = (sessionId: number, exerciseId: any, field: string, value: string) => {
        setLocalRoutine((prev: any) => {
            const next = { ...prev };
            const session = next.routine_sessions.find((s: any) => s.id === sessionId);
            if (session) {
                const ex = session.routine_exercises.find((e: any) => e.id === exerciseId);
                if (ex) {
                    ex[field] = value;
                }
            }
            return next;
        });
    }

    const removeExercise = (sessionId: number, exerciseId: any) => {
        if (!String(exerciseId).startsWith("temp-")) {
            setRemoves(prev => [...prev, exerciseId]);
        }
        setLocalRoutine((prev: any) => {
            const next = { ...prev };
            const session = next.routine_sessions.find((s: any) => s.id === sessionId);
            if (session) {
                session.routine_exercises = session.routine_exercises.filter((e: any) => e.id !== exerciseId);
            }
            return next;
        });
    }

    const addExerciseFromSearch = (exercise: ExerciseData) => {
        if (activeSessionId === null) return;
        
        setLocalRoutine((prev: any) => {
            const next = { ...prev };
            const session = next.routine_sessions.find((s: any) => s.id === activeSessionId);
            if (session) {
                if (!session.routine_exercises) session.routine_exercises = [];
                session.routine_exercises.push({
                    id: 'temp-' + Date.now(),
                    name: exercise.nameEs,
                    exerciseId: exercise.id,
                    sets: 3,
                    reps: "10",
                    rest: "60s"
                });
            }
            return next;
        });
        
        // Close search
        setActiveSessionId(null);
        setSearchQuery("");
    }

    const displayRoutine = isEditing ? localRoutine : routine;

    const isExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    }

    const calculateAge = (birthDate: string | null) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    const normalizeValue = (value: string | null) => {
        if (!value) return '-';
        
        const mapping: Record<string, string> = {
            // Objetivo
            'ganar_masa_muscular': 'Ganar masa muscular',
            'perder_peso': 'Perder peso',
            'mantener_peso': 'Mantener peso',
            'mejorar_salud': 'Mejorar salud',
            
            // Enfoque
            'strength': 'Fuerza',
            'hybrid': 'Híbrido',
            'cardio': 'Cardio',
            'hypertrophy': 'Hipertrofia',
            'fuerza': 'Fuerza',
            'hipertrofia': 'Hipertrofia',
            
            // Intensidad
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta',
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta',

            // Sexo
            'male': 'Hombre',
            'female': 'Mujer',
            'other': 'Otro',
        };

        const key = value.toLowerCase().trim();
        if (mapping[key]) return mapping[key];

        const normalized = value.replace(/_/g, ' ');
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full h-dvh md:h-auto max-w-4xl md:max-h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col border-0 md:border border-border overflow-hidden">
                {/* Header with Tabs */}
                <div className="flex flex-col border-b border-border bg-muted/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 pb-2 gap-4 sm:gap-0">
                        <div className="flex items-center gap-4">
                            {member.user?.avatarUrl ? (
                                <img 
                                    src={member.user.avatarUrl} 
                                    alt={member.user?.name || 'Avatar'} 
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm border border-border"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
                                    <span className="text-primary font-bold text-lg">
                                        {(member.user?.name || member.user?.email || '?').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{member.user?.name || 'Sin Nombre'}</h2>
                                <p className="text-sm text-muted-foreground">{member.user?.email || 'Sin Email'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeTab === 'routine' && routine && (
                                <>
                                    {isEditing ? (
                                        <>
                                        <button 
                                            onClick={handleEditToggle}
                                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            disabled={saving}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                                            disabled={saving}
                                        >
                                            {saving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={handleEditToggle}
                                            className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded hover:bg-muted transition-colors"
                                        >
                                            Editar Rutina
                                        </button>
                                    )}
                                </>
                            )}
                            <button 
                                onClick={onClose}
                                className="p-2 ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 px-4">
                        <button 
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Información
                        </button>
                        <button 
                            onClick={() => setActiveTab('routine')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'routine' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Rutina
                        </button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 relative">
                    {activeTab === 'info' ? (
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
                                ) : profile ? (
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
                                        {profile.lesion && (
                                            <div className="pt-2 border-t border-border/50 italic">
                                                <p className="text-[10px] text-red-600 uppercase font-bold">Lesiones / Observaciones</p>
                                                <p className="text-sm font-medium text-red-600/80">{profile.lesion}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border h-[300px] flex flex-col items-center justify-center">
                                        <p className="text-sm text-muted-foreground italic max-w-[200px]">El miembro aún no ha completado su perfil en la app móvil.</p>
                                    </div>
                                )}
                                
                                {member.user_id && (
                                    <button 
                                        onClick={() => setActiveTab('routine')}
                                        className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 group"
                                    >
                                        Ver Rutina Actual
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {loadingRoutine ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 py-8">{error}</div>
                            ) : !displayRoutine ? (
                                <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg h-64 flex flex-col items-center justify-center">
                                    <p className="mb-4 text-lg">El cliente no tiene una rutina activa.</p>
                                    {/* Maybe add button to generate or create one? For now keep original logic */}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                        <h3 className="text-lg font-bold text-primary mb-1">{displayRoutine.name}</h3>
                                        {displayRoutine.goal && <p className="text-sm text-foreground/80 mb-2">Objetivo: {normalizeValue(displayRoutine.goal)}</p>}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-2 py-1 bg-background rounded-md text-xs border border-border shadow-sm">
                                                {displayRoutine.days_per_week} días/sem
                                            </span>
                                            {displayRoutine.intensity && (
                                                <span className="px-2 py-1 bg-background rounded-md text-xs border border-border shadow-sm">
                                                    Intensidad: {normalizeValue(displayRoutine.intensity)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {displayRoutine.routine_sessions?.map((session: any, index: number) => (
                                            <div key={session.id} className="border border-border rounded-lg overflow-hidden bg-background shadow-sm">
                                                <div className="bg-muted p-3 border-b border-border flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-foreground">
                                                            Día {index + 1}: {session.day_label}
                                                        </h4>
                                                        {session.focus && <p className="text-xs text-muted-foreground">Enfoque: {session.focus}</p>}
                                                    </div>
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => setActiveSessionId(session.id)}
                                                            className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors"
                                                        >
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
                                                                        {exercise.name}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isEditing ? (
                                                                            <input 
                                                                                type="number" 
                                                                                value={exercise.sets} 
                                                                                onChange={(e) => updateExerciseField(session.id, exercise.id, 'sets', e.target.value)}
                                                                                className="w-full bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        ) : (
                                                                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded font-medium text-xs">
                                                                                {exercise.sets} series
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isEditing ? (
                                                                            <input 
                                                                                type="text" 
                                                                                value={exercise.reps} 
                                                                                onChange={(e) => updateExerciseField(session.id, exercise.id, 'reps', e.target.value)}
                                                                                className="w-full bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        ) : (
                                                                            <span className="inline-flex items-center justify-center bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium text-xs">
                                                                                {exercise.reps} reps
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isEditing ? (
                                                                            <input 
                                                                                type="text" 
                                                                                value={exercise.rest || ''} 
                                                                                onChange={(e) => updateExerciseField(session.id, exercise.id, 'rest', e.target.value)}
                                                                                className="w-full bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                                                placeholder="Ej: 60s"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-muted-foreground text-xs">{exercise.rest || '-'}</span>
                                                                        )}
                                                                    </td>
                                                                    {isEditing && (
                                                                        <td className="px-4 py-3 text-center">
                                                                            <button 
                                                                                onClick={() => removeExercise(session.id, exercise.id)}
                                                                                className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                                                                                title="Eliminar"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                            {(!session.routine_exercises || session.routine_exercises.length === 0) && (
                                                                <tr>
                                                                    <td colSpan={isEditing ? 5 : 4} className="px-4 py-4 text-center text-muted-foreground italic text-xs">
                                                                        Sin ejercicios asignados
                                                                    </td>
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

                    {/* Search Overlay/Modal */}
                    {activeSessionId !== null && (
                        <div className="absolute inset-0 bg-background/95 backdrop-blur z-20 p-6 flex flex-col animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Buscar Ejercicio</h3>
                                <button 
                                    onClick={() => setActiveSessionId(null)}
                                    className="p-2 text-muted-foreground hover:bg-muted rounded-full"
                                >
                                    Cerrar
                                </button>
                            </div>
                            <input 
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ej: Press de banca, Sentadilla..."
                                className="w-full p-3 rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary focus:outline-none text-foreground mb-4 shadow-sm"
                            />
                            
                            <div className="flex-1 overflow-y-auto border border-border rounded-lg bg-card">
                                {isSearching ? (
                                    <div className="p-8 text-center text-muted-foreground flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div> Buscando...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="divide-y divide-border">
                                        {searchResults.map((ex) => (
                                            <li key={ex.id} className="p-3 hover:bg-muted/50 flex justify-between items-center transition-colors">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{ex.nameEs}</p>
                                                    <p className="text-xs text-muted-foreground">{ex.primaryMuscleEs} • {ex.equipmentType}</p>
                                                </div>
                                                <button 
                                                    onClick={() => addExerciseFromSearch(ex)}
                                                    className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20 transition-colors"
                                                >
                                                    Agregar
                                                </button>
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
                </div>
            </div>
        </div>
    );
}
