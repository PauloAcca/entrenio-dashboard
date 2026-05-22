"use client";
import { buildQrUrl, QrConfig } from "@/lib/utils/qrGenerator";
import { ExternalLink, ScanQrCode, ChevronDown, Dumbbell } from "lucide-react";

interface QrPreviewCardProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
  machineName: string;
  qrCode: string | null;
  config: QrConfig;
  gymName?: string;
  gymLogoUrl?: string | null;
}

export default function QrPreviewCard({
  previewRef,
  machineName,
  qrCode,
  config,
  gymName,
  gymLogoUrl,
}: QrPreviewCardProps) {
  const url = qrCode ? buildQrUrl(qrCode) : null;
  const isPosterMode = config.exportMode === "poster";
  const activeGymLogo = config.logo ?? gymLogoUrl;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-card">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <ScanQrCode className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Vista Previa</span>
        {machineName && (
          <span className="text-sm text-muted-foreground truncate">
            — {machineName} ({isPosterMode ? "Póster" : "Solo QR"})
          </span>
        )}
      </div>

      {/* QR canvas area */}
      <div className="flex flex-col items-center justify-center p-6 min-h-[380px] bg-muted/20">
        {qrCode ? (
          <>
            {isPosterMode ? (
              /* PREMIUM POSTER VIEW */
              <div
                className="w-full max-w-[420px] aspect-[2/3] rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 relative select-none"
                style={{
                  backgroundColor: config.posterBgColor,
                  color: config.posterTextColor,
                }}
              >
                {/* Header text */}
                <div className="text-center space-y-1">
                  <span className="text-[10px] tracking-[0.25em] font-extrabold uppercase opacity-85 block">
                    Máquina:
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-wide leading-tight truncate px-2">
                    {machineName || "Nombre de Máquina"}
                  </h3>
                  <span className="text-[9px] tracking-widest font-bold uppercase opacity-75 block pt-0.5">
                    Info & Variaciones
                  </span>
                  <ChevronDown className="w-4 h-4 mx-auto opacity-75 animate-bounce mt-0.5" />
                </div>

                {/* QR Code Container with Brackets */}
                <div className="flex flex-col items-center my-3">
                  <span className="text-[9px] font-bold tracking-widest uppercase opacity-85 mb-2.5">
                    Escaneá aquí para más info
                  </span>

                  {/* The card brackets */}
                  <div className="relative p-2.5">
                    {/* Brackets */}
                    <div
                      className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] rounded-tl"
                      style={{ borderColor: config.posterTextColor }}
                    />
                    <div
                      className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] rounded-tr"
                      style={{ borderColor: config.posterTextColor }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] rounded-bl"
                      style={{ borderColor: config.posterTextColor }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] rounded-br"
                      style={{ borderColor: config.posterTextColor }}
                    />

                    {/* QR Code Frame */}
                    <div className="rounded-xl overflow-hidden bg-white p-2.5 shadow-md flex items-center justify-center w-[170px] h-[170px] sm:w-[200px] sm:h-[200px]">
                      <div
                        ref={previewRef}
                        className="w-full h-full [&_canvas]:!w-full [&_canvas]:!h-full [&_svg]:!w-full [&_svg]:!h-full"
                      />
                    </div>
                  </div>

                  <span className="text-[9px] font-bold tracking-widest uppercase opacity-85 mt-2.5">
                    Descubre alternativas
                  </span>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                  {activeGymLogo ? (
                    /* CASE A: Gym Logo & Entrenio Right-aligned */
                    <>
                      <div className="flex items-center gap-2 max-w-[55%]">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                          {activeGymLogo ? (
                            <img
                              src={activeGymLogo}
                              alt="Gym Logo"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Dumbbell className="w-4 h-4 text-zinc-800" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider truncate leading-tight">
                            {gymName || "Mi Gimnasio"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 max-w-[45%] text-left">
                        <img
                          src="/entrenio-logo.png"
                          alt="Entrenio Logo"
                          className="w-8 h-8 rounded-lg shrink-0 object-cover shadow-sm bg-black"
                        />
                        <div className="min-w-0">
                          <p className="text-[7px] font-semibold opacity-70 leading-none">
                            Powered by
                          </p>
                          <p className="text-[11px] font-black uppercase tracking-wider leading-none my-0.5">
                            ENTRENIO
                          </p>
                          <p className="text-[7px] font-semibold opacity-70 leading-none">
                            Descarga la App
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* CASE B: Centered Entrenio only */
                    <div className="flex items-center justify-center gap-2.5 w-full">
                      <img
                        src="/entrenio-logo.png"
                        alt="Entrenio Logo"
                        className="w-8 h-8 rounded-lg shrink-0 object-cover shadow-sm bg-black"
                      />
                      <div className="text-left">
                        <p className="text-[7px] font-semibold opacity-70 leading-none">
                          Powered by
                        </p>
                        <p className="text-[11px] font-black uppercase tracking-wider leading-none my-0.5">
                          ENTRENIO
                        </p>
                        <p className="text-[7px] font-semibold opacity-70 leading-none">
                          Descarga la App
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* STANDARD QR ONLY PREVIEW */
              <>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-border/40 p-4 bg-white">
                  <div
                    ref={previewRef}
                    className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] [&_canvas]:!w-full [&_canvas]:!h-full [&_svg]:!w-full [&_svg]:!h-full"
                  />
                </div>
                <p className="mt-4 text-sm font-bold text-foreground text-center">
                  {machineName}
                </p>
              </>
            )}

            {/* URL Display */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group px-3 py-1.5 rounded-lg bg-card/50 border border-border/30 hover:border-primary/20"
              >
                <span className="font-mono truncate max-w-[240px] sm:max-w-[320px]">
                  {url}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
              <ScanQrCode className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sin máquina seleccionada
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Seleccioná una máquina para ver el preview del QR
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
