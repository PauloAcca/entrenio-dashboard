"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { apiFetch } from "@/lib/api/http"
import { Eye, EyeOff, Info } from "lucide-react"

export default function Login() {
    const router = useRouter()

    const { login } = useAuthStore()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Contraseña" 
                            className="border rounded-lg px-6 py-2 w-full pr-12" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <button 
                    onClick={handleLogin} 
                    disabled={isLoading}
                    className="cursor-pointer w-full flex justify-center items-center border rounded-lg px-6 py-2 bg-white hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Cargando...' : 'Entrar'}
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
                <Info className="w-4 h-4" />
                <p>
                    Si tienes algun problema con tu contraseña comunicate con nosotros.
                </p>
            </div>
            </div>
        </div>
    )
}