"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RecipeShareRedirect() {
  const params = useParams();
  const slug = params?.slug as string;
  const [status, setStatus] = useState("Abriendo Entrenio...");

  useEffect(() => {
    if (!slug) return;

    const appUrl = `entrenio://recipe/${slug}`;
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.pauloacca.FitnessApp";
    const appStoreUrl = "https://apps.apple.com/app/id6755614606"; 

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    const storeUrl = isAndroid ? playStoreUrl : (isIOS ? appStoreUrl : "/");

    // Intentar abrir la app
    window.location.href = appUrl;

    // Validar si la app se abrió
    const checkAppOpened = () => {
        if (document.visibilityState === "hidden") {
            return true;
        }
        return false;
    };

    // Si la app no se abre, mostrar mensaje
    const timer = setTimeout(() => {
        if (!checkAppOpened()) {
            setStatus("Parece que no tienes la app instalada.");
        }
    }, 3500);

    return () => clearTimeout(timer);
  }, [slug]);

  const userAgent = typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor || (window as any).opera : '';
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const storeUrl = isAndroid ? "https://play.google.com/store/apps/details?id=com.pauloacca.FitnessApp" : (isIOS ? "https://apps.apple.com/app/id6755614606" : "/");
  const appUrl = `entrenio://recipe/${slug}`;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] text-white font-sans">
      <div className="flex max-w-md flex-col items-center p-8 text-center" style={{ gap: '1.5rem' }}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-amber-500" />
        <h1 className="text-2xl font-bold tracking-tight">{status}</h1>
        <p className="text-zinc-400 mb-4">
          Si Entrenio no se abre automáticamente, puedes usar los botones de abajo.
        </p>

        <div className="flex flex-col gap-3 w-full">
            <a 
                href={appUrl}
                className="w-full rounded-md bg-amber-500 px-4 py-3 text-sm font-semibold text-black shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-colors"
            >
                Ya tengo la app, abrir Entrenio
            </a>
            <a 
                href={storeUrl}
                className="w-full rounded-md bg-zinc-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-800 transition-colors"
            >
                Descargar aplicación
            </a>
        </div>
      </div>
    </div>
  );
}
