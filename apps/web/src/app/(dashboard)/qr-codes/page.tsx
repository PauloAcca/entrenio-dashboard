"use client";
import { useEffect, useState, useMemo } from "react";
import { getGymMachines } from "@/lib/api/machines";
import { equipment } from "@/types/entities";
import { useAuthStore } from "@/store/authStore";
import { useQrGenerator } from "@/hooks/useQrGenerator";
import MachineSelector from "@/components/qr/MachineSelector";
import QrCustomizationPanel from "@/components/qr/QrCustomizationPanel";
import QrPreviewCard from "@/components/qr/QrPreviewCard";
import QrDownloadActions from "@/components/qr/QrDownloadActions";
import { PremiumPoster } from "@/components/qr/PremiumPoster";
import { AlertCircle, QrCode, Wifi } from "lucide-react";

export default function QrCodesPage() {
  const gym = useAuthStore((state) => state.gym);

  const [machines, setMachines] = useState<equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const {
    config,
    updateConfig,
    previewRef,
    printRef,
    previewMachineQrCode,
    previewMachineName,
    setPreviewing,
    clearPreview,
    isGeneratingZip,
    isDownloading,
    downloadSingle,
    downloadZip,
  } = useQrGenerator();

  // Fetch gym machines
  useEffect(() => {
    setLoading(true);
    setError(null);
    getGymMachines()
      .then((data) => {
        const list: equipment[] = Array.isArray(data)
          ? data
          : (data as { machines: equipment[] }).machines ?? [];
        setMachines(list);
        // Auto-select & preview the first machine that has a qrCode
        const first = list.find((m) => m.machine_template?.qrCode);
        if (first?.machine_template?.qrCode) {
          setSelectedIds(new Set([first.machineTemplateId]));
          setPreviewing(first.machine_template.qrCode, first.machine_template.name);
        }
      })
      .catch(() => setError("No se pudieron cargar las máquinas. Intentá de nuevo."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Machines with QR code
  const eligibleMachines = useMemo(
    () => machines.filter((m) => m.machine_template?.qrCode),
    [machines]
  );

  // Selected machines for download
  const selectedMachines = useMemo(
    () => machines.filter((m) => selectedIds.has(m.machineTemplateId)),
    [machines, selectedIds]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Códigos QR</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Generá, personalizá y descargá los códigos QR de las máquinas de{" "}
            <span className="font-medium text-foreground">{gym?.name ?? "tu gimnasio"}</span>
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground shrink-0">
          <Wifi className="w-3.5 h-3.5" />
          <span>
            {eligibleMachines.length} máquina
            {eligibleMachines.length !== 1 ? "s" : ""} con QR
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* No machines with QR */}
      {!error && eligibleMachines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">
            Sin máquinas con código QR
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Las máquinas de tu gimnasio aún no tienen códigos QR asignados. Contactá al equipo de Entrenio para activarlos.
          </p>
        </div>
      )}

      {/* Main layout */}
      {!error && eligibleMachines.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-6">
          {/* Left column — controls */}
          <div className="space-y-4">
            <MachineSelector
              machines={machines}
              selectedIds={selectedIds}
              onSelectionChange={(ids) => {
                setSelectedIds(ids);
                // If we just deselected the currently previewed machine, clear preview
                if (previewMachineQrCode) {
                  const previewMachine = machines.find(
                    (m) => m.machine_template?.qrCode === previewMachineQrCode
                  );
                  if (previewMachine && !ids.has(previewMachine.machineTemplateId)) {
                    // Find another selected one to preview
                    const nextId = [...ids][0];
                    if (nextId) {
                      const next = machines.find(
                        (m) => m.machineTemplateId === nextId
                      );
                      if (next?.machine_template?.qrCode) {
                        setPreviewing(
                          next.machine_template.qrCode,
                          next.machine_template.name
                        );
                      }
                    } else {
                      clearPreview();
                    }
                  }
                }
              }}
              previewMachineQrCode={previewMachineQrCode}
              onPreviewChange={(qrCode, name) => setPreviewing(qrCode, name)}
            />

            <QrCustomizationPanel
              config={config}
              gymLogoUrl={gym?.logo_url}
              onConfigChange={updateConfig}
            />
          </div>

          {/* Right column — preview + download */}
          <div className="space-y-4">
            <QrPreviewCard
              previewRef={previewRef}
              printRef={printRef}
              machineName={previewMachineName}
              qrCode={previewMachineQrCode}
              config={config}
              gymName={gym?.name}
              gymLogoUrl={gym?.logo_url}
            />

            <QrDownloadActions
              selectedMachines={selectedMachines}
              previewQrCode={previewMachineQrCode}
              previewMachineName={previewMachineName}
              isGeneratingZip={isGeneratingZip}
              isDownloading={isDownloading}
              onDownloadSingle={downloadSingle}
              onDownloadZip={downloadZip}
              config={config}
            />
          </div>
        </div>
      )}

      {/* Batch rendering for zip downloads */}
      {config.exportMode === "poster" && eligibleMachines.length > 0 && (
        <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none select-none overflow-hidden" aria-hidden="true">
          {eligibleMachines.map((m) => (
            <div key={m.machineTemplateId} id={`poster-print-${m.machine_template?.qrCode}`}>
              <PremiumPoster
                mode="print"
                machineName={m.machine_template!.name}
                qrCode={m.machine_template!.qrCode}
                config={config}
                gymName={gym?.name}
                gymLogoUrl={gym?.logo_url}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
