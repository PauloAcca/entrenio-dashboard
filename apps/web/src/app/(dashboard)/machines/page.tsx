"use client"
import { getGymMachines } from "@/lib/api/machines"
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4 text-foreground">Equipamiento</h1>
                <button onClick={() => setShowModalAddMachine(!showModalAddMachine)} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">Agregar Maquina</button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMachines.map((machine) => (
                    <button onClick={() => setSelectedMachine(machine)} key={machine.id} className="flex flex-row items-center justify-center p-4 border border-border rounded-lg shadow-sm bg-card cursor-pointer hover:scale-105 transition-all text-left">
                        <div className="flex flex-col items-center justify-between mb-2">
                            <h2 className="font-semibold text-foreground">{machine.machine_template?.name || 'Máquina desconocida'}</h2>
                            <p className="text-sm text-muted-foreground">{machine.location}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${machine.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                {machine.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div className="flex w-1/2 ml-4 flex-col items-center justify-center">
                            <img src={machine.machine_template?.imageUrl} alt={machine.machine_template?.name} className="mt-2" />
                        </div>
                    </button>
                ))}
            </div>
            {showModalAddMachine && <ModalAddMachine gymId={gym?.id || ''} setShowModalAddMachine={setShowModalAddMachine} onMachinesAdded={fetchMachines} />}
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