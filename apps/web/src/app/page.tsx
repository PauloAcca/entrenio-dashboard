// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-center">
        <div className="text-xl font-semibold">Entrenio</div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
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
            <a href="#" className="inline-block">
              <img src="/app-store-badge.svg" alt="App Store" className="h-12" />
            </a>
            <a href="#" className="inline-block">
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
            <button className="rounded-md px-4 py-2 border" type="submit">Notificarme</button>
          </form>
        </div>

        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <img 
            src="/og-image.png" 
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
        ].map((f) => (
          <div key={f.t} className="rounded-xl border p-5 bg-white">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.d}</p>
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