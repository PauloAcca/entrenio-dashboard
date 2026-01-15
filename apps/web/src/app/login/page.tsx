export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center h-dvh gap-4">
            <div className="border border-white/10 p-4 rounded-lg">
                <p>Ingresa tu usuario y contraseña</p>
                <div className="flex flex-col gap-2">
                    <input type="text" placeholder="Usuario" />
                    <input type="password" placeholder="Contraseña" />
                </div>
                <div>
                    <button>Entrar</button>
                </div>
            </div>
        </div>
    )
}