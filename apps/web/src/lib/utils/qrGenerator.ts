import QRCodeStyling, {
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
  FileExtension,
} from "qr-code-styling";

export interface QrConfig {
  dotsColor: string;
  backgroundColor: string;
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  logo: string | null;
  logoSize: number; // 0.1 to 0.35
  errorCorrectionLevel: ErrorCorrectionLevel;
  format: "svg" | "png";
  size: number;
}

export const DEFAULT_QR_CONFIG: QrConfig = {
  dotsColor: "#111111",
  backgroundColor: "#FFFFFF",
  dotsType: "rounded",
  cornersSquareType: "extra-rounded",
  cornersDotType: "dot",
  logo: null,
  logoSize: 0.22,
  errorCorrectionLevel: "H",
  format: "svg",
  size: 1024,
};

export const QR_BASE_URL = "https://entrenio.com/share/recipe";

export function buildQrUrl(qrCode: string): string {
  return `${QR_BASE_URL}/${qrCode}`;
}

export function createQrInstance(url: string, config: QrConfig): QRCodeStyling {
  return new QRCodeStyling({
    width: config.size,
    height: config.size,
    type: "svg",
    data: url,
    margin: 20,
    qrOptions: {
      errorCorrectionLevel: config.errorCorrectionLevel,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 8,
      imageSize: config.logo ? config.logoSize : 0,
    },
    dotsOptions: {
      color: config.dotsColor,
      type: config.dotsType,
    },
    backgroundOptions: {
      color: config.backgroundColor,
    },
    cornersSquareOptions: {
      color: config.dotsColor,
      type: config.cornersSquareType,
    },
    cornersDotOptions: {
      color: config.dotsColor,
      type: config.cornersDotType,
    },
    image: config.logo ?? undefined,
  });
}

export async function generateQrBlob(
  qrCode: string,
  config: QrConfig,
  format: "svg" | "png"
): Promise<Blob> {
  const url = buildQrUrl(qrCode);
  const qr = createQrInstance(url, config);
  const blob = await qr.getRawData(format as FileExtension) as Blob | null;
  if (!blob) throw new Error("Failed to generate QR blob");
  return blob;
}

export async function generateQrZip(
  machines: { name: string; qrCode: string }[],
  config: QrConfig,
  format: "svg" | "png"
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  await Promise.all(
    machines.map(async (machine) => {
      try {
        const blob = await generateQrBlob(machine.qrCode, config, format);
        const safeName = machine.name.replace(/[^a-zA-Z0-9_-]/g, "_");
        zip.file(`QR_${safeName}_${machine.qrCode}.${format}`, blob);
      } catch (err) {
        console.error(`Failed to generate QR for ${machine.name}:`, err);
      }
    })
  );

  return zip.generateAsync({ type: "blob" });
}
