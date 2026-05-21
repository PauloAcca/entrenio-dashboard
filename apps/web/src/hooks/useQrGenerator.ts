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
import { saveAs } from "file-saver";

export function useQrGenerator() {
  const [config, setConfig] = useState<QrConfig>(DEFAULT_QR_CONFIG);
  const [previewMachineQrCode, setPreviewMachineQrCode] = useState<string | null>(null);
  const [previewMachineName, setPreviewMachineName] = useState<string>("");
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

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
        const blob = await generateQrBlob(qrCode, config, format);
        const safeName = machineName.replace(/[^a-zA-Z0-9_-]/g, "_");
        saveAs(blob, `QR_${safeName}_${qrCode}.${format}`);
      } finally {
        setIsDownloading(false);
      }
    },
    [config]
  );

  const downloadZip = useCallback(
    async (
      machines: { name: string; qrCode: string }[],
      format: "svg" | "png"
    ) => {
      setIsGeneratingZip(true);
      try {
        const blob = await generateQrZip(machines, config, format);
        saveAs(blob, `QR_Maquinas_${Date.now()}.zip`);
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
