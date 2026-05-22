"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  QrConfig,
  DEFAULT_QR_CONFIG,
  buildQrUrl,
  createQrInstance,
  generateQrBlob,
  generateQrZip,
} from "@/lib/utils/qrGenerator";
import { generatePosterCanvas } from "@/lib/utils/posterGenerator";
import { useAuthStore } from "@/store/authStore";
import { saveAs } from "file-saver";

export function useQrGenerator() {
  const [config, setConfig] = useState<QrConfig>(DEFAULT_QR_CONFIG);
  const [previewMachineQrCode, setPreviewMachineQrCode] = useState<string | null>(null);
  const [previewMachineName, setPreviewMachineName] = useState<string>("");
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  // Retrieve current gym branding from Zustand store
  const gym = useAuthStore((state) => state.gym);
  const gymName = gym?.name ?? "Mi Gimnasio";
  const gymLogoUrl = gym?.logo_url ?? null;

  // Build or update the QR preview
  useEffect(() => {
    if (!previewMachineQrCode || !previewRef.current) return;

    const url = buildQrUrl(previewMachineQrCode);
    const previewConfig: QrConfig = { ...config, size: 300 };

    if (!qrInstanceRef.current) {
      const qr = createQrInstance(url, previewConfig);
      qrInstanceRef.current = qr;
      // Clear previous and append
      previewRef.current.innerHTML = "";
      qr.append(previewRef.current);
    } else {
      qrInstanceRef.current.update({
        data: url,
        width: 300,
        height: 300,
        margin: 12,
        qrOptions: { errorCorrectionLevel: previewConfig.errorCorrectionLevel },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 6,
          imageSize: previewConfig.logo ? previewConfig.logoSize : 0,
        },
        dotsOptions: {
          color: previewConfig.dotsColor,
          type: previewConfig.dotsType,
        },
        backgroundOptions: { color: previewConfig.backgroundColor },
        cornersSquareOptions: {
          color: previewConfig.dotsColor,
          type: previewConfig.cornersSquareType,
        },
        cornersDotOptions: {
          color: previewConfig.dotsColor,
          type: previewConfig.cornersDotType,
        },
        image: previewConfig.logo ?? undefined,
      });
    }
  }, [config, previewMachineQrCode]);

  // Reset QR instance when preview machine changes so it gets re-appended
  const setPreviewing = useCallback((qrCode: string, name: string) => {
    qrInstanceRef.current = null;
    setPreviewMachineQrCode(qrCode);
    setPreviewMachineName(name);
  }, []);

  const clearPreview = useCallback(() => {
    qrInstanceRef.current = null;
    setPreviewMachineQrCode(null);
    setPreviewMachineName("");
    if (previewRef.current) previewRef.current.innerHTML = "";
  }, []);

  const updateConfig = useCallback(<K extends keyof QrConfig>(key: K, value: QrConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const downloadSingle = useCallback(
    async (qrCode: string, machineName: string, format: "svg" | "png") => {
      setIsDownloading(true);
      try {
        const safeName = machineName.replace(/[^a-zA-Z0-9_-]/g, "_");
        
        if (config.exportMode === "poster") {
          // Poster Mode: Draw high-res canvas poster and save as PNG
          const qrBlob = await generateQrBlob(qrCode, config, "png");
          const qrBlobUrl = URL.createObjectURL(qrBlob);
          
          try {
            const canvas = await generatePosterCanvas(
              machineName,
              qrBlobUrl,
              config,
              gymName,
              gymLogoUrl
            );

            const posterBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas toBlob failed"));
              }, "image/png");
            });

            saveAs(posterBlob, `POSTER_${safeName}_${qrCode}.png`);
          } finally {
            URL.revokeObjectURL(qrBlobUrl);
          }
        } else {
          // Standard QR Mode: Download SVG/PNG of QR code
          const blob = await generateQrBlob(qrCode, config, format);
          saveAs(blob, `QR_${safeName}_${qrCode}.${format}`);
        }
      } catch (err) {
        console.error("Failed to download file:", err);
      } finally {
        setIsDownloading(false);
      }
    },
    [config, gymName, gymLogoUrl]
  );

  const downloadZip = useCallback(
    async (
      machines: { name: string; qrCode: string }[],
      format: "svg" | "png"
    ) => {
      setIsGeneratingZip(true);
      try {
        if (config.exportMode === "poster") {
          // Poster Mode Bulk: Generate posters and zip them
          const JSZip = (await import("jszip")).default;
          const zip = new JSZip();

          await Promise.all(
            machines.map(async (machine) => {
              try {
                const qrBlob = await generateQrBlob(machine.qrCode, config, "png");
                const qrBlobUrl = URL.createObjectURL(qrBlob);

                try {
                  const canvas = await generatePosterCanvas(
                    machine.name,
                    qrBlobUrl,
                    config,
                    gymName,
                    gymLogoUrl
                  );

                  const posterBlob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), "image/png");
                  });

                  const safeName = machine.name.replace(/[^a-zA-Z0-9_-]/g, "_");
                  zip.file(`POSTER_${safeName}_${machine.qrCode}.png`, posterBlob);
                } finally {
                  URL.revokeObjectURL(qrBlobUrl);
                }
              } catch (err) {
                console.error(`Failed to generate poster for ${machine.name}:`, err);
              }
            })
          );

          const zipBlob = await zip.generateAsync({ type: "blob" });
          saveAs(zipBlob, `Posters_Maquinas_${Date.now()}.zip`);
        } else {
          // Standard QR Mode Bulk: ZIP of QRs
          const blob = await generateQrZip(machines, config, format);
          saveAs(blob, `QR_Maquinas_${Date.now()}.zip`);
        }
      } catch (err) {
        console.error("Failed to generate zip file:", err);
      } finally {
        setIsGeneratingZip(false);
      }
    },
    [config, gymName, gymLogoUrl]
  );

  return {
    config,
    updateConfig,
    setConfig,
    previewRef,
    previewMachineQrCode,
    previewMachineName,
    setPreviewing,
    clearPreview,
    isGeneratingZip,
    isDownloading,
    downloadSingle,
    downloadZip,
  };
}
