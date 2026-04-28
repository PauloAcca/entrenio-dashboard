"use client"
import { getGymMessages, GymMessage } from "@/lib/api/gymMessages"
import { useEffect, useState } from "react"
import { MessageCircle, Lightbulb, AlertCircle, HelpCircle, MoreHorizontal, User, Calendar } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    suggestion: {
        label: "Sugerencia",
        icon: <Lightbulb className="w-4 h-4" />,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800/50",
    },
    complaint: {
        label: "Reclamo",
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800/50",
    },
    question: {
        label: "Consulta",
        icon: <HelpCircle className="w-4 h-4" />,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800/50",
    },
    other: {
        label: "Otro",
        icon: <MoreHorizontal className="w-4 h-4" />,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800/50",
    },
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<GymMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all") // kept as string for CATEGORY_CONFIG lookup flexibility
    const [error, setError] = useState<string | null>(null)
    const gym = useAuthStore(s => s.gym)

    useEffect(() => {
        console.log("[Messages] gymId:", gym?.id)
        console.log("[Messages] API_URL:", process.env.NEXT_PUBLIC_API_URL)
        getGymMessages()
            .then(data => {
                console.log("[Messages] response:", data)
                setMessages(data)
            })
            .catch(err => {
                console.error("[Messages] error:", err)
                setError(err?.message ?? "Error desconocido")
            })
            .finally(() => setLoading(false))
    }, [])

    type CategoryKey = "all" | "suggestion" | "complaint" | "question" | "other"
    const categories: CategoryKey[] = ["all", "suggestion", "complaint", "question", "other"]
    const filtered = filter === "all" ? messages : messages.filter(m => m.category === filter)

    const counts = {
        all: messages.length,
        suggestion: messages.filter(m => m.category === "suggestion").length,
        complaint: messages.filter(m => m.category === "complaint").length,
        question: messages.filter(m => m.category === "question").length,
        other: messages.filter(m => m.category === "other").length,
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-row items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mensajes de miembros</h1>
                    <p className="text-sm text-muted-foreground">Sugerencias, reclamos y consultas de tus socios</p>
                </div>
            </div>

            {/* Debug / Error banner */}
            {error && (
                <div className="mb-4 p-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-mono">
                    <strong>Error:</strong> {error}<br />
                    <span className="text-xs opacity-70">GymId: {gym?.id ?? "null"} · API: {process.env.NEXT_PUBLIC_API_URL ?? "undefined"}</span>
                </div>
            )}
            {!error && !loading && (
                <p className="text-xs text-muted-foreground/40 mb-4 font-mono">
                    gym: {gym?.id ?? "null"} · api: {process.env.NEXT_PUBLIC_API_URL ?? "undefined"}
                </p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {(["suggestion", "complaint", "question", "other"] as const).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat]
                    return (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`flex flex-col gap-1.5 p-4 rounded-xl border cursor-pointer transition-all text-left hover:scale-[1.02] ${filter === cat ? `${cfg.bg} ${cfg.border}` : "bg-card border-border hover:border-border/80"}`}
                        >
                            <div className={`flex items-center gap-1.5 ${filter === cat ? cfg.color : "text-muted-foreground"}`}>
                                {cfg.icon}
                                <span className="text-xs font-bold uppercase tracking-wider">{cfg.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{counts[cat]}</p>
                        </button>
                    )
                })}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border cursor-pointer ${
                            filter === cat
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-border hover:border-border/60"
                        }`}
                    >
                        {cat === "all" ? `Todos (${counts.all})` : `${CATEGORY_CONFIG[cat]?.label} (${counts[cat]})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                    <div className="p-4 rounded-2xl bg-muted border border-border">
                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">No hay mensajes</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {filter === "all"
                                ? "Tus socios aún no enviaron mensajes desde la app."
                                : `No hay mensajes de tipo "${CATEGORY_CONFIG[filter]?.label}" aún.`}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(msg => {
                        const cfg = CATEGORY_CONFIG[msg.category] ?? CATEGORY_CONFIG["other"]
                        const displayName = msg.user?.name || msg.user?.email || "Socio anónimo"
                        const avatar = msg.user?.avatarUrl
                        return (
                            <div
                                key={msg.id}
                                className="flex flex-col gap-3 p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Avatar */}
                                        {avatar ? (
                                            <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground text-sm truncate">{displayName}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Category badge */}
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                        {cfg.icon}
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Message body */}
                                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/50 rounded-xl p-4 border border-border/50 whitespace-pre-wrap">
                                    {msg.message}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
