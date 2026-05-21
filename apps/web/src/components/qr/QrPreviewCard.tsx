"use client";
import { buildQrUrl } from "@/lib/utils/qrGenerator";
import { ExternalLink, ScanQrCode } from "lucide-react";

interface QrPreviewCardProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
  machineName: string;
  qrCode: string | null;
}

export default function QrPreviewCard({
  previewRef,
  machineName,
  qrCode,
}: QrPreviewCardProps) {
  const url = qrCode ? buildQrUrl(qrCode) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <ScanQrCode className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Preview</span>
        {machineName && (
          <span className="text-sm text-muted-foreground truncate">
            — {machineName}
          </span>
        )}
      </div>

      {/* QR canvas area */}
      <div className="flex flex-col items-center justify-center p-8 min-h-[340px]">
        {qrCode ? (
          <>
            {/* QR rendered here by qr-code-styling via ref */}
            <div
              ref={previewRef}
              className="rounded-xl overflow-hidden shadow-lg border border-border/30"
              style={{ width: 300, height: 300 }}
            />
            {/* Machine name */}
            <p className="mt-4 text-sm font-semibold text-foreground text-center">
              {machineName}
            </p>
            {/* URL */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="font-mono truncate max-w-[260px]">{url}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
