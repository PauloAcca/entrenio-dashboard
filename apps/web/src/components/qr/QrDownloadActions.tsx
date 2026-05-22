"use client";
import {
  Download,
  FolderArchive,
  ImageDown,
  Loader2,
  FileImage,
  FileText,
} from "lucide-react";
import { equipment } from "@/types/entities";
import { QrConfig } from "@/lib/utils/qrGenerator";

interface QrDownloadActionsProps {
  selectedMachines: equipment[];
  previewQrCode: string | null;
  previewMachineName: string;
  isGeneratingZip: boolean;
  isDownloading: boolean;
  onDownloadSingle: (qrCode: string, name: string, format: "svg" | "png" | "pdf") => void;
  onDownloadZip: (
    machines: { name: string; qrCode: string }[],
    format: "svg" | "png" | "pdf"
  ) => void;
  config: QrConfig;
}

function DownloadButton({
  onClick,
  disabled,
  loading,
  icon: Icon,
  label,
  sublabel,
  variant = "default",
}: {
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  sublabel?: string;
  variant?: "default" | "primary";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left w-full ${
        variant === "primary"
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 disabled:opacity-50"
          : "bg-card text-foreground border-border hover:bg-muted/50 disabled:opacity-40"
      } ${disabled || loading ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
      ) : (
        <Icon className="w-5 h-5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {sublabel && (
          <p
            className={`text-xs leading-tight mt-0.5 ${
              variant === "primary" ? "opacity-75" : "text-muted-foreground"
            }`}
          >
            {sublabel}
          </p>
        )}
      </div>
    </button>
  );
}

export default function QrDownloadActions({
  selectedMachines,
  previewQrCode,
  previewMachineName,
  isGeneratingZip,
  isDownloading,
  onDownloadSingle,
  onDownloadZip,
  config,
}: QrDownloadActionsProps) {
  const validMachines = selectedMachines.filter(
    (m) => m.machine_template?.qrCode
  );
  const hasSelection = validMachines.length > 0;
  const hasSingle = previewQrCode !== null;
  const isMulti = validMachines.length > 1;

  const machineList = validMachines.map((m) => ({
    name: m.machine_template!.name,
    qrCode: m.machine_template!.qrCode,
  }));

  const isPosterMode = config.exportMode === "poster";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm">Descargar</span>
        {hasSelection && (
          <span className="text-xs text-muted-foreground ml-auto">
            {validMachines.length} {isPosterMode ? "Póster" : "QR"}
            {validMachines.length !== 1 ? "s" : ""} listo
            {validMachines.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Individual downloads — from preview */}
        {hasSingle && (
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              Individual — {previewMachineName || "máquina seleccionada"}
            </p>
            {isPosterMode ? (
              <div className="space-y-2">
                <DownloadButton
                  onClick={() =>
                    onDownloadSingle(previewQrCode!, previewMachineName, "png")
                  }
                  disabled={!hasSingle}
                  loading={isDownloading}
                  icon={FileImage}
                  label="Descargar Póster (PNG)"
                  sublabel="Imagen premium en alta resolución"
                  variant="primary"
                />
                <div className="grid grid-cols-2 gap-2">
                  <DownloadButton
                    onClick={() =>
                      onDownloadSingle(previewQrCode!, previewMachineName, "pdf")
                    }
                    disabled={!hasSingle}
                    loading={isDownloading}
                    icon={FileText}
                    label="Descargar PDF"
                    sublabel="A4 listo para imprenta"
                  />
                  <DownloadButton
                    onClick={() =>
                      onDownloadSingle(previewQrCode!, previewMachineName, "svg")
                    }
                    disabled={!hasSingle}
                    loading={isDownloading}
                    icon={ImageDown}
                    label="Descargar SVG"
                    sublabel="Vectorial escalable"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <DownloadButton
                  onClick={() =>
                    onDownloadSingle(previewQrCode!, previewMachineName, "svg")
                  }
                  disabled={!hasSingle}
                  loading={isDownloading}
                  icon={ImageDown}
                  label="Descargar SVG"
                  sublabel="Vectorial, ideal para imprenta"
                  variant="primary"
                />
                <DownloadButton
                  onClick={() =>
                    onDownloadSingle(previewQrCode!, previewMachineName, "png")
                  }
                  disabled={!hasSingle}
                  loading={isDownloading}
                  icon={FileImage}
                  label="Descargar PNG"
                  sublabel="Imagen estándar"
                />
              </div>
            )}
          </div>
        )}

        {/* ZIP downloads — bulk */}
        {hasSelection && (
          <div>
            {hasSingle && (
              <div className="border-t border-border/50 my-3" />
            )}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              {isMulti ? `Pack masivo — ${validMachines.length} máquinas` : "Descarga"}
            </p>
            {isPosterMode ? (
              <div className="space-y-2">
                <DownloadButton
                  onClick={() => onDownloadZip(machineList, "png")}
                  disabled={!hasSelection}
                  loading={isGeneratingZip}
                  icon={FolderArchive}
                  label="Descargar Pack ZIP (PNG)"
                  sublabel={`${validMachines.length} pósters compilados`}
                  variant={!hasSingle ? "primary" : "default"}
                />
                <div className="grid grid-cols-2 gap-2">
                  <DownloadButton
                    onClick={() => onDownloadZip(machineList, "pdf")}
                    disabled={!hasSelection}
                    loading={isGeneratingZip}
                    icon={FolderArchive}
                    label="ZIP — PDF"
                    sublabel="Formato imprimible"
                  />
                  <DownloadButton
                    onClick={() => onDownloadZip(machineList, "svg")}
                    disabled={!hasSelection}
                    loading={isGeneratingZip}
                    icon={FolderArchive}
                    label="ZIP — SVG"
                    sublabel="Formato vectorial"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <DownloadButton
                  onClick={() => onDownloadZip(machineList, "svg")}
                  disabled={!hasSelection}
                  loading={isGeneratingZip}
                  icon={FolderArchive}
                  label={isMulti ? "ZIP — SVG" : "SVG individual"}
                  sublabel={isMulti ? `${validMachines.length} archivos` : "Vectorial"}
                  variant={!hasSingle ? "primary" : "default"}
                />
                <DownloadButton
                  onClick={() => onDownloadZip(machineList, "png")}
                  disabled={!hasSelection}
                  loading={isGeneratingZip}
                  icon={FolderArchive}
                  label={isMulti ? "ZIP — PNG" : "PNG individual"}
                  sublabel={isMulti ? `${validMachines.length} archivos` : "Imagen"}
                />
              </div>
            )}
          </div>
        )}

        {!hasSingle && !hasSelection && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Seleccioná máquinas para habilitar la descarga
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
