"use client"
import { getAppMembers, uploadMembersCsv } from "@/lib/api/members"
import { useEffect, useState, useRef } from "react"
import { membership, user } from "@/types/entities"
import MemberRoutineModal from "@/components/MemberRoutineModal"

export default function Members() {
    const [members, setMembers] = useState<(membership & { user: user })[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState<(membership & { user: user }) | null>(null)

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

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'expired' | 'inactive'>('')

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

    const filteredMembers = members.filter(m => {
        const term = searchTerm.toLowerCase()
        const matchesSearch = (m.user?.name?.toLowerCase() || '').includes(term) || (m.user?.email?.toLowerCase() || '').includes(term)
        
        let matchesStatus = true
        if (statusFilter === 'active') {
            matchesStatus = m.status === 'active' && !isExpired(m.ends_at)
        } else if (statusFilter === 'expired') {
            matchesStatus = isExpired(m.ends_at)
        } else if (statusFilter === 'inactive') {
            matchesStatus = m.status !== 'active' && !isExpired(m.ends_at)
        }

        return matchesSearch && matchesStatus
    })
    
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
                    <p className="text-[10px] text-muted-foreground mt-1">Todos los clientes registrados</p>
                </div>
                <div>
                    <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold">Activos</p>
                    <p className="text-2xl font-bold text-foreground">{totals.active}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Membresía vigente y al día</p>
                </div>
                <div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-bold">Vencidos</p>
                    <p className="text-2xl font-bold text-foreground">{totals.expired}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">La fecha de fin ya pasó</p>
                </div>
                <div>
                    <p className="text-xs text-red-600 dark:text-red-400 uppercase font-bold">Inactivos</p>
                    <p className="text-2xl font-bold text-foreground">{totals.inactive}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Suspendidos o cancelados manualmente</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="expired">Vencidos</option>
                    <option value="inactive">Inactivos</option>
                </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {filteredMembers.map((member) => (
                    <button onClick={() => setSelectedMember(member)} key={member.id} className="flex flex-col gap-3 p-3 md:p-4 border border-border rounded-lg shadow-sm bg-card cursor-pointer hover:scale-[1.02] transition-all text-left group">
                        <div className="flex flex-col xl:flex-row w-full justify-between items-start gap-3 min-w-0">
                            <div className="flex flex-col gap-1 min-w-0 w-full">
                                <h1 className="font-bold text-sm md:text-lg text-foreground truncate leading-tight">{member.user?.name || 'Sin Nombre'}</h1>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{member.user?.email || 'Sin Email'}</p>
                                {!member.user_id && <span className="text-[9px] md:text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded w-fit font-bold uppercase tracking-wider mt-0.5 border border-amber-200 dark:border-amber-800/50">Sin App</span>}
                                {member.user?.dni && <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">DNI: {member.user.dni}</p>}
                                {member.user?.phone && <p className="text-[10px] md:text-xs text-muted-foreground">Tel: {member.user.phone}</p>}
                            </div>
                            <div className="flex flex-col items-start xl:items-end gap-1 flex-shrink-0 w-full xl:w-auto pt-2 xl:pt-0 border-t border-border/50 xl:border-0">
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                    {isExpired(member.ends_at) ? (
                                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[9px] md:text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                            Vencido
                                        </span>
                                    ) : (
                                        <span className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[9px] md:text-xs rounded-full ${member.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                            {member.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[9px] md:text-xs rounded-full ${member.has_routine ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50' : 'bg-slate-100 dark:bg-slate-800/30 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800/50'}`}>
                                        {member.has_routine ? 'Rutina' : 'S/Rutina'}
                                    </span>
                                </div>
                                <p className="hidden md:block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-1 md:mt-2">Membresía</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-0">Desde: {member.starts_at ? new Date(member.starts_at).toLocaleDateString() : '-'}</p>
                                <p className={`text-[10px] md:text-xs mt-0.5 ${isExpired(member.ends_at) ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                                    Hasta: {member.ends_at ? new Date(member.ends_at).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
        )}
        
        {selectedMember && (
            <MemberRoutineModal 
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        )}
        </>
    )
}