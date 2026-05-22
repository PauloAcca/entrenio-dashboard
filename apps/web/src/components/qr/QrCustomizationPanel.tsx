"use client";
import { QrConfig } from "@/lib/utils/qrGenerator";
import { Sliders, Palette, ImageIcon, Shapes, X, Building2 } from "lucide-react";
import { useRef, useState } from "react";
import { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from "qr-code-styling";

interface QrCustomizationPanelProps {
  config: QrConfig;
  gymLogoUrl?: string | null;
  onConfigChange: <K extends keyof QrConfig>(key: K, value: QrConfig[K]) => void;
}

const DOT_TYPE_OPTIONS: { value: DotType; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "dots", label: "Puntos" },
  { value: "rounded", label: "Redondeado" },
  { value: "extra-rounded", label: "Muy redondeado" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy redondeado" },
];

const CORNER_SQUARE_OPTIONS: { value: CornerSquareType; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "dot", label: "Círculo" },
  { value: "extra-rounded", label: "Redondeado" },
];

const CORNER_DOT_OPTIONS: { value: CornerDotType; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "dot", label: "Círculo" },
];

const ERROR_CORRECTION_OPTIONS: { value: ErrorCorrectionLevel; label: string; description: string }[] = [
  { value: "L", label: "L", description: "Bajo (7%)" },
  { value: "M", label: "M", description: "Medio (15%)" },
  { value: "Q", label: "Q", description: "Alto (25%)" },
  { value: "H", label: "H", description: "Máximo (30%)" },
];

function SectionTitle({ icon: Icon, label }: { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
        />
        <span className="text-xs font-mono text-muted-foreground w-16">
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default function QrCustomizationPanel({
  config,
  gymLogoUrl,
  onConfigChange,
}: QrCustomizationPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      onConfigChange("logo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoPreview(null);
    onConfigChange("logo", null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const useGymLogo = () => {
    if (!gymLogoUrl) return;
    setLogoPreview(gymLogoUrl);
    onConfigChange("logo", gymLogoUrl);
  };

  const activeLogo = logoPreview ?? config.logo;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sliders className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Personalización</span>
      </div>

      {/* Export mode tabs */}
      <div className="p-4 pb-0">
        <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-widest">
          Modo de Exportación
        </label>
        <div className="grid grid-cols-2 gap-1 bg-muted/65 p-1 rounded-xl">
          <button
            onClick={() => onConfigChange("exportMode", "qr")}
            className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              config.exportMode === "qr"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Solo Código QR
          </button>
          <button
            onClick={() => onConfigChange("exportMode", "poster")}
            className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              config.exportMode === "poster"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Póster de Máquina
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Colors */}
        <div>
          <SectionTitle icon={Palette} label="Colores" />
          <div className="space-y-3">
            <ColorInput
              label="Color del QR"
              value={config.dotsColor}
              onChange={(v) => onConfigChange("dotsColor", v)}
            />
            <ColorInput
              label="Color de fondo"
              value={config.backgroundColor}
              onChange={(v) => onConfigChange("backgroundColor", v)}
            />
            {config.exportMode === "poster" && (
              <>
                <div className="border-t border-border/50 my-2 pt-2" />
                <ColorInput
                  label="Fondo del Póster"
                  value={config.posterBgColor}
                  onChange={(v) => onConfigChange("posterBgColor", v)}
                />
                <ColorInput
                  label="Texto del Póster"
                  value={config.posterTextColor}
                  onChange={(v) => onConfigChange("posterTextColor", v)}
                />
              </>
            )}
          </div>
        </div>

        {/* Shapes */}
        <div>
          <SectionTitle icon={Shapes} label="Formas" />
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Estilo de puntos
              </label>
              <select
                value={config.dotsType}
                onChange={(e) =>
                  onConfigChange("dotsType", e.target.value as DotType)
                }
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              >
                {DOT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Esquina exterior
              </label>
              <select
                value={config.cornersSquareType}
                onChange={(e) =>
                  onConfigChange(
                    "cornersSquareType",
                    e.target.value as CornerSquareType
                  )
                }
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              >
                {CORNER_SQUARE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Punto interior de esquina
              </label>
              <select
                value={config.cornersDotType}
                onChange={(e) =>
                  onConfigChange(
                    "cornersDotType",
                    e.target.value as CornerDotType
                  )
                }
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              >
                {CORNER_DOT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div>
          <SectionTitle icon={ImageIcon} label="Logo en QR" />
          {activeLogo ? (
            <div className="space-y-3">
              <div className="relative flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <img
                  src={activeLogo}
                  alt="Logo"
                  className="w-10 h-10 object-contain rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Logo activo</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeLogo.startsWith("data:") ? "Imagen subida" : activeLogo}
                  </p>
                </div>
                <button
                  onClick={clearLogo}
                  className="shrink-0 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Toggle to show/hide logo in QR code */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showQrLogo"
                  checked={config.showQrLogo ?? true}
                  onChange={(e) => onConfigChange("showQrLogo", e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
                />
                <label htmlFor="showQrLogo" className="text-sm font-medium text-foreground cursor-pointer select-none">
                  Mostrar logo dentro del QR
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                Subir logo (PNG, SVG, JPG)
              </button>
              {gymLogoUrl && (
                <button
                  onClick={useGymLogo}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Usar logo del gimnasio
                </button>
              )}
            </div>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        {/* Poster Branding */}
        {config.exportMode === "poster" && (
          <div>
            <SectionTitle icon={Building2} label="Identidad del Gimnasio" />
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showGymName"
                  checked={config.showGymName ?? true}
                  onChange={(e) => onConfigChange("showGymName", e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
                />
                <label htmlFor="showGymName" className="text-sm font-medium text-foreground cursor-pointer select-none">
                  Mostrar nombre del gimnasio
                </label>
              </div>

              {(config.showGymName ?? true) && (
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground block font-medium">
                    Nombre personalizado
                  </label>
                  <input
                    type="text"
                    value={config.customGymName ?? ""}
                    placeholder="Escribe un nombre..."
                    onChange={(e) => onConfigChange("customGymName", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-muted/50 border border-input rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error correction */}
        <div>
          <SectionTitle icon={Sliders} label="Corrección de errores" />
          <div className="grid grid-cols-4 gap-1.5">
            {ERROR_CORRECTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  onConfigChange("errorCorrectionLevel", opt.value)
                }
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-center transition-all ${
                  config.errorCorrectionLevel === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-sm font-bold">{opt.label}</span>
                <span className="text-[10px] leading-tight">{opt.description}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Nivel H recomendado para uso con logo en gimnasios.
          </p>
        </div>
      </div>
    </div>
  );
}
