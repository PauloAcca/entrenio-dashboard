"use client";
import { equipment } from "@/types/entities";
import { CheckSquare2, Square, Search, QrCode, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

interface MachineSelectorProps {
  machines: equipment[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  previewMachineQrCode: string | null;
  onPreviewChange: (qrCode: string, name: string) => void;
}

export default function MachineSelector({
  machines,
  selectedIds,
  onSelectionChange,
  previewMachineQrCode,
  onPreviewChange,
}: MachineSelectorProps) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Only show machines that have a qrCode defined
  const eligibleMachines = useMemo(
    () => machines.filter((m) => m.machine_template?.qrCode),
    [machines]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return eligibleMachines.filter(
      (m) =>
        m.machine_template?.name?.toLowerCase().includes(term) ||
        m.machine_template?.qrCode?.toLowerCase().includes(term)
    );
  }, [eligibleMachines, search]);

  const allSelected =
    filtered.length > 0 &&
    filtered.every((m) => selectedIds.has(m.machineTemplateId));

  const someSelected =
    !allSelected && filtered.some((m) => selectedIds.has(m.machineTemplateId));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filtered.forEach((m) => next.delete(m.machineTemplateId));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      filtered.forEach((m) => {
        if (m.machine_template?.qrCode) next.add(m.machineTemplateId);
      });
      onSelectionChange(next);
      // Auto-preview first selected if nothing previewing
      if (!previewMachineQrCode && filtered[0]?.machine_template?.qrCode) {
        onPreviewChange(
          filtered[0].machine_template.qrCode,
          filtered[0].machine_template.name
        );
      }
    }
  };

  const toggleOne = (m: equipment) => {
    const id = m.machineTemplateId;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
    // Auto-preview the toggled machine
    if (m.machine_template?.qrCode) {
      onPreviewChange(m.machine_template.qrCode, m.machine_template.name);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground text-sm">
            Seleccionar Máquinas
          </span>
          {selectedIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
              {selectedIds.size}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar máquina..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-muted/50 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Select All */}
          {filtered.length > 0 && (
            <div className="px-3 py-2 border-b border-border">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? (
                  <CheckSquare2 className="w-4 h-4 text-primary" />
                ) : someSelected ? (
                  <div className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-primary rounded" />
                  </div>
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
                  <span className="ml-1 text-muted-foreground">
                    ({filtered.length})
                  </span>
                </span>
              </button>
            </div>
          )}

          {/* Machine List */}
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {eligibleMachines.length === 0
                  ? "No hay máquinas con código QR asignado"
                  : "Sin resultados"}
              </div>
            ) : (
              filtered.map((machine) => {
                const tmpl = machine.machine_template;
                const isSelected = selectedIds.has(machine.machineTemplateId);
                const isPreviewing =
                  previewMachineQrCode === tmpl?.qrCode;

                return (
                  <div
                    key={machine.id}
                    className={`flex items-center gap-3 px-3 py-2.5 border-b border-border/50 last:border-0 transition-colors ${
                      isPreviewing
                        ? "bg-primary/5"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleOne(machine)}
                      className="shrink-0 mt-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Info */}
                    <button
                      onClick={() => {
                        if (tmpl?.qrCode) {
                          onPreviewChange(tmpl.qrCode, tmpl.name);
                        }
                      }}
                      className="flex-1 text-left min-w-0 py-0.5"
                    >
                      <p className={`text-sm font-medium break-words whitespace-normal leading-snug ${isPreviewing ? "text-primary font-bold" : "text-foreground"}`}>
                        {tmpl?.name ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {tmpl?.qrCode}
                      </p>
                    </button>

                    {/* Preview badge */}
                    {isPreviewing && (
                      <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                        Preview
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          {eligibleMachines.length > 0 && (
            <div className="px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex justify-between">
              <span>{eligibleMachines.length} máquinas con QR</span>
              <span>{selectedIds.size} seleccionadas</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
