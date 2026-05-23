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
import { useAuthStore } from "@/store/authStore";
import { saveAs } from "file-saver";

export function useQrGenerator() {
  const [config, setConfig] = useState<QrConfig>(DEFAULT_QR_CONFIG);
  const [previewMachineQrCode, setPreviewMachineQrCode] = useState<string | null>(null);
  const [previewMachineName, setPreviewMachineName] = useState<string>("");
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  // Retrieve current gym branding from Zustand store
  const gym = useAuthStore((state) => state.gym);
  const gymName = gym?.name ?? "Mi Gimnasio";
  const gymLogoUrl = gym?.logo_url ?? null;

  const hasInitializedGym = useRef(false);

  // Initialize config with gym branding once loaded
  useEffect(() => {
    if (gym && !hasInitializedGym.current) {
      hasInitializedGym.current = true;
      setConfig((prev) => ({
        ...prev,
        customGymName: prev.customGymName || gym.name || "",
        logo: prev.logo || gym.logo_url || null,
      }));
    }
  }, [gym]);

  // Build or update the QR preview (Standard QR only)
  useEffect(() => {
    if (!previewMachineQrCode || !previewRef.current || config.exportMode === "poster") return;

    const url = buildQrUrl(previewMachineQrCode);
    const previewConfig: QrConfig = { ...config, size: 300 };
    const showLogo = previewConfig.logo && previewConfig.showQrLogo !== false;

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
          imageSize: showLogo ? previewConfig.logoSize : 0,
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
        image: showLogo ? (previewConfig.logo ?? undefined) : undefined,
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
    async (qrCode: string, machineName: string, format: "svg" | "png" | "pdf") => {
      setIsDownloading(true);
      try {
        const safeName = machineName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const imagePlaceholder = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        
        if (config.exportMode === "poster") {
          // Poster Mode: Render using html-to-image & jsPDF
          const htmlToImage = await import("html-to-image");
          const element = printRef.current;

          if (!element) {
            throw new Error("No print ref available for poster rendering");
          }

          if (format === "png") {
            const dataUrl = await htmlToImage.toPng(element, {
              pixelRatio: 2,
              cacheBust: true,
              imagePlaceholder,
            });
            saveAs(dataUrl, `POSTER_${safeName}_${qrCode}.png`);
          } else if (format === "svg") {
            const dataUrl = await htmlToImage.toSvg(element, {
              cacheBust: true,
              imagePlaceholder,
            });
            saveAs(dataUrl, `POSTER_${safeName}_${qrCode}.svg`);
          } else if (format === "pdf") {
            const { jsPDF } = await import("jspdf");
            const dataUrl = await htmlToImage.toPng(element, {
              pixelRatio: 2,
              cacheBust: true,
              imagePlaceholder,
            });
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "px",
              format: [1200, 1800],
            });
            pdf.addImage(dataUrl, "PNG", 0, 0, 1200, 1800);
            pdf.save(`POSTER_${safeName}_${qrCode}.pdf`);
          }
        } else {
          // Standard QR Mode: Download SVG/PNG of QR code
          if (format === "pdf") return;
          const blob = await generateQrBlob(qrCode, config, format);
          saveAs(blob, `QR_${safeName}_${qrCode}.${format}`);
        }
      } catch (err) {
        console.error("Failed to download file:", err);
      } finally {
        setIsDownloading(false);
      }
    },
    [config]
  );

  const downloadZip = useCallback(
    async (
      machines: { name: string; qrCode: string }[],
      format: "svg" | "png" | "pdf"
    ) => {
      setIsGeneratingZip(true);
      try {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        if (config.exportMode === "poster") {
          const htmlToImage = await import("html-to-image");
          const imagePlaceholder = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

          // Render sequentially to prevent resource allocation limits and out-of-memory crash
          for (const machine of machines) {
            try {
              const element = document.getElementById(`poster-print-${machine.qrCode}`);
              if (!element) {
                console.warn(`Poster element for ${machine.name} not found in DOM`);
                continue;
              }

              const safeName = machine.name.replace(/[^a-zA-Z0-9_-]/g, "_");

              if (format === "png") {
                const dataUrl = await htmlToImage.toPng(element, {
                  pixelRatio: 2,
                  cacheBust: true,
                  imagePlaceholder,
                });
                const base64Data = dataUrl.split("base64,")[1];
                zip.file(`POSTER_${safeName}_${machine.qrCode}.png`, base64Data, { base64: true });
              } else if (format === "svg") {
                const dataUrl = await htmlToImage.toSvg(element, {
                  cacheBust: true,
                  imagePlaceholder,
                });
                const content = dataUrl.includes("base64,")
                  ? dataUrl.split("base64,")[1]
                  : decodeURIComponent(dataUrl.split(",")[1]);
                const options = dataUrl.includes("base64,") ? { base64: true } : {};
                zip.file(`POSTER_${safeName}_${machine.qrCode}.svg`, content, options);
              } else if (format === "pdf") {
                const { jsPDF } = await import("jspdf");
                const dataUrl = await htmlToImage.toPng(element, {
                  pixelRatio: 2,
                  cacheBust: true,
                  imagePlaceholder,
                });
                const pdf = new jsPDF({
                  orientation: "portrait",
                  unit: "px",
                  format: [1200, 1800],
                });
                pdf.addImage(dataUrl, "PNG", 0, 0, 1200, 1800);
                const pdfBlob = pdf.output("blob");
                zip.file(`POSTER_${safeName}_${machine.qrCode}.pdf`, pdfBlob);
              }

              // Tiny pause to give the main thread breathing room and avoid locking the browser
              await new Promise((resolve) => setTimeout(resolve, 60));
            } catch (err) {
              console.error(`Failed to generate poster zip item for ${machine.name}:`, err);
            }
          }

          // Check if any files were successfully added to the zip before downloading
          const fileCount = Object.keys(zip.files).length;
          if (fileCount === 0) {
            alert("No se pudieron generar los pósters para el pack. Por favor, verificá que los elementos estén cargados correctamente.");
            return;
          }

          const zipBlob = await zip.generateAsync({ type: "blob" });
          saveAs(zipBlob, `Posters_Maquinas_${Date.now()}.zip`);
        } else {
          // Standard QR Mode Bulk: ZIP of QRs
          if (format === "pdf") return;
          const blob = await generateQrZip(machines, config, format);
          saveAs(blob, `QR_Maquinas_${Date.now()}.zip`);
        }
      } catch (err) {
        console.error("Failed to generate zip file:", err);
      } finally {
        setIsGeneratingZip(false);
      }
    },
    [config]
  );

  return {
    config,
    updateConfig,
    setConfig,
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
  };
}
