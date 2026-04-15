import { useEffect, useState } from "react";
import { getMemberRoutine } from "@/lib/api/members";

type MemberRoutineModalProps = {
    userId: number;
    userName: string;
    onClose: () => void;
};

export default function MemberRoutineModal({ userId, userName, onClose }: MemberRoutineModalProps) {
    const [routine, setRoutine] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getMemberRoutine(userId)
            .then(data => {
                setRoutine(data);
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError("No se pudo cargar la rutina.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col border border-border overflow-hidden">
                <div className="flex flex-row items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Rutina Activa</h2>
                        <p className="text-sm text-muted-foreground">Cliente: {userName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-8">{error}</div>
                    ) : !routine ? (
                        <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                            <p>El cliente no tiene una rutina activa.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                <h3 className="text-lg font-bold text-primary mb-1">{routine.name}</h3>
                                {routine.goal && <p className="text-sm text-foreground/80 mb-2">Objetivo: {routine.goal}</p>}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2 py-1 bg-background rounded-md text-xs border border-border shadow-sm">
                                        {routine.days_per_week} días/sem
                                    </span>
                                    {routine.intensity && (
                                        <span className="px-2 py-1 bg-background rounded-md text-xs border border-border shadow-sm">
                                            Intensidad: {routine.intensity}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {routine.routine_sessions?.map((session: any, index: number) => (
                                    <div key={session.id} className="border border-border rounded-lg overflow-hidden bg-background">
                                        <div className="bg-muted p-3 border-b border-border">
                                            <h4 className="font-bold text-foreground">
                                                Día {index + 1}: {session.day_label}
                                            </h4>
                                            {session.focus && <p className="text-xs text-muted-foreground">Enfoque: {session.focus}</p>}
                                        </div>
                                        <div className="p-0">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Ejercicio</th>
                                                        <th className="px-4 py-3 font-medium">Series x Reps</th>
                                                        <th className="px-4 py-3 font-medium">Descanso</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {session.routine_exercises?.map((exercise: any) => (
                                                        <tr key={exercise.id} className="hover:bg-muted/20">
                                                            <td className="px-4 py-3 font-medium text-foreground">{exercise.name}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded font-medium text-xs">
                                                                    {exercise.sets} x {exercise.reps}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-muted-foreground text-xs">{exercise.rest || '-'}</td>
                                                        </tr>
                                                    ))}
                                                    {(!session.routine_exercises || session.routine_exercises.length === 0) && (
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground italic text-xs">
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
            </div>
        </div>
    );
}

