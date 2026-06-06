"use client";
import TargetCursor from "@/components/TargetCursor";
import SplitText from "@/components/SplitText";
import Particles from "@/components/Particles";
import Image from "next/image";
import Lanyard from "@/components/Lanyard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeButton from "@/components/theme-button";

export default function GimnasiosPage() {
  const [showInfo, setShowInfo] = useState<number>(0);
  const router = useRouter();

  return (
    <main className="min-h-dvh w-full p-4 md:p-6 lg:p-8 overflow-x-hidden bg-background text-foreground transition-colors duration-300">
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
          className="w-full h-full opacity-50 dark:opacity-20"
        />
      </div>

      <header onClick={() => router.push("/")} className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-center">
        <SplitText
          text="Entrenio Business"
          className=" text-3xl md:text-5xl font-semibold text-center text-foreground"
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
        <div className="absolute top-4 right-4 fixed cursor-target">
          <ThemeButton/>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground">
            Elevá la experiencia de tu <span className="text-slate-500 dark:text-slate-400">Gimnasio.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            Fidelizá a tus socios, modernizá tu equipamiento y reducí la tasa de abandono con una app personalizada para tu marca.
          </p>
          <div className="mt-8 flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
            <a href="mailto:entrenioapp@gmail.com" className="w-full lg:w-auto text-center bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 dark:hover:bg-slate-200 hover:-translate-y-1 transition-all shadow-lg cursor-target">
              Solicitar Demo
            </a>
            <a href="#features" className="w-full lg:w-auto text-center bg-white text-slate-900 dark:bg-black dark:text-white border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-xl font-medium text-lg hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-target">
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
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
          ¿Por qué tus socios abandonan?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">
          La falta de guía y motivación son las principales causas. Entrenio convierte tu sala de musculación en una experiencia guiada e interactiva.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
           <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-2xl">📉</div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Reducí el Abandono</h3>
              <p className="text-muted-foreground">Al tener una rutina clara y saber cómo usar las máquinas, los socios ven resultados más rápido y se quedan.</p>
           </div>
           <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-2xl">💎</div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Valor Premium</h3>
              <p className="text-muted-foreground">Diferenciate de la competencia ofreciendo una app personalizada incluida en la cuota.</p>
           </div>
           <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-2xl">🦾</div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Staff Eficiente</h3>
              <p className="text-muted-foreground">Tus entrenadores pueden enfocarse en corregir técnica y motivar, en lugar de explicar ejercicios básicos una y otra vez.</p>
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
                <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-white border p-6 bg-black dark:bg-white dark:text-black cursor-target hover:scale-[1.02] transition-all duration-300 text-left">
                  <h3 className="text-xl font-bold">{f.t}</h3>
                  <p className="mt-2 text-slate-300 dark:text-slate-600">{f.d}</p>
                </button>
              ) : (
                <button key={f.t} onClick={() => setShowInfo(index)} className="rounded-xl text-black dark:text-white border p-6 bg-white dark:bg-black cursor-target hover:scale-[1.02] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 text-left border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-bold">{f.t}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{f.d}</p>
                </button>
              )
            ))}
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 md:p-10">
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
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-foreground">{content.t}</h2>
                        <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">{content.d}</p>
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

      {/* Comprehensive Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Todo lo que tu gimnasio necesita en una sola plataforma
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubrí todas las herramientas que incluye el <strong>Dashboard Profesional</strong> para llevar la gestión de tu centro al siguiente nivel.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            {
              icon: "👥",
              title: "Gestión de Socios",
              description: "Administrá usuarios, accedé a su información, progreso y objetivos desde un único panel."
            },
            {
              icon: "🤖",
              title: "Rutinas con IA",
              description: "Generá rutinas automáticamente según objetivos, experiencia y tu equipamiento disponible."
            },
            {
              icon: "✍️",
              title: "Edición Manual",
              description: "Modificá y ajustá cualquier rutina cuando lo necesites para un seguimiento más específico."
            },
            {
              icon: "🏋️",
              title: "Gestión de Equipamiento",
              description: "Cargá tus máquinas para que las rutinas se adapten a los recursos reales de tu gimnasio."
            },
            {
              icon: "🔗",
              title: "QRs Inteligentes",
              description: "Códigos en cada máquina para acceder al instante a instrucciones y videos explicativos."
            },
            {
              icon: "📈",
              title: "Seguimiento de Progreso",
              description: "Visualizá la evolución de cada socio con un seguimiento detallado de sus avances."
            },
            {
              icon: "🥗",
              title: "Control Nutricional",
              description: "Registrá y visualizá planes de alimentación para complementar el entrenamiento de tus socios."
            },
            {
              icon: "📊",
              title: "Métricas y Analítica",
              description: "Estadísticas avanzadas sobre el uso de la app y rendimiento general de tu gimnasio."
            },
            {
              icon: "🏛️",
              title: "Biblioteca de Ejercicios",
              description: "Gestioná y personalizá el catálogo de ejercicios disponible para todos tus usuarios."
            },
            {
              icon: "💬",
              title: "Feedback de Usuarios",
              description: "Recibí opiniones directamente desde la app para mejorar el servicio continuamente."
            },
            {
              icon: "📢",
              title: "Comunicación Directa",
              description: "Enviá notificaciones y avisos a todos los usuarios sobre novedades y promociones."
            },
            {
              icon: "⏳",
              title: "Avisos de Membresía",
              description: "Tus miembros recibirán un mensaje automáticamente cuando su membresía esté por vencer."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100 dark:border-slate-700/50">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">¿Listo para modernizar tu gimnasio?</h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-10">Escribinos y descubrí cómo Entrenio puede transformar tu negocio.</p>
        <form 
          className="flex flex-col gap-4 max-w-lg mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
            const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
            const mailtoLink = `mailto:entrenioapp@gmail.com?subject=Consulta%20desde%20Gimnasios&body=Email:%20${encodeURIComponent(email)}%0D%0A%0D%0AMensaje:%0D%0A${encodeURIComponent(message)}`;
            window.location.href = mailtoLink;
          }}
        >
             <input name="email" type="email" placeholder="tu@email.com" className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:outline-none transition-all text-foreground" required/>
             <textarea name="message" placeholder="Tu mensaje..." rows={4} className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:outline-none transition-all text-foreground resize-none" required></textarea>
             <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all cursor-target">Enviar Mensaje</button>
        </form>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Entrenio Business</p>
        <div className="flex gap-6">
             <a href="/" className="hover:text-black dark:hover:text-white transition-colors">Volver a Entrenio</a>
             <a href="mailto:entrenioapp@gmail.com" className="hover:text-black dark:hover:text-white transition-colors">entrenioapp@gmail.com</a>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/541153223441" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 cursor-target flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 fill-current">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-2.9-5-1.5-7.7 1.3-10.4 2.5-2.5 5.5-6.5 8.3-9.7 2.7-3.2 3.7-5.6 5.5-9.3 1.9-3.7 .9-7-1.4-11.6-4.6-9.3-19.5-47.3-26.7-64.7-7.1-17.2-14.3-14.9-19.5-15.1-4.6-.2-9.2-.2-13.8-.2-4.6 0-12.5 1.9-18.5 8.4-5.5 6.5-21.8 21.4-21.8 52.1s22.2 60.5 25.5 64.8c3.2 4.2 44.2 67.5 107 94.6 15 6.5 26.6 10.3 35.8 13.2 15 4.8 28.7 4.1 39.5 2.5 12.2-1.8 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
    </main>
  );
}
