"use client"
import { Menu, ChartNoAxesCombined, UsersRound, Dumbbell, MessageCircleWarning, Cog, LogOut, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Navigation() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    return (

        <nav className={`flex flex-col h-dvh ${open ? 'w-[100%] sm:w-[20%] md:w-[15%]' : 'w-[10%] md:w-[5%]'} justify-between items-center p-4 bg-slate-100 transition-all duration-300`}>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 hover:bg-slate-200 p-2 rounded-lg cursor-pointer">
                <Menu/>
                {open && <h1>Entrenio Business</h1>}
            </button>
            <ul className="flex flex-col gap-2">
                <li onClick={() => {router.push('/dashboard'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Inicio' : <LayoutDashboard /> }</li>
                <li onClick={() => {router.push('/metrics'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Métricas' : <ChartNoAxesCombined /> }</li>
                <li onClick={() => {router.push('/members'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Clientes' : <UsersRound />}</li>
                <li onClick={() => {router.push('/machines'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Maquinas' : <Dumbbell />}</li>
                <li onClick={() => {router.push('/reports'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Reportes' : <MessageCircleWarning />}</li>
            </ul> 
            <ul className="flex flex-col gap-2">
                <li onClick={() => {router.push('/settings'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Configuración' : <Cog />}</li>
                <li onClick={() => {router.push('/logout'); setOpen(false)}} className="cursor-pointer hover:bg-slate-200 p-2 rounded-lg">{open ? 'Cerrar Sesión' : <LogOut />}</li>
            </ul> 
        </nav>
    )
}