"use client"

import { useRouter } from "next/navigation"

import { useAuthStore } from "@/store/authStore"

export default function Login() {
    const router = useRouter()

    const { login } = useAuthStore()

    const handleLogin = () => {
        document.cookie = "auth_token=true; path=/"
        
        // Mock login data
        const mockUser = {
            id: '1',
            email: 'test@entrenio.com',
            name: 'Test User'
        }

        const mockGym = {
            id: 'gym-123',
            name: 'Entrenio Gym',
            address: '123 Test St',
            phone: '123-456-7890',
            email: 'gym@entrenio.com',
            website: 'https://entrenio.com',
            logo: 'https://via.placeholder.com/150'
        }

        login(mockUser, mockGym)
        router.push("/dashboard")
    }

    return (
        <div className="flex flex-col items-center justify-center h-dvh">
            <div className="flex flex-col sm:w-[50%] w-full bg-slate-100 p-6 gap-8 rounded-lg">
                <h1 className="text-3xl font-bold">Entrenio Business</h1>
                <p>Ingresa tu usuario y contraseña</p>
                <div className="flex flex-col gap-4">
                    <input type="text" placeholder="Usuario" className="border rounded-lg px-6 py-2" />
                    <input type="password" placeholder="Contraseña" className="border rounded-lg px-6 py-2" />
                </div>
                <button onClick={handleLogin} className="cursor-pointer w-full flex justify-center items-center border rounded-lg px-6 py-2 bg-white hover:bg-slate-50 transition-all">Entrar</button>
            </div>
        </div>
    )
}