import { getAllMachineTemplates } from "@/lib/api/machines"
import { machineTemplate } from "@/types/entities"
import { useEffect, useState } from "react"
import { addMachine } from "../../lib/api/machines"

export default function ModalAddMachine({ gymId, setShowModalAddMachine }: { gymId: string, setShowModalAddMachine: (show: boolean) => void }) {
    const [templates, setTemplates] = useState<machineTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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

    const handleAddMachine = (template: machineTemplate) => {
        console.log('Adding machine with gymId:', gymId)
        try {
            addMachine(template.id, gymId)
            .then(() => {
                console.log('Maquina agregada exitosamente')
            })
            .catch(console.error)
            alert('Maquina agregada exitosamente')
        } catch (error) {
            console.error(error)
            alert('Error al agregar maquina')
        }
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-[70vw] border border-border shadow-lg">
                <div className="flex flex-row justify-between items-center mb-4">
                    <h1 className="text-xl font-bold mb-4 text-foreground">Agregar Maquina</h1>
                    <button onClick={() => setShowModalAddMachine(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold py-2 px-4 rounded mb-4 cursor-pointer">Cerrar</button>
                </div>
                
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Buscar máquina..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                {loading ? <p className="text-muted-foreground">Cargando templates...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-h-[60vh] gap-4 overflow-y-auto">
                         {filteredTemplates.map(t => (
                            <button onClick={() => handleAddMachine(t)} key={t.id} className="flex items-center justify-center p-2 bg-muted/50 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                <div className="flex flex-col items-center justify-center">
                                    <h1 className="text-lg font-semibold text-foreground">{t.name}</h1>
                                    <p className="text-sm text-muted-foreground">{t.description}</p>
                                </div>
                                <div className="flex items-center justify-center w-1/2">
                                    <img src={t.imageUrl} alt={t.name} className="mt-2" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                    Mostrando {filteredTemplates.length} de {templates.length}
                </p>
            </div>
        </div>
    )
}