export const metadata = {
  title: "Términos y Condiciones — Entrenio",
  description: "Condiciones de uso de la aplicación Entrenio.",
};

export default function Terms() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Términos y Condiciones</h1>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString("es-AR")}</p>

      <h2>1. Aceptación</h2>
      <p>Al descargar o usar Entrenio (“la App”), aceptás estos términos. Si no estás de acuerdo, no uses la App.</p>

      <h2>2. Uso permitido</h2>
      <p>La App está destinada a mayores de 13 años. Debés usarla solo con fines personales y lícitos.</p>

      <h2>3. No asesoramiento médico</h2>
      <p>La App ofrece información de bienestar general y no reemplaza la consulta profesional médica o nutricional.</p>

      <h2>4. Propiedad intelectual</h2>
      <p>Entrenio, su logotipo, contenidos y algoritmos son propiedad exclusiva de sus desarrolladores.</p>

      <h2>5. Cuentas y seguridad</h2>
      <p>Sos responsable de mantener la confidencialidad de tus credenciales. Podemos suspender cuentas por uso indebido.</p>

      <h2>6. Pagos y suscripciones</h2>
      <p>Las compras se gestionan a través de App Store o Google Play, conforme a sus propias condiciones.</p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>Entrenio se ofrece “tal cual”. No garantizamos exactitud de resultados ni respondemos por daños indirectos.</p>

      <h2>8. Cambios</h2>
      <p>Podemos actualizar estos términos en cualquier momento. Publicaremos la fecha de la última modificación.</p>

      <h2>9. Contacto</h2>
      <p>Consultas legales: <a href="mailto:contacto@entrenio.com">contacto@entrenio.com</a></p>
    </main>
  );
}