"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { apiFetch } from "@/lib/api/http"

export default function Login() {
    const router = useRouter()

    const { login } = useAuthStore()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        setError("")
        try {
            const data = await apiFetch<any>('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email.toLowerCase(), password })
            })

            document.cookie = `auth_token=${data.access_token}; path=/`
            
            login(data.user, data.user.gym, data.access_token)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-dvh">
            <div className="flex flex-col sm:w-[50%] w-full bg-slate-100 p-6 gap-8 rounded-lg">
                <h1 className="text-3xl font-bold">Entrenio Business</h1>
                <p>Ingresa tu usuario y contraseña</p>
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Usuario" 
                        className="border rounded-lg px-6 py-2" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        className="border rounded-lg px-6 py-2" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleLogin} 
                    disabled={isLoading}
                    className="cursor-pointer w-full flex justify-center items-center border rounded-lg px-6 py-2 bg-white hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Cargando...' : 'Entrar'}
                </button>
            </div>
        </div>
    )
}