import { QrConfig } from "./qrGenerator";

// Helper to load an image from URL/Base64 in browser safely
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Failed to load image at: ${src.substring(0, 100)}...`);
      resolve(null); // Return null instead of crashing, allowing fallback drawing
    };
    img.src = src;
  });
}

// Draw a rounded rectangle on a canvas context
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a high-resolution vertical poster (1200 x 1800 px) for a gym machine.
 * 
 * @param machineName Name of the gym machine
 * @param qrCodeUrl High-res QR code image URL (Data URL or Object URL)
 * @param config QR Configuration with poster options
 * @param gymName Name of the gym
 * @param gymLogoUrl Gym logo URL if available/uploaded
 * @returns Promise resolving to a HTMLCanvasElement containing the poster
 */
export async function generatePosterCanvas(
  machineName: string,
  qrCodeUrl: string,
  config: QrConfig,
  gymName: string,
  gymLogoUrl: string | null
): Promise<HTMLCanvasElement> {
  // Create offscreen high-res canvas (A4 ratio approx 2:3, 1200 x 1800)
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1800;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  const bgColor = config.posterBgColor;
  const textColor = config.posterTextColor;

  // 1. Draw solid background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1200, 1800);

  // 2. Draw Top Section (Header)
  ctx.textAlign = "center";
  ctx.fillStyle = textColor;

  // "MÁQUINA:"
  ctx.font = "900 40px Montserrat, Inter, system-ui, sans-serif";
  ctx.fillText("MÁQUINA:", 600, 170);

  // Dynamic Machine Name (wrapped if long)
  ctx.font = "900 86px Montserrat, Inter, system-ui, sans-serif";
  const nameY = 270;
  const maxWidth = 1000;
  const lineHeight = 100;
  
  const words = machineName.toUpperCase().split(" ");
  let line = "";
  let currentY = nameY;
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Render wrapped lines
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), 600, currentY);
    currentY += lineHeight;
  }

  // "INFO & VARIACIONES"
  ctx.font = "bold 32px Montserrat, Inter, system-ui, sans-serif";
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.85;
  ctx.fillText("INFO & VARIACIONES", 600, currentY + 10);
  ctx.globalAlpha = 1.0;

  // Draw Chevron Arrow below
  const arrowY = currentY + 50;
  ctx.beginPath();
  ctx.moveTo(600 - 24, arrowY);
  ctx.lineTo(600, arrowY + 18);
  ctx.lineTo(600 + 24, arrowY);
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  // 3. Draw Middle Section (QR Code Card and Brackets)
  const qrContainerY = arrowY + 110;
  
  // "ESCANEÁ AQUÍ PARA MÁS INFO"
  ctx.font = "bold 32px Montserrat, Inter, system-ui, sans-serif";
  ctx.fillText("ESCANEÁ AQUÍ PARA MÁS INFO", 600, qrContainerY);

  // White QR container card size 560 x 560
  const cardW = 560;
  const cardH = 560;
  const cardX = 600 - cardW / 2;
  const cardY = qrContainerY + 40;

  // Draw card background (White container)
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fill();
  
  // Reset shadow for subsequent drawings
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Load and Draw the QR code inside the card
  const qrImg = await loadImage(qrCodeUrl);
  if (qrImg) {
    const qrSize = 480;
    const qrX = cardX + (cardW - qrSize) / 2;
    const qrY = cardY + (cardH - qrSize) / 2;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } else {
    // Fallback QR outline if image loading failed
    ctx.fillStyle = "#111111";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("[QR CODE ERROR]", 600, cardY + cardH / 2);
  }

  // Draw Brackets around the QR card
  const pad = 24;
  const bLen = 65;
  const bx = cardX - pad;
  const by = cardY - pad;
  const bw = cardW + pad * 2;
  const bh = cardH + pad * 2;

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  // Top-Left bracket
  ctx.beginPath();
  ctx.moveTo(bx + bLen, by);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx, by + bLen);
  ctx.stroke();

  // Top-Right bracket
  ctx.beginPath();
  ctx.moveTo(bx + bw - bLen, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + bLen);
  ctx.stroke();

  // Bottom-Left bracket
  ctx.beginPath();
  ctx.moveTo(bx + bLen, by + bh);
  ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx, by + bh - bLen);
  ctx.stroke();

  // Bottom-Right bracket
  ctx.beginPath();
  ctx.moveTo(bx + bw - bLen, by + bh);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw, by + bh - bLen);
  ctx.stroke();

  // "DESCUBRE ALTERNATIVAS" below the card
  ctx.fillStyle = textColor;
  ctx.font = "bold 32px Montserrat, Inter, system-ui, sans-serif";
  ctx.fillText("DESCUBRE ALTERNATIVAS", 600, cardY + cardH + 75);

  // 4. Draw Footer (Branding)
  // Load official Entrenio logo (copied previously to public/entrenio-logo.png)
  const entrenioLogo = await loadImage("/entrenio-logo.png");

  // Determine if gym logo is attached
  const activeGymLogo = config.logo ?? gymLogoUrl;

  if (activeGymLogo) {
    // ----------------------------------------------------
    // CASE A: Gym Logo attached -> Left-aligned Gym, Right-aligned Entrenio
    // ----------------------------------------------------
    const footerY = 1530;

    // --- Left side: Gym Logo & Gym Name ---
    const gymLogoImg = await loadImage(activeGymLogo);
    
    // Circle background for gym logo (matches dumbbell placeholder white circle style)
    const circleX = 200;
    const circleY = footerY + 50;
    const circleR = 52;
    
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fill();

    if (gymLogoImg) {
      // Draw gym logo inside the circle (with clipping)
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleR - 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        gymLogoImg,
        circleX - circleR,
        circleY - circleR,
        circleR * 2,
        circleR * 2
      );
      ctx.restore();
    } else {
      // Dumbbell fallback icon in white circle
      ctx.strokeStyle = "#1E2022";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      // Dumbbell bar
      ctx.beginPath();
      ctx.moveTo(circleX - 25, circleY);
      ctx.lineTo(circleX + 25, circleY);
      ctx.stroke();
      // Dumbbell weights
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(circleX - 20, circleY - 14);
      ctx.lineTo(circleX - 20, circleY + 14);
      ctx.moveTo(circleX + 20, circleY - 14);
      ctx.lineTo(circleX + 20, circleY + 14);
      ctx.stroke();
    }

    // Gym name text next to circle
    ctx.textAlign = "left";
    ctx.fillStyle = textColor;
    ctx.font = "900 36px Montserrat, Inter, system-ui, sans-serif";
    
    // Draw multiline gym name in uppercase if too long
    const gymNameText = (gymName || "TU GIMNASIO").toUpperCase();
    const gymTextX = circleX + circleR + 25;
    
    if (gymNameText.length > 15) {
      ctx.fillText(gymNameText.substring(0, 15), gymTextX, circleY - 10);
      ctx.font = "bold 26px Montserrat, Inter, system-ui, sans-serif";
      ctx.fillText(gymNameText.substring(15, 30), gymTextX, circleY + 22);
    } else {
      ctx.fillText(gymNameText, gymTextX, circleY + 12);
    }

    // --- Right side: Powered by Entrenio ---
    const entX = 740;
    const entLogoW = 100;
    
    if (entrenioLogo) {
      // Rounded corner box for Entrenio logo (dark gradient matching mockup style)
      ctx.save();
      drawRoundedRect(ctx, entX, footerY, entLogoW, entLogoW, 24);
      ctx.clip();
      ctx.drawImage(entrenioLogo, entX, footerY, entLogoW, entLogoW);
      ctx.restore();
    }

    ctx.textAlign = "left";
    ctx.fillStyle = textColor;
    
    // "Powered by"
    ctx.font = "bold 20px Montserrat, Inter, system-ui, sans-serif";
    ctx.globalAlpha = 0.7;
    ctx.fillText("Powered by", entX + entLogoW + 20, footerY + 28);
    
    // "ENTRENIO"
    ctx.font = "900 38px Montserrat, Inter, system-ui, sans-serif";
    ctx.globalAlpha = 1.0;
    ctx.fillText("ENTRENIO", entX + entLogoW + 20, footerY + 68);
    
    // "Descarga la App"
    ctx.font = "bold 20px Montserrat, Inter, system-ui, sans-serif";
    ctx.globalAlpha = 0.7;
    ctx.fillText("Descarga la App", entX + entLogoW + 20, footerY + 98);
    ctx.globalAlpha = 1.0;

  } else {
    // ----------------------------------------------------
    // CASE B: NO Gym Logo -> Centered Entrenio Branding only
    // ----------------------------------------------------
    const footerY = 1530;
    const entLogoW = 100;
    
    // Total block width is approx: logo (100) + gap (20) + text block (approx 200) = 320 px
    const entX = 600 - 150; 
    
    if (entrenioLogo) {
      ctx.save();
      drawRoundedRect(ctx, entX, footerY, entLogoW, entLogoW, 24);
      ctx.clip();
      ctx.drawImage(entrenioLogo, entX, footerY, entLogoW, entLogoW);
      ctx.restore();
    }

    ctx.textAlign = "left";
    ctx.fillStyle = textColor;
    
    // "Powered by"
    ctx.font = "bold 20px Montserrat, Inter, system-ui, sans-serif";
    ctx.globalAlpha = 0.7;
    ctx.fillText("Powered by", entX + entLogoW + 20, footerY + 28);
    
    // "ENTRENIO"
    ctx.font = "900 38px Montserrat, Inter, system-ui, sans-serif";
    ctx.globalAlpha = 1.0;
    ctx.fillText("ENTRENIO", entX + entLogoW + 20, footerY + 68);
    
    // "Descarga la App"
    ctx.font = "bold 20px Montserrat, Inter, system-ui, sans-serif";
    ctx.globalAlpha = 0.7;
    ctx.fillText("Descarga la App", entX + entLogoW + 20, footerY + 98);
    ctx.globalAlpha = 1.0;
  }

  return canvas;
}
