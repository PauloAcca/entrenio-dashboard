"use client";
import TargetCursor from "@/components/TargetCursor";
import SplitText from "@/components/SplitText";
import Particles from "@/components/Particles";
import Image from "next/image";
import Lanyard from "@/components/Lanyard";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GimnasiosPage() {
  const [showInfo, setShowInfo] = useState<number>(0);
  const router = useRouter();

  return (
    <main className="min-h-dvh w-full overflow-x-hidden">
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
          particleColors={["#000000", "#000000", "#000000"]}
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

      <header onClick={() => router.push("/")} className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-center">
        <SplitText
          text="Entrenio Business"
          className=" text-3xl md:text-5xl font-semibold text-center"
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

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Elevá la experiencia de tu <span className="text-slate-500">Gimnasio.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed">
            Fidelizá a tus socios, modernizá tu equipamiento y reducí la tasa de abandono con una app personalizada para tu marca.
          </p>
          <div className="mt-8 flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
            <a href="mailto:ventas@entrenio.app" className="w-full lg:w-auto text-center bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg cursor-target">
              Solicitar Demo
            </a>
            <a href="#features" className="w-full lg:w-auto text-center bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-medium text-lg hover:border-slate-400 hover:bg-slate-50 transition-all cursor-target">
              Ver Características
            </a>
          </div>
        </div>
        <div className="relative h-[600px] w-full flex items-center justify-center">
             <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
        </div>
      </section>

      {/* Value Proposition */}
      <section className="mx-auto max-w-6xl px-4 py-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          ¿Por qué tus socios abandonan?
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-16">
          La falta de guía y motivación son las principales causas. Entrenio convierte tu sala de musculación en una experiencia guiada e interactiva.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
           <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-2xl">📉</div>
              <h3 className="text-xl font-bold mb-3">Reducí el Abandono</h3>
              <p className="text-slate-600">Al tener una rutina clara y saber cómo usar las máquinas, los socios ven resultados más rápido y se quedan.</p>
           </div>
           <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-2xl">💎</div>
              <h3 className="text-xl font-bold mb-3">Valor Premium</h3>
              <p className="text-slate-600">Diferenciate de la competencia ofreciendo una app personalizada incluida en la cuota.</p>
           </div>
           <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-2xl">🦾</div>
              <h3 className="text-xl font-bold mb-3">Staff Eficiente</h3>
              <p className="text-slate-600">Tus entrenadores pueden enfocarse en corregir técnica y motivar, en lugar de explicar ejercicios básicos una y otra vez.</p>
           </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { t: "Marca Blanca", d: "Tu logo, tus colores, tu identidad." },
              { t: "QRs Inteligentes", d: "Digitalizá tus máquinas al instante." },
              { t: "Rutinas a Medida", d: "Planes con TU equipamiento." },
            ].map((f, index) => (
               index == showInfo ? (
                <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-white border p-6 bg-black cursor-target hover:scale-[1.02] transition-all duration-300 text-left">
                  <h3 className="text-xl font-bold">{f.t}</h3>
                  <p className="mt-2 text-slate-300">{f.d}</p>
                </button>
              ) : (
                <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-black border p-6 bg-white cursor-target hover:scale-[1.02] hover:border-slate-300 transition-all duration-300 text-left">
                  <h3 className="text-xl font-bold">{f.t}</h3>
                  <p className="mt-2 text-slate-600">{f.d}</p>
                </button>
              )
            ))}
        </div>

        <div className="rounded-3xl border bg-slate-50 p-8 md:p-10">
            {[
                {
                    t: "Tu propia App, sin programar",
                    d: "Personalizamos la interfaz de Entrenio con el logo y branding de tu gimnasio. Para tus socios, es TU aplicación.",
                    i: "/mockupPersonalizar.png"
                },
                {
                    t: "Tus máquinas te hablan",
                    d: "Generamos códigos QR únicos para cada una de tus máquinas. Al escanearlos, el socio ve instantáneamente un video tutorial de cómo usarla, músculos trabajados y ejercicios alternativos.",
                    i: "/mockupQR.png"
                },
                {
                    t: "Rutinas que sí pueden hacer",
                    d: "Nuestro algoritmo crea planes de entrenamiento basándose EXCLUSIVAMENTE en el inventario de máquinas y elementos que tiene tu gimnasio. Se acabaron las rutinas con ejercicios imposibles de realizar.",
                    i: "/mockupEjercicios.png"
                }
            ].filter((_, index) => showInfo === index).map((content) => (
                <div key={content.t} className="grid md:grid-cols-2 gap-12 items-center animation-fade-in">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">{content.t}</h2>
                        <p className="text-lg lg:text-xl text-slate-600 leading-relaxed">{content.d}</p>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                        <img 
                            src={content.i} 
                            alt={content.t} 
                            className="max-w-full h-auto object-cover transform transition-transform hover:scale-[1.02] duration-500" 
                        />
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto max-w-4xl px-4 py-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">¿Listo para modernizar tu gimnasio?</h2>
        <p className="text-lg md:text-xl text-slate-600 mb-10">Agenda una demostración gratuita de 15 minutos y descubrí cómo Entrenio puede transformar tu negocio.</p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
             <input type="email" placeholder="tu@email.com" className="flex-1 px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-black/5 focus:outline-none transition-all" required/>
             <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all cursor-target">Solicitar Info</button>
        </form>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Entrenio Business</p>
        <div className="flex gap-6">
             <a href="/" className="hover:text-black transition-colors">Volver a Entrenio</a>
             <a href="mailto:negocios@entrenio.app" className="hover:text-black transition-colors">negocios@entrenio.app</a>
        </div>
      </footer>

    </main>
  );
}
