export default function Home() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-center">
        <div className="text-xl font-semibold">Entrenio</div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
        
        <div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Solicitá la eliminación de tu cuenta
          </h1>
          <p>Podés eliminar tu cuenta directo desde la app, en la sección de ajustes - Borrar cuenta.</p>

          <p className="mt-4 text-lg text-slate-600">
            Si querés que nosotros la eliminemos, enviá un correo a 
            <a href="mailto:contacto@entrenio.com?subject=Eliminar cuenta Entrenio">
                contacto@entrenio.com
            </a>
            desde la misma dirección que usaste para registrarte.
          </p>

          <p>Tu solicitud será procesada en un plazo máximo de 7 días hábiles.</p>
    
        </div>
      </section>

      <footer id="contacto" className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="flex gap-4">
          <a className="hover:underline" href="/privacy.html">Privacidad y legales</a>
          <a className="hover:underline" href="/terms.html">Términos y condiciones</a>
          <a className="hover:underline" href="mailto:contacto@entrenio.com">contacto@entrenio.com</a>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} Entrenio</p>
      </footer>
    </main>
  );
}