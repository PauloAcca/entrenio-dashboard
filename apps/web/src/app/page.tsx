"use client";
import TargetCursor from "@/components/TargetCursor";
import SplitText from "@/components/SplitText";

import { useState } from "react";

export default function Home() {
  const [showInfo, setShowInfo] = useState<number>();


  return (
    <main className="min-h-dvh">
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={4}
        parallaxOn={true}
      />
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-center">
        <SplitText
          text="Entrenio"
          className="text-5xl font-semibold text-center"
          delay={100}
          duration={1}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Tu entrenador personal en el bolsillo
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Calculá tus calorías objetivo, registrá comidas con una foto y obtené
            macros estimados con IA. Diseñá rutinas y planes de alimentación
            adaptados a tu meta.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="#" className="inline-block cursor-target">
              <img src="/app-store-badge.svg" alt="App Store" className="h-12" />
            </a>
            <a href="#" className="inline-block cursor-target">
              <img src="/play-store-badge.svg" alt="Google Play" className="h-12" />
            </a>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            ¿Aún sin publicar? Dejá tu correo y enterate del lanzamiento.
          </p>
          <form className="mt-3 flex gap-2 max-w-md" action="https://formspree.io/f/tu_id" method="POST">
            <input
              className="border rounded-md px-3 py-2 flex-1"
              type="email"
              name="email"
              placeholder="tu@email.com"
              required
            />
            <button className="rounded-md px-4 py-2 border cursor-target" type="submit">Notificarme</button>
          </form>
        </div>

        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <img
            src="/mirandoGymDibujo.png"
            alt="Vista previa de la app"
            className="rounded-xl max-w-full h-auto mx-auto md:max-w-md lg:max-w-lg"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { t: "Escaneo con IA", d: "Subí una foto y estimamos calorías y macronutrientes." },
          { t: "Cálculo diario", d: "Objetivo calórico según tus datos y tu meta." },
          { t: "Rutinas", d: "Entrenamientos personalizados con videos e indicaciones." },
          { t: "Planes y recetas", d: "Menús alineados a tu objetivo nutricional." },
        ].map((f, index) => (
          <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-black border p-5 bg-white cursor-target hover:scale-120 hover:border-white transition-all duration-300">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.d}</p>
          </button>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 gap-6 rounded-xl border">
        {[
          {
            t: "Escanea tus comidas con IA",
            d: "Sacale una foto a tu comida, escribi que estas comido o subi una foto de tu galeria y Entrenio se encargara de darte todo la informacion nutricional necesaria",
            i: "/controlComidaDibujo.png"
          },
          {
            t: "LLeva la cuenta de lo que consumis",
            d: "Al subir una comida entrenio se encarga de llevar el calculo de las calorias, macronutrientes y agua que consumiste diariamente. ",
            i: "/controlComidaDibujo.png"
          },
          {
            t: "Crea tu rutina personalizada",
            d: "Entrenio se encarga de crearte una rutina personalizada segun tus objetivos y tu nivel de experiencia. Simplemente llena tus y habla con entre para determina la mejor rutina para vos",
            i: "/controlEjercicioDibujado.png"
          },
          {
            t: "Obtene recetas saludables",
            d: "Obtene recetas saludables y deliciosas adaptadas a tus objetivos y preferencias. Entrenio se encarga de crearte un plan de alimentacion personalizado para vos",
            i: "/controlComidaDibujo.png"
          },
        ].filter((_, index) => showInfo === index).map((f) => (
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col items-center gap-2 w-[60%]">
              <h2 className="font-semibold text-2xl">{f.t}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.d}</p>
            </div>
            <img src={f.i} alt={f.t} className="w-[40%] h-auto" />
          </div>
        ))}
      </section>

      <footer id="contacto" className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="flex gap-4">
          <a className="hover:underline" href="/privacy.html">Privacidad y legales</a>
          <a className="hover:underline" href="/terms.html">Términos y condiciones</a>
          <a className="hover:underline" href="mailto:soporte@entrenio.app">soporte@entrenio.app</a>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} Entrenio</p>
      </footer>
    </main>
  );
}