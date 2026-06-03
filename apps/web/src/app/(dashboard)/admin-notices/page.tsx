"use client"
import { getGlobalNotice, setGlobalNotice, Notice } from "@/lib/api/notices"
import { useEffect, useState } from "react"
import { Megaphone, Save, Info, AlertTriangle, Key } from "lucide-react"

export default function AdminNoticesPage() {
    const [notice, setNotice] = useState<Notice | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state
    const [secret, setSecret] = useState("")
    const [authenticated, setAuthenticated] = useState(false)
    const [message, setMessage] = useState("")
    const [type, setType] = useState<"info" | "warning">("info")
    const [isActive, setIsActive] = useState(true)

    const handleLogin = async () => {
        setLoading(true)
        try {
            const data = await getGlobalNotice(secret)
            if ((data as any)?.error) {
                alert("Contraseña incorrecta")
            } else {
                setAuthenticated(true)
                if (data && Object.keys(data).length > 0) {
                    setNotice(data as Notice)
                    setMessage(data.message || "")
                    setType(data.type || "info")
                    setIsActive(data.isActive !== undefined ? data.isActive : true)
                }
            }
        } catch (error) {
            console.error(error)
            alert("Error al conectar con el servidor")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!message.trim()) return alert("El mensaje no puede estar vacío");
        setSaving(true)
        try {
            const updated = await setGlobalNotice({ message, type, isActive, secret })
            if ((updated as any)?.error) {
                alert("Error de autorización")
            } else {
                setNotice(updated as Notice)
                alert("Aviso Global guardado correctamente")
            }
        } catch (error: any) {
            alert(error.message || "Error al guardar el aviso")
        } finally {
            setSaving(false)
        }
    }

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-6">
                <div className="bg-card border border-border p-8 rounded-2xl shadow-sm w-full max-w-md flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <Key className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold">Admin Global Notices</h1>
                        <p className="text-sm text-muted-foreground">Ingresá el secreto de superadmin</p>
                    </div>
                    <input 
                        type="password"
                        value={secret}
                        onChange={e => setSecret(e.target.value)}
                        placeholder="Superadmin secret"
                        className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button 
                        onClick={handleLogin}
                        disabled={loading || !secret}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Verificando..." : "Ingresar"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-row items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Megaphone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Aviso Global de la App</h1>
                    <p className="text-sm text-muted-foreground">Este mensaje será visto por TODOS los usuarios de la plataforma</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col gap-6 ring-2 ring-purple-500/20">
                
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                    <div>
                        <p className="font-semibold text-foreground">Estado del Aviso Global</p>
                        <p className="text-sm text-muted-foreground">Si está activo, TODOS lo verán al abrir la app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                        <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                {/* Message Input */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Mensaje Global</label>
                    <textarea 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Ej: Mantenimiento programado para esta noche a las 00:00."
                        className="w-full min-h-[120px] p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-y"
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
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Guardando..." : "Guardar Aviso Global"}
                    </button>
                </div>
            </div>
        </div>
    )
}
