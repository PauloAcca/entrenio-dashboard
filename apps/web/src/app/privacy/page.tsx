export const metadata = {
  title: "Privacidad y legales — Entrenio",
  description: "Política de privacidad y términos de servicio.",
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <div className="text-xl font-semibold"><a href="/">Entrenio</a></div>
        <nav className="flex items-center gap-6 text-sm">
          <a className="hover:underline" href="/privacy">Privacidad y legales</a>
          <a className="hover:underline" href="#contacto">Contacto</a>
        </nav>
      </header>
      <h1>Política de Privacidad</h1>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString("es-AR")}</p>
      <p><strong>Entrenio</strong> (“la App”) procesa datos para poder ofrecer sus funciones.</p>

      <h2>Datos que tratamos</h2>
      <ul>
        <li><strong>Cuenta:</strong> correo, nombre (si lo proveés).</li>
        <li><strong>Salud/fitness:</strong> peso, altura, edad, objetivo, comidas registradas y fotos.</li>
        <li><strong>Técnicos:</strong> dispositivo, sistema operativo, identificadores anónimos.</li>
      </ul>

      <h2>Finalidades</h2>
      <ul>
        <li>Calcular objetivos calóricos y mostrar progreso.</li>
        <li>Estimar calorías y macronutrientes desde fotos mediante modelos de IA.</li>
        <li>Mejoras agregadas/anónimas y prevención de abuso.</li>
      </ul>

      <h2>Bases legales (GDPR)</h2>
      <ul>
        <li>Ejecución del contrato.</li>
        <li>Interés legítimo (mejoras y seguridad).</li>
        <li>Consentimiento cuando se requiera (p. ej., análisis de imágenes).</li>
      </ul>

      <h2>Conservación</h2>
      <p>Conservamos los datos mientras mantengas tu cuenta o según exija la ley.</p>

      <h2>Terceros</h2>
      <ul>
        <li>Hosting y base de datos.</li>
        <li>Analítica sin identificación (si se habilita).</li>
        <li>Proveedores de inferencia de IA.</li>
      </ul>

      <h2>Tus derechos</h2>
      <p>Escribí a <a href="mailto:contacto@entrenio.com">contacto@entrenio.com</a> para acceso, rectificación, eliminación y portabilidad.</p>

      <hr />

      <h1>Términos de Servicio (resumen)</h1>
      <h2>No asesoramiento médico</h2>
      <p>La App no reemplaza consejo profesional.</p>

      <h2>Cuenta y seguridad</h2>
      <p>Mantené tus credenciales seguras. Podemos suspender cuentas por uso indebido.</p>

      <h2>Contenido del usuario</h2>
      <p>Las fotos se procesan para brindar la funcionalidad. No subas contenido ilegal u ofensivo.</p>

      <h2>Pagos y suscripciones</h2>
      <p>Si se habilitan, se gestionan por App Store/Google Play con sus términos.</p>

      <h2>Limitación de responsabilidad</h2>
      <p>La App se ofrece “tal cual”. En lo permitido por ley, sin responsabilidad por daños indirectos.</p>

      <h2>Cambios</h2>
      <p>Podemos actualizar estos textos, indicando fecha de última actualización.</p>

      <h2>Contacto legal</h2>
      <p><a href="mailto:contacto@entrenio.com">contacto@entrenio.com</a></p>
    </main>
  );
}