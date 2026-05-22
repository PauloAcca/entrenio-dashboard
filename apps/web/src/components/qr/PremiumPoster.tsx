"use client";
import React, { forwardRef, useState, useEffect } from "react";
import { QrConfig, generateQrBlob } from "@/lib/utils/qrGenerator";
import { ChevronDown, Dumbbell } from "lucide-react";

interface PremiumPosterProps {
  mode: "preview" | "print";
  machineName: string;
  qrCode: string | null;
  config: QrConfig;
  gymName?: string;
  gymLogoUrl?: string | null;
}

export const PremiumPoster = forwardRef<HTMLDivElement, PremiumPosterProps>(
  ({ mode, machineName, qrCode, config, gymName, gymLogoUrl }, ref) => {
    const isPrint = mode === "print";
    const activeGymLogo = config.logo ?? gymLogoUrl;
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    useEffect(() => {
      if (!qrCode) {
        setQrUrl(null);
        return;
      }
      let active = true;
      let localUrl: string | null = null;

      generateQrBlob(qrCode, config, "png")
        .then((blob) => {
          if (!active) return;
          localUrl = URL.createObjectURL(blob);
          setQrUrl(localUrl);
        })
        .catch((err) => {
          console.error("Error generating QR inside poster:", err);
        });

      return () => {
        active = false;
        if (localUrl) {
          URL.revokeObjectURL(localUrl);
        }
      };
    }, [qrCode, config]);
    
    // Scale classes depending on preview vs print mode
    const posterStyle = isPrint
      ? {
          width: "1200px",
          height: "1800px",
          backgroundColor: config.posterBgColor,
          color: config.posterTextColor,
        }
      : {
          backgroundColor: config.posterBgColor,
          color: config.posterTextColor,
        };

    const containerClasses = isPrint
      ? "p-16 flex flex-col justify-between select-none relative font-sans shrink-0 overflow-hidden box-border"
      : "w-full max-w-[420px] aspect-[2/3] rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col justify-between relative select-none font-sans transition-all duration-300";

    const headerClasses = isPrint
      ? "text-center space-y-3 mt-4"
      : "text-center space-y-1.5";

    const titlePrefixClasses = isPrint
      ? "text-2xl tracking-[0.25em] font-black uppercase opacity-90 block"
      : "text-[11px] tracking-[0.25em] font-black uppercase opacity-90 block";

    const titleClasses = isPrint
      ? "text-[92px] font-black uppercase tracking-wide leading-none truncate px-4 font-mono font-bold"
      : "text-3xl font-black uppercase tracking-wide leading-none truncate px-2 font-mono font-bold";

    const subTitleClasses = isPrint
      ? "text-4xl tracking-[0.15em] font-black uppercase opacity-80 block pt-2"
      : "text-xs tracking-[0.15em] font-black uppercase opacity-80 block pt-0.5";

    const arrowIconClasses = isPrint ? "w-14 h-14 mx-auto opacity-80 mt-1" : "w-5 h-5 mx-auto opacity-80 mt-0.5 animate-bounce";

    // QR container area
    const qrSectionClasses = isPrint ? "flex flex-col items-center my-6" : "flex flex-col items-center my-2";
    
    const qrInstructionClasses = isPrint
      ? "text-3xl font-black tracking-[0.15em] uppercase opacity-90 mb-4"
      : "text-[10px] font-black tracking-[0.15em] uppercase opacity-90 mb-2";

    const qrBracketsClasses = isPrint ? "relative p-5" : "relative p-2.5";
    
    const qrCardClasses = isPrint
      ? "rounded-[40px] overflow-hidden bg-white p-6 shadow-2xl flex items-center justify-center w-[640px] h-[640px]"
      : "rounded-2xl overflow-hidden bg-white p-3 shadow-md flex items-center justify-center w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]";

    const qrAlternativeClasses = isPrint
      ? "text-3xl font-black tracking-[0.15em] uppercase opacity-90 mt-5"
      : "text-[10px] font-black tracking-[0.15em] uppercase opacity-90 mt-2";

    // Footer section
    const footerClasses = isPrint
      ? "flex items-center justify-between border-t border-white/10 pt-8 pb-4 mb-4"
      : "flex items-center justify-between border-t border-white/10 pt-3";

    // Custom CSS for brackets line thickness
    const borderThickness = isPrint ? "border-[7px]" : "border-[3px]";
    const bracketSize = isPrint ? "w-12 h-12" : "w-5 h-5";
    const borderRadius = isPrint ? "rounded-[12px]" : "rounded";
    const bracketOffset = isPrint ? "top-[-10px] left-[-10px]" : "top-[-6px] left-[-6px]";

    return (
      <div ref={ref} style={posterStyle} className={containerClasses}>
        {/* 1. Header Section */}
        <div className={headerClasses}>
          <span className={titlePrefixClasses}>MÁQUINA:</span>
          <h3 className={titleClasses} title={machineName}>
            {machineName || "Nombre de Máquina"}
          </h3>
          <span className={subTitleClasses}>Info & Variaciones</span>
          <ChevronDown className={arrowIconClasses} />
        </div>

        {/* 2. QR Code Section (Large & Focused) */}
        <div className={qrSectionClasses}>
          <span className={qrInstructionClasses}>Escaneá aquí para más info</span>

          {/* Brackets around QR frame */}
          <div className={qrBracketsClasses}>
            {/* Brackets */}
            <div
              className={`absolute top-0 left-0 ${bracketSize} ${borderThickness} border-t border-l ${borderRadius}`}
              style={{ borderColor: config.posterTextColor }}
            />
            <div
              className={`absolute top-0 right-0 ${bracketSize} ${borderThickness} border-t border-r ${borderRadius}`}
              style={{ borderColor: config.posterTextColor }}
            />
            <div
              className={`absolute bottom-0 left-0 ${bracketSize} ${borderThickness} border-b border-l ${borderRadius}`}
              style={{ borderColor: config.posterTextColor }}
            />
            <div
              className={`absolute bottom-0 right-0 ${bracketSize} ${borderThickness} border-b border-r ${borderRadius}`}
              style={{ borderColor: config.posterTextColor }}
            />

            {/* White QR Code Frame */}
            <div className={qrCardClasses}>
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800" />
                  {isPrint && <span className="text-xl">Generando QR...</span>}
                </div>
              )}
            </div>
          </div>

          <span className={qrAlternativeClasses}>Descubre alternativas</span>
        </div>

        {/* 3. Footer Branding Section */}
        <div className={footerClasses}>
          {activeGymLogo ? (
            /* CASE A: Gym Logo & Entrenio branding next to each other */
            <>
              {/* Gym logo area */}
              <div className="flex items-center gap-4 max-w-[55%]">
                <div
                  className={`rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white/20 ${
                    isPrint ? "w-28 h-28" : "w-11 h-11"
                  }`}
                >
                  <img
                    src={activeGymLogo}
                    alt="Gym Logo"
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-black uppercase tracking-wider truncate leading-tight ${
                      isPrint ? "text-4xl" : "text-sm"
                    }`}
                  >
                    {gymName || "Mi Gimnasio"}
                  </p>
                </div>
              </div>

              {/* Entrenio logo area */}
              <div className="flex items-center gap-4 max-w-[45%] text-left">
                <img
                  src="/entrenio-logo.png"
                  alt="Entrenio Logo"
                  className={`rounded-2xl shrink-0 object-cover shadow-lg bg-black ${
                    isPrint ? "w-28 h-28" : "w-11 h-11"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`font-semibold opacity-70 leading-none ${
                      isPrint ? "text-xl mb-1" : "text-[8px]"
                    }`}
                  >
                    Powered by
                  </p>
                  <p
                    className={`font-black uppercase tracking-wider leading-none my-0.5 ${
                      isPrint ? "text-4xl" : "text-xs"
                    }`}
                  >
                    ENTRENIO
                  </p>
                  <p
                    className={`font-semibold opacity-70 leading-none ${
                      isPrint ? "text-xl mt-1" : "text-[8px]"
                    }`}
                  >
                    Descarga la App
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* CASE B: Centered Entrenio branding ONLY */
            <div className="flex items-center justify-center gap-4 w-full">
              <img
                src="/entrenio-logo.png"
                alt="Entrenio Logo"
                className={`rounded-2xl shrink-0 object-cover shadow-lg bg-black ${
                  isPrint ? "w-28 h-28" : "w-12 h-12"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-semibold opacity-70 leading-none ${
                    isPrint ? "text-xl mb-1" : "text-[8px]"
                  }`}
                >
                  Powered by
                </p>
                <p
                  className={`font-black uppercase tracking-wider leading-none my-0.5 ${
                    isPrint ? "text-4xl" : "text-sm"
                  }`}
                >
                  ENTRENIO
                </p>
                <p
                  className={`font-semibold opacity-70 leading-none ${
                    isPrint ? "text-xl mt-1" : "text-[8px]"
                  }`}
                >
                  Descarga la App
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PremiumPoster.displayName = "PremiumPoster";
