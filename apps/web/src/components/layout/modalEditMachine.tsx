
import { equipment } from "@/types/entities"
import { useState } from "react"
import { updateMachine, deleteMachine } from "../../lib/api/machines"

export default function ModalEditMachine({ machine, gymId, onClose, onUpdate }: { machine: equipment, gymId: string, onClose: () => void, onUpdate: () => void }) {
    const [location, setLocation] = useState(machine.location || '')
    const [isActive, setIsActive] = useState(machine.isActive)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteMachine(machine.id, gymId)
            onUpdate()
            onClose()
        } catch (error) {
            console.error(error)
            alert('Error al eliminar la máquina')
        } finally {
            setDeleting(false)
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

                <div className="mt-6 flex justify-between">
                    {/* Delete button */}
                    <button 
                        onClick={() => setShowDeleteConfirm(true)} 
                        disabled={loading || deleting}
                        className="px-4 py-2 text-destructive hover:bg-destructive hover:text-white rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </button>

                    {/* Save/Cancel buttons */}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded cursor-pointer">Cancelar</button>
                        <button 
                            onClick={handleSave} 
                            disabled={loading || deleting}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete confirmation overlay */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="bg-card p-6 rounded-lg max-w-sm w-full border border-border shadow-xl">
                        <h2 className="text-lg font-bold text-foreground mb-2">¿Eliminar máquina?</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Esta acción eliminará <strong>{machine.machine_template?.name}</strong> de tu gimnasio. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)} 
                                disabled={deleting}
                                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete} 
                                disabled={deleting}
                                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                                {deleting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive-foreground border-t-transparent" />
                                )}
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
