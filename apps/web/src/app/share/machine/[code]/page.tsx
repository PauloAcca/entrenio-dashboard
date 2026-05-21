"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MachineShareRedirect() {
    const params = useParams();
    const code = params?.code as string;
    const [status, setStatus] = useState("Abriendo Entrenio...");

    useEffect(() => {
        if (!code) return;

        const appUrl = `entrenio://qr/resolve/${code}`;
        const playStoreUrl = "https://play.google.com/store/apps/details?id=com.pauloacca.FitnessApp";
        const appStoreUrl = "https://apps.apple.com/app/id6755614606";

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

        // Intentar abrir la app
        window.location.replace(appUrl);

        // Si la app no se abre en 2.5 segundos, mandar a la tienda correspondiente
        const timer = setTimeout(() => {
            setStatus("Redirigiendo a la tienda...");
            if (/android/i.test(userAgent)) {
                window.location.replace(playStoreUrl);
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
                window.location.replace(appStoreUrl);
            } else {
                // En PC, redirigimos a la página principal
                window.location.replace("/");
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [code]);

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] text-white font-sans">
            <div className="flex max-w-md flex-col items-center p-8 text-center" style={{ gap: '1.5rem' }}>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-amber-500" />
                <h1 className="text-2xl font-bold tracking-tight">{status}</h1>
                <p className="text-zinc-400">
                    Si Entrenio no se abre automáticamente, te llevaremos a la tienda de aplicaciones para que la descargues.
                </p>
            </div>
        </div>
    );
}
