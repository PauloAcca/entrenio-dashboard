import { getAllMachineTemplates } from "@/lib/api/machines"
import { machineTemplate } from "@/types/entities"
import { useEffect, useState } from "react"
import { addMachinesBulk } from "../../lib/api/machines"

interface ModalAddMachineProps {
    gymId: string
    setShowModalAddMachine: (show: boolean) => void
    onMachinesAdded?: () => void
}

export default function ModalAddMachine({ gymId, setShowModalAddMachine, onMachinesAdded }: ModalAddMachineProps) {
    const [templates, setTemplates] = useState<machineTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        getAllMachineTemplates()
            .then(setTemplates)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const handleDiscard = () => {
        setSelectedIds(new Set())
    }

    const handleSave = async () => {
        if (selectedIds.size === 0) return
        setSaving(true)
        try {
            await addMachinesBulk(Array.from(selectedIds), gymId)
            onMachinesAdded?.()
            setShowModalAddMachine(false)
        } catch (error) {
            console.error(error)
            alert('Error al agregar las máquinas')
        } finally {
            setSaving(false)
        }
    }

    const selectionCount = selectedIds.size

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-[70vw] border border-border shadow-lg flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex flex-row justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-foreground">Agregar Máquinas</h1>
                    <button 
                        onClick={() => setShowModalAddMachine(false)} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold py-2 px-4 rounded cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
                
                {/* Search */}
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Buscar máquina..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                {/* Templates grid */}
                {loading ? <p className="text-muted-foreground">Cargando templates...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1">
                         {filteredTemplates.map(t => {
                            const isSelected = selectedIds.has(t.id)
                            return (
                                <button 
                                    onClick={() => toggleSelection(t.id)} 
                                    key={t.id} 
                                    className={`relative flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                                            : 'border-border bg-muted/50 hover:bg-muted'
                                    }`}
                                >
                                    {/* Check badge */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center justify-center">
                                        <h1 className="text-lg font-semibold text-foreground">{t.name}</h1>
                                        <p className="text-sm text-muted-foreground">{t.description}</p>
                                    </div>
                                    <div className="flex items-center justify-center w-1/2">
                                        <img src={t.imageUrl} alt={t.name} className="mt-2" />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                    Mostrando {filteredTemplates.length} de {templates.length}
                </p>

                {/* Floating action bar */}
                {selectionCount > 0 && (
                    <div className="mt-4 flex items-center justify-between bg-muted border border-border rounded-lg p-4 animate-in slide-in-from-bottom-2">
                        <p className="text-sm font-medium text-foreground">
                            {selectionCount} máquina{selectionCount !== 1 ? 's' : ''} seleccionada{selectionCount !== 1 ? 's' : ''}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleDiscard} 
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Descartar
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                                )}
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}