"use client"
import { Menu, ChartNoAxesCombined, UsersRound, Dumbbell, MessageCircleWarning, Cog, LogOut, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ThemeButton from "../theme-button"

export default function Navigation() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { logout } = useAuthStore()
    return (

        <nav className={`flex flex-col h-dvh ${open ? 'w-[100%] sm:w-[20%] md:w-[15%]' : 'w-[10%] md:w-[5%]'} justify-between items-center p-4 bg-sidebar transition-all duration-300`}>
            <div className="flex flex-col items-center gap-2">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg cursor-pointer">
                    <Menu/>
                    {open && <h1>Entrenio Business</h1>}
                </button>
                <ThemeButton hideText={!open}/>
            </div>
            <ul className="flex flex-col gap-2">
                <li onClick={() => {router.push('/dashboard'); setOpen(false)}} className="cursor-pointer flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg"> <LayoutDashboard /> {open && 'Inicio' }</li>
                <li onClick={() => {router.push('/metrics'); setOpen(false)}} className="cursor-pointer flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg"> <ChartNoAxesCombined /> {open && 'Métricas' }</li>
                <li onClick={() => {router.push('/members'); setOpen(false)}} className="cursor-pointer flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg"> <UsersRound /> {open && 'Clientes' }</li>
                <li onClick={() => {router.push('/machines'); setOpen(false)}} className="cursor-pointer flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg"> <Dumbbell /> {open && 'Maquinas' }</li>
                <li onClick={() => {router.push('/reports'); setOpen(false)}} className="cursor-pointer flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg"> <MessageCircleWarning /> {open && 'Reportes' }</li>
            </ul> 
            <ul className="flex flex-col gap-2">
                <li onClick={() => {
                    logout()
                    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                    router.push('/login'); 
                    setOpen(false)
                }} className="cursor-pointer flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-lg"> <LogOut /> {open && 'Cerrar Sesión'}</li>
            </ul> 
        </nav>
    )
}