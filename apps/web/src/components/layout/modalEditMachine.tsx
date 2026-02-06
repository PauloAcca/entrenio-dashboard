
import { equipment } from "@/types/entities"
import { useState } from "react"
import { updateMachine } from "../../lib/api/machines"

export default function ModalEditMachine({ machine, gymId, onClose, onUpdate }: { machine: equipment, gymId: string, onClose: () => void, onUpdate: () => void }) {
    const [location, setLocation] = useState(machine.location || '')
    const [isActive, setIsActive] = useState(machine.isActive)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        try {
            await updateMachine(machine.id, gymId, { location, isActive })
            onUpdate()
            onClose()
        } catch (error) {
            console.error(error)
            alert('Error al actualizar la maquina')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-lg shadow-xl border border-border">
                <div className="flex flex-row justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-foreground">Editar Maquina</h1>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6 flex flex-col items-center text-center">
                   <img src={machine.machine_template?.imageUrl} alt={machine.machine_template?.name} className="h-40 object-contain mb-2" />
                    <h2 className="font-semibold text-lg text-foreground">{machine.machine_template?.name}</h2>
                    <p className="text-sm font-medium text-primary mb-1">{machine.machine_template?.category}</p>
                    <p className="text-sm text-muted-foreground max-w-sm">{machine.machine_template?.description}</p>
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Ubicación</label>
                        <input 
                            type="text" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            className="w-full border border-input bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ej: Zona de Cardio, Piso 2"
                        />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
                         <select 
                            value={isActive ? 'true' : 'false'} 
                            onChange={(e) => setIsActive(e.target.value === 'true')}
                            className="w-full border border-input bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="true">Activa</option>
                            <option value="false">Inactiva</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded">Cancelar</button>
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    )
}
