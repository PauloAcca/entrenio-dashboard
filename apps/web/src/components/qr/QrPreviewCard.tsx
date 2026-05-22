"use client";
import React from "react";
import { buildQrUrl, QrConfig } from "@/lib/utils/qrGenerator";
import { ExternalLink, ScanQrCode } from "lucide-react";
import { PremiumPoster } from "@/components/qr/PremiumPoster";

interface QrPreviewCardProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
  printRef: React.RefObject<HTMLDivElement | null>;
  machineName: string;
  qrCode: string | null;
  config: QrConfig;
  gymName?: string;
  gymLogoUrl?: string | null;
}

export default function QrPreviewCard({
  previewRef,
  printRef,
  machineName,
  qrCode,
  config,
  gymName,
  gymLogoUrl,
}: QrPreviewCardProps) {
  const url = qrCode ? buildQrUrl(qrCode) : null;
  const isPosterMode = config.exportMode === "poster";

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
              <>
                <PremiumPoster
                  mode="preview"
                  machineName={machineName}
                  qrCode={qrCode}
                  config={config}
                  gymName={gymName}
                  gymLogoUrl={gymLogoUrl}
                />

                {/* Offscreen high-res poster container for clean DOM capturing */}
                <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none select-none overflow-hidden">
                  <PremiumPoster
                    mode="print"
                    ref={printRef}
                    machineName={machineName}
                    qrCode={qrCode}
                    config={config}
                    gymName={gymName}
                    gymLogoUrl={gymLogoUrl}
                  />
                </div>
              </>
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
