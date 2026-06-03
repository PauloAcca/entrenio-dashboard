"use client"
import { Menu, ChartNoAxesCombined, UsersRound, Dumbbell, MessageCircleWarning, Cog, LogOut, LayoutDashboard, Inbox, QrCode, Megaphone } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ThemeButton from "../theme-button"

export default function Navigation() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { logout, gym } = useAuthStore()

    const navItems = [
        { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
        { path: '/metrics', label: 'Métricas', icon: ChartNoAxesCombined },
        { path: '/members', label: 'Clientes', icon: UsersRound },
        { path: '/machines', label: 'Maquinas', icon: Dumbbell },
        { path: '/qr-codes', label: 'Códigos QR', icon: QrCode },
        { path: '/messages', label: 'Mensajes', icon: Inbox },
        { path: '/notices', label: 'Avisos', icon: Megaphone },
        { path: '/reports', label: 'Reportes', icon: MessageCircleWarning },
    ]

    return (
        <>
            {/* Mobile Header: Visible on mobile when menu is closed */}
            {!open && (
                <div className="md:hidden w-full flex items-center p-4 bg-sidebar gap-4 border-b border-border">
                    <button 
                        onClick={() => setOpen(true)} 
                        className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                    >
                        <Menu />
                    </button>
                    <div className="flex items-center gap-2">
                        {gym?.logo_url && (
                            <img src={gym.logo_url} alt={gym.name} className="w-6 h-6 object-contain rounded-sm" />
                        )}
                        <h1 className="font-bold text-lg text-sidebar-foreground">{gym?.name || "Entrenio Business"}</h1>
                    </div>
                </div>
            )}

            <nav className={`
                flex flex-col h-dvh justify-between items-center p-4 bg-sidebar border-r border-border transition-all duration-300
                ${open 
                    ? 'fixed inset-0 z-50 w-full md:relative md:w-[15%]' 
                    : 'hidden md:flex md:w-[5%]'
                }
            `}>
                <div className="flex flex-col items-center gap-4 w-full">
                    <button onClick={() => setOpen(!open)} className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground p-2 rounded-lg cursor-pointer transition-colors text-sidebar-foreground w-full justify-center md:justify-start">
                        <Menu className="shrink-0" />
                        {open && (
                            <h1 className="font-bold whitespace-nowrap truncate">{gym?.name || "Entrenio Business"}</h1>
                        )}
                    </button>
                    
                    {gym?.logo_url && (
                        <div className={`flex items-center justify-center transition-all duration-300 ${open ? 'w-20 h-20 mb-2' : 'w-10 h-10 mb-2'}`}>
                            <img src={gym.logo_url} alt={gym.name} className="w-full h-full object-contain" />
                        </div>
                    )}

                    <ThemeButton hideText={!open}/>
                </div>
                
                <ul className="flex flex-col gap-2 w-full mt-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`)
                        const Icon = item.icon
                        return (
                            <li 
                                key={item.path}
                                onClick={() => {
                                    router.push(item.path)
                                    setOpen(false)
                                }} 
                                className={`
                                    cursor-pointer flex items-center gap-3 p-2 rounded-lg transition-all duration-200
                                    ${isActive 
                                        ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                                        : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                {open && <span className="whitespace-nowrap">{item.label}</span>}
                            </li>
                        )
                    })}
                </ul> 

                <ul className="flex flex-col gap-2 w-full mb-4">
                    <li 
                        onClick={() => {
                            logout()
                            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                            router.push('/login'); 
                            setOpen(false)
                        }} 
                        className="cursor-pointer flex items-center gap-3 hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 text-sidebar-foreground p-2 rounded-lg transition-colors mt-auto"
                    > 
                        <LogOut className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                        {open && <span className="whitespace-nowrap">Cerrar Sesión</span>}
                    </li>
                </ul> 
            </nav>
        </>
    )
}