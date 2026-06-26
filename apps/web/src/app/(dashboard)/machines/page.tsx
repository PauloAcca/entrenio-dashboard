"use client"
import { getGymMachines, deleteMachine } from "@/lib/api/machines"
import { useEffect, useState } from "react"
import { equipment, machineTemplate } from "@/types/entities"
import ModalAddMachine from "@/components/layout/modalAddMachine"
import ModalEditMachine from "@/components/layout/modalEditMachine"
import { useAuthStore } from "@/store/authStore"

export default function Machines() {
    const [machines, setMachines] = useState<equipment[]>([])
    const [machineTemplate, setMachineTemplate] = useState<machineTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [showModalAddMachine, setShowModalAddMachine] = useState(false)
    const [selectedMachine, setSelectedMachine] = useState<equipment | null>(null)
    const gym = useAuthStore((state) => state.gym)

    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)

    const handleBulkDelete = async () => {
        if (!gym?.id || selectedIds.size === 0) return;
        
        if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} máquina(s)? Esta acción no se puede deshacer.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const ids = Array.from(selectedIds);
            for (const id of ids) {
                await deleteMachine(id, gym.id);
            }
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            fetchMachines();
        } catch (error) {
            console.error("Error bulk deleting machines:", error);
            alert("Ocurrió un error al eliminar algunas máquinas. Por favor, intenta de nuevo.");
        } finally {
            setIsDeleting(false);
        }
    }

    const fetchMachines = () => {
        setLoading(true)
        getGymMachines()
            .then(data => {
                if (Array.isArray(data)) {
                    setMachines(data)
                    setMachineTemplate(data[0]?.machine_template || null)
                } else if ((data as any).machines) {
                    setMachines((data as any).machines)
                    setMachineTemplate((data as any).machines[0]?.machine_template || null)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchMachines()
    }, [])

    const [searchTerm, setSearchTerm] = useState('')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
    const [filterCategory, setFilterCategory] = useState('')
    const [filterBodyRegion, setFilterBodyRegion] = useState('')

    const activeMachines = machines.filter(machine => machine.isActive)

    const categories = [...new Set(machines.map(m => m.machine_template?.category).filter(Boolean))] as string[]
    const bodyRegions = [...new Set(machines.map(m => m.machine_template?.bodyRegion).filter(Boolean))] as string[]

    const displayedMachines = machines
        .filter(m => {
            const term = searchTerm.toLowerCase()
            const matchesSearch = (
                m.machine_template?.name?.toLowerCase().includes(term) ||
                m.machine_template?.description?.toLowerCase().includes(term) ||
                m.location?.toLowerCase().includes(term)
            )
            const matchesCategory = !filterCategory || m.machine_template?.category === filterCategory
            const matchesBodyRegion = !filterBodyRegion || m.machine_template?.bodyRegion === filterBodyRegion
            return matchesSearch && matchesCategory && matchesBodyRegion
        })
        .sort((a, b) => {
            if (!sortOrder) return 0
            const nameA = (a.machine_template?.name || '').toLowerCase()
            const nameB = (b.machine_template?.name || '').toLowerCase()
            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
        })
    
    return (
        <>
        {loading ? (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        ) : (
            <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-foreground">Equipamiento</h1>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode)
                            setSelectedIds(new Set())
                        }} 
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer border ${isSelectionMode ? 'bg-muted border-border text-foreground hover:bg-muted/80' : 'bg-background border-border text-foreground hover:bg-muted'}`}
                    >
                        {isSelectionMode ? 'Cancelar Selección' : 'Selección Múltiple'}
                    </button>
                    <button onClick={() => setShowModalAddMachine(!showModalAddMachine)} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                        Agregar Máquina
                    </button>
                </div>
            </div>
            
            <div className="bg-muted p-4 mb-4 rounded border border-border">
                <p className="text-foreground"><strong>Información:</strong></p>
                <p className="text-muted-foreground">Cantidad de maquinas: {machines.length}</p>
                <p className="text-muted-foreground">Cantidad de maquinas activas: {activeMachines.length}</p>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input 
                    type="text" 
                    placeholder="Buscar máquina..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <select
                    value={filterBodyRegion}
                    onChange={(e) => setFilterBodyRegion(e.target.value)}
                    className="p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                    <option value="">Todas las zonas</option>
                    {bodyRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                    className={`px-4 py-2 rounded text-sm font-medium border transition-colors cursor-pointer flex items-center gap-2 ${
                        sortOrder 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background text-foreground border-input hover:bg-muted'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    {sortOrder === 'asc' ? 'A → Z' : sortOrder === 'desc' ? 'Z → A' : 'Ordenar'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                {displayedMachines.map((machine) => {
                    const isSelected = selectedIds.has(machine.id.toString());
                    return (
                    <button 
                        key={machine.id}
                        onClick={() => {
                            if (isSelectionMode) {
                                const newSet = new Set(selectedIds)
                                if (isSelected) {
                                    newSet.delete(machine.id.toString())
                                } else {
                                    newSet.add(machine.id.toString())
                                }
                                setSelectedIds(newSet)
                            } else {
                                setSelectedMachine(machine)
                            }
                        }} 
                        className={`flex flex-row items-center justify-center p-4 border rounded-lg shadow-sm cursor-pointer transition-all text-left relative ${isSelectionMode ? (isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-1 ring-offset-background scale-[1.01]' : 'border-border bg-card hover:border-primary/50') : 'border-border bg-card hover:scale-[1.02]'}`}
                    >
                        {isSelectionMode && (
                            <div className="absolute top-3 left-3 z-10">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/50 bg-background'}`}>
                                    {isSelected && <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-between mb-2 flex-1 pl-6">
                            <h2 className="font-semibold text-foreground text-center">{machine.machine_template?.name || 'Máquina desconocida'}</h2>
                            <p className="text-sm text-muted-foreground text-center mt-1">{machine.location}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${machine.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                {machine.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div className="flex w-[40%] ml-4 flex-col items-center justify-center shrink-0">
                            <img src={machine.machine_template?.imageUrl} alt={machine.machine_template?.name} className="mt-2 w-full max-w-[120px] object-contain drop-shadow-sm mix-blend-multiply dark:mix-blend-normal" />
                        </div>
                    </button>
                    );
                })}
            </div>
            
            {/* Floating Action Bar for Selection Mode */}
            {isSelectionMode && selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border shadow-xl rounded-2xl px-6 py-4 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <span className="font-medium text-foreground whitespace-nowrap">
                        {selectedIds.size} seleccionada{selectedIds.size > 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={handleBulkDelete}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                        Eliminar
                    </button>
                </div>
            )}
            {showModalAddMachine && (
                <ModalAddMachine 
                    gymId={gym?.id || ''} 
                    setShowModalAddMachine={setShowModalAddMachine} 
                    onMachinesAdded={fetchMachines} 
                    existingMachineTemplateIds={new Set(machines.map(m => m.machineTemplateId))}
                />
            )}
            {selectedMachine && (
                <ModalEditMachine 
                    machine={selectedMachine} 
                    gymId={gym?.id || ''} 
                    onClose={() => setSelectedMachine(null)} 
                    onUpdate={fetchMachines}
                />
            )}
        </div>
        )}
        </>
    )
}