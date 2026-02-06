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

    const activeMachines = machines.filter(machine => machine.isActive)
    
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map((machine) => (
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
            {showModalAddMachine && <ModalAddMachine gymId={gym?.id || ''} setShowModalAddMachine={setShowModalAddMachine} />}
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