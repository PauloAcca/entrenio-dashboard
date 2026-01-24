"use client"
import { getGymMachines } from "@/lib/api/machines"
import { useEffect, useState } from "react"
import { equipment, machineTemplate } from "@/types/entities"

export default function Machines() {
    const [machines, setMachines] = useState<equipment[]>([])
    const [machineTemplate, setMachineTemplate] = useState<machineTemplate | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getGymMachines()
            .then(data => {
                if (Array.isArray(data)) {
                    setMachines(data)
                    setMachineTemplate(data[0].machine_template)
                } else if ((data as any).machines) {
                    setMachines((data as any).machines)
                    setMachineTemplate((data as any).machines[0].machine_template)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const activeMachines = machines.filter(machine => machine.isActive)
    
    return (
        <>
        {loading ? (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        ) : (
            <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Equipamiento</h1>
            
            <div className="bg-gray-100 p-4 mb-4 rounded border">
                <p><strong>Información:</strong></p>
                <p>Cantidad de maquinas: {machines.length}</p>
                <p>Cantidad de maquinas activas: {activeMachines.length}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map((machine) => (
                    <button onClick={() => window.location.href = `/machines/${machine.id}`} key={machine.id} className="flex flex-row items-center justify-center p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:scale-105 transition-all">
                        <div className="flex flex-col items-center justify-between mb-2">
                            <h2 className="font-semibold">{machine.name}</h2>
                            <p className="text-sm text-gray-500">{machine.location}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${machine.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {machine.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className="flex w-1/2 flex-col items-center justify-center">
                            <img src={machineTemplate?.imageUrl} alt={machineTemplate?.name} className="mt-2" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
        )}
        </>
    )
}