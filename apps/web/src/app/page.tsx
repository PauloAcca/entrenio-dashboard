"use client";
import TargetCursor from "@/components/TargetCursor";
import SplitText from "@/components/SplitText";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { useState } from "react";
import Particles from "@/components/Particles";

export default function Home() {
  const [showInfo, setShowInfo] = useState<number>(0);


  return (
    <main className="min-h-dvh">
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={4}
        parallaxOn={true}
      />
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleColors={["#000000","#000000","#000000"]}
          moveParticlesOnHover={false}
          particleHoverFactor={1}
          alphaParticles={false}
          particleBaseSize={100}
          sizeRandomness={1}
          cameraDistance={20}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

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
          <div className="mt-8 flex flex-row items-center gap-4">
            <a href="#" className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-xl border border-transparent hover:border-slate-800 hover:scale-105 transition-all shadow-lg cursor-target group">
              <svg className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              <div className="flex flex-col items-start leading-none group-hover:translate-x-0.5 transition-transform">
                <span className="text-[10px] font-medium text-gray-300">Consiguelo en el</span>
                <span className="text-xl font-bold">App Store</span>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:scale-105 transition-all shadow-lg cursor-target group">
              <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm287.3 256l-60.1 60.1 51.2 29.5L472.9 428c11.3 6.5 25.4 6.5 36.6 0l-161.2-161.2-22.9-10.8zM47 512l256.6-256 22.9-22.9 60.1 60.1L104.6 499c-20.9 11.9-46.3 12.1-67.5 0l9.9 13z"/>
                <path fill="#34A853" d="M104.6 499l280.8-161.2-60.1-60.1L47 512z"/>
                <path fill="#FBBC05" d="M104.6 13L47 0l278.4 278.4 60.1-60.1z"/>
                <path fill="#EA4335" d="M325.3 234.3L385.4 268 472.9 84c11.3 6.5 25.4 6.5 36.6 0L325.3 234.3z"/>
              </svg>
              <div className="flex flex-col items-start leading-none group-hover:translate-x-0.5 transition-transform">
                <span className="text-[10px] font-medium text-slate-500">Disponible en</span>
                <span className="text-xl font-bold">Google Play</span>
              </div>
            </a>
          </div>
          <p className="mt-8 text-sm font-medium text-slate-500">
            ¿Aún sin publicar? Dejá tu correo y enterate del lanzamiento.
          </p>
          <form className="mt-3 flex gap-3 max-w-md" action="https://formspree.io/f/tu_id" method="POST">
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 flex-1 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 transition-all placeholder:text-slate-400"
              type="email"
              name="email"
              placeholder="tu@email.com"
              required
            />
            <button className="bg-black text-white rounded-xl px-6 py-3 font-medium hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-target" type="submit">Notificarme</button>
          </form>
        </div>

        <div className="">
          <img
            src="/mockupPrincipal.png"
            alt="Vista previa de la app"
            className="max-w-full h-auto mx-auto md:max-w-md lg:max-w-lg"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Simple. Rápido. <span className="text-slate-500">Inteligente.</span>
        </h2>
      </section>

      <ScrollStack useWindowScroll={true} itemDistance={50} stackPosition="15%">
        <ScrollStackItem itemClassName="bg-[#f5f5f7] border border-slate-200">
          <div className="h-full flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Simple</h3>
            <p className="text-xl text-slate-600">
              Sin complicaciones. Saca una foto a tu comida y listo. Nosotros hacemos el resto de las matemáticas por vos.
            </p>
          </div>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-[#1c1c1e] text-white">
          <div className="h-full flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Rápido</h3>
            <p className="text-xl text-gray-300">
              Olvídate de buscar ingredientes uno por uno. Agrega todo tu plato en segundos con nuestra IA avanzada.
            </p>
          </div>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-blue-600 text-white">
          <div className="h-full flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Inteligente</h3>
            <p className="text-xl text-blue-100">
              Aprende de tus habitos y adapta tus objetivos diariamente para asegurar que llegues a tu meta.
            </p>
          </div>
        </ScrollStackItem>
      </ScrollStack>


      <section className="mx-auto max-w-6xl px-4 pb-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { t: "Escaneo con IA", d: "Subí una foto y estimamos calorías y macronutrientes." },
          { t: "Cálculo diario", d: "Objetivo calórico según tus datos y tu meta." },
          { t: "Rutinas", d: "Entrenamientos personalizados con videos e indicaciones." },
          { t: "Estadísticas", d: "Estadísticas de tus entrenamientos y nutrición." },
        ].map((f, index: number) => (

          index == showInfo ? (
            <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-white border p-5 bg-black cursor-target hover:scale-120 hover:border-white transition-all duration-300">
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-white">{f.d}</p>
            </button>
          ) : (
            <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-black border p-5 bg-white cursor-target hover:scale-120 hover:border-white transition-all duration-300">
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.d}</p>
            </button>
          )

        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-6">
        <div className="rounded-2xl border bg-slate-50 p-8 md:p-12">
          {[
            {
              t: "Escanea tus comidas con IA",
              d: "Sacale una foto a tu comida, escribi que estas comido o subi una foto de tu galeria y Entrenio se encargara de darte toda la informacion nutricional necesaria",
              i: "/mockupEscaneo.png"
            },
            {
              t: "LLeva la cuenta de lo que consumis",
              d: "Al subir una comida Entrenio se encarga de llevar el calculo de las calorias, macronutrientes y agua que consumiste diariamente.",
              i: "/mockupComida.png"
            },
            {
              t: "Crea tu rutina personalizada",
              d: "Entrenio se encarga de crearte una rutina personalizada segun tus objetivos y tu nivel de experiencia. Simplemente llena tus datos y habla con el entrenador para determinar la mejor rutina para vos.",
              i: "/mockupEjercicios.png"
            },
            {
              t: "Estadísticas de tus entrenamientos y nutrición",
              d: "Obtene estadísticas de tus entrenamientos y nutrición para que puedas ver como estas evolucionando y ajustar tus objetivos si es necesario.",
              i: "/mockupEstadisticas.png"
            },
            // {
            //   t: "Obtene recetas saludables",
            //   d: "Obtene recetas saludables y deliciosas adaptadas a tus objetivos y preferencias. Entrenio se encarga de crearte un plan de alimentacion personalizado para vos.",
            //   i: "/controlComidaDibujo.png"
            // },
          ].filter((_, index: number) => showInfo === index).map((f) => (
            <div key={f.t} className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6 order-2 md:order-1">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                  {f.t}
                </h2>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  {f.d}
                </p>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <img 
                  src={f.i} 
                  alt={f.t} 
                  className="max-w-full h-auto object-cover transform transition-transform hover:scale-[1.02] duration-500" 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-20 mb-10">
        <div className="bg-[#1c1c1e] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">¿Tenés un Gimnasio?</h2>
            <p className="text-gray-300 text-lg">
              Ofrecé Entrenio a tus socios, digitalizá tu sala de musculación y aumentá la retención de clientes.
            </p>
          </div>
          <a href="/gimnasios" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform cursor-target whitespace-nowrap">
            Soluciones para Gimnasios
          </a>
        </div>
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