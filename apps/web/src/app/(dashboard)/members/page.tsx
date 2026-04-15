"use client"
import { getAppMembers, uploadMembersCsv } from "@/lib/api/members"
import { useEffect, useState, useRef } from "react"
import { membership, user } from "@/types/entities"
import MemberRoutineModal from "@/components/MemberRoutineModal"

export default function Members() {
    const [members, setMembers] = useState<(membership & { user: user })[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)
    const [selectedMemberForRoutine, setSelectedMemberForRoutine] = useState<{userId: number, name: string} | null>(null)

    const fetchMembers = () => {
        getAppMembers()
            .then(data => {
                if (Array.isArray(data)) {
                    setMembers(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            await uploadMembersCsv(file)
            alert('Miembros actualizados correctamente')
            fetchMembers()
        } catch (error) {
            console.error(error)
            alert('Error al subir el archivo')
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const isExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    }

    const totals = {
        total: members.length,
        active: members.filter(m => m.status === 'active' && !isExpired(m.ends_at)).length,
        expired: members.filter(m => isExpired(m.ends_at)).length,
        inactive: members.filter(m => m.status !== 'active' && !isExpired(m.ends_at)).length
    }
    
    return (
        <>
        {loading ? (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        ) : (
        <div className="p-6">
            <div className="flex flex-row gap-4 justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-foreground">Miembros</h1>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    Subir CSV
                </button>
            </div>
            
            <div className="bg-muted p-4 mb-4 rounded border border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Total</p>
                    <p className="text-2xl font-bold text-foreground">{totals.total}</p>
                </div>
                <div>
                    <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold">Activos</p>
                    <p className="text-2xl font-bold text-foreground">{totals.active}</p>
                </div>
                <div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-bold">Vencidos</p>
                    <p className="text-2xl font-bold text-foreground">{totals.expired}</p>
                </div>
                <div>
                    <p className="text-xs text-red-600 dark:text-red-400 uppercase font-bold">Inactivos</p>
                    <p className="text-2xl font-bold text-foreground">{totals.inactive}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <button onClick={() => setSelectedMemberForRoutine({ userId: member.user_id, name: member.user?.name || 'Sin Nombre' })} key={member.id} className="flex flex-row items-center gap-4 p-4 border border-border rounded-lg shadow-sm bg-card cursor-pointer hover:scale-105 transition-all text-left group">
                        {/* Avatar */}
                        {member.user?.avatarUrl ? (
                            <img 
                                src={member.user.avatarUrl} 
                                alt={member.user?.name || 'Avatar'} 
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-lg">
                                    {(member.user?.name || member.user?.email || '?').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-1 justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <h1 className="font-bold text-lg text-foreground">{member.user?.name || 'Sin Nombre'}</h1>
                                <p className="text-sm text-muted-foreground">{member.user?.email || 'Sin Email'}</p>
                                {member.user?.dni && <p className="text-xs text-muted-foreground">DNI: {member.user.dni}</p>}
                                {member.user?.phone && <p className="text-xs text-muted-foreground">Tel: {member.user.phone}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {isExpired(member.ends_at) ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                        Vencido
                                    </span>
                                ) : (
                                    <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                        {member.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">Desde: {member.starts_at ? new Date(member.starts_at).toLocaleDateString() : '-'}</p>
                                <p className={`text-xs mt-0.5 ${isExpired(member.ends_at) ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                                    Hasta: {member.ends_at ? new Date(member.ends_at).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
        )}
        
        {selectedMemberForRoutine && (
            <MemberRoutineModal 
                userId={selectedMemberForRoutine.userId}
                userName={selectedMemberForRoutine.name}
                onClose={() => setSelectedMemberForRoutine(null)}
            />
        )}
        </>
    )
}