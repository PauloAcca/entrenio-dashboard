"use client"
import { getGymNotice, setGymNotice, Notice } from "@/lib/api/notices"
import { useEffect, useState } from "react"
import { Megaphone, Save, Info, AlertTriangle } from "lucide-react"

export default function NoticesPage() {
    const [notice, setNotice] = useState<Notice | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form state
    const [message, setMessage] = useState("")
    const [type, setType] = useState<"info" | "warning">("info")
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        getGymNotice()
            .then(data => {
                setNotice(data)
                if (data) {
                    setMessage(data.message)
                    setType(data.type)
                    setIsActive(data.isActive)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        if (!message.trim()) return alert("El mensaje no puede estar vacío");
        setSaving(true)
        try {
            const updated = await setGymNotice({ message, type, isActive })
            setNotice(updated)
            alert("Aviso guardado correctamente")
        } catch (error: any) {
            alert(error.message || "Error al guardar el aviso")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-row items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Megaphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Aviso para Socios</h1>
                    <p className="text-sm text-muted-foreground">Configurá un mensaje global que verán todos tus socios al abrir la app</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col gap-6">
                
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                    <div>
                        <p className="font-semibold text-foreground">Estado del Aviso</p>
                        <p className="text-sm text-muted-foreground">Si está activo, aparecerá en la app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                        <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {/* Message Input */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Mensaje</label>
                    <textarea 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Ej: El gimnasio estará cerrado el viernes por feriado."
                        className="w-full min-h-[120px] p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                    />
                </div>

                {/* Type Selection */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Tipo de Aviso</label>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setType("info")}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${type === "info" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400" : "bg-background border-border text-muted-foreground"}`}
                        >
                            <Info className="w-5 h-5" />
                            Informativo
                        </button>
                        <button 
                            onClick={() => setType("warning")}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${type === "warning" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400" : "bg-background border-border text-muted-foreground"}`}
                        >
                            <AlertTriangle className="w-5 h-5" />
                            Advertencia
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Guardando..." : "Guardar Aviso"}
                    </button>
                </div>
            </div>
        </div>
    )
}
