"use client";
import React, { forwardRef, useState, useEffect } from "react";
import { QrConfig, generateQrBlob } from "@/lib/utils/qrGenerator";
import { ChevronDown } from "lucide-react";

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
    const [isGenerating, setIsGenerating] = useState(false);

    const showGymName = config.showGymName !== false;
    const rawGymName = config.customGymName && config.customGymName.trim() !== ""
      ? config.customGymName
      : (gymName || "");

    const hasGymName = showGymName && rawGymName.trim() !== "";
    const activeGymName = hasGymName ? rawGymName : "";

    useEffect(() => {
      if (!qrCode) {
        setQrUrl(null);
        return;
      }
      setIsGenerating(true);
      let active = true;

      generateQrBlob(qrCode, config, "png")
        .then((blob) => {
          if (!active) return;
          const reader = new FileReader();
          reader.onloadend = () => {
            if (!active) return;
            setQrUrl(reader.result as string);
            setIsGenerating(false);
          };
          reader.readAsDataURL(blob);
        })
        .catch((err) => {
          console.error("Error generating QR inside poster:", err);
          if (active) setIsGenerating(false);
        });

      return () => {
        active = false;
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
      ? "text-center space-y-2 mt-4 w-full"
      : "text-center space-y-1 w-full";

    const titlePrefixClasses = isPrint
      ? "text-2xl tracking-[0.25em] font-black uppercase opacity-90 block"
      : "text-[11px] tracking-[0.25em] font-black uppercase opacity-90 block";

    const titleClasses = isPrint
      ? "text-[76px] font-black uppercase tracking-wide leading-[1.1] px-4 font-sans break-words whitespace-normal font-bold"
      : "text-2xl sm:text-3xl font-black uppercase tracking-wide leading-tight px-2 font-sans break-words whitespace-normal font-bold";

    const subTitleClasses = isPrint
      ? "text-4xl tracking-[0.15em] font-black uppercase opacity-80 block pt-2"
      : "text-xs tracking-[0.15em] font-black uppercase opacity-80 block pt-0.5";

    const arrowIconClasses = isPrint ? "w-14 h-14 mx-auto opacity-80 mt-1" : "w-5 h-5 mx-auto opacity-80 mt-0.5 animate-bounce";

    // QR container area
    const qrSectionClasses = "flex flex-col items-center w-full";
    
    const qrInstructionClasses = isPrint
      ? "text-[46px] font-black tracking-[0.15em] uppercase opacity-95 mb-6"
      : "text-[14px] font-black tracking-[0.15em] uppercase opacity-95 mb-3";

    const qrBracketsClasses = isPrint ? "relative p-5" : "relative p-2.5";
    
    const qrCardClasses = isPrint
      ? "rounded-[40px] overflow-hidden bg-white p-6 shadow-2xl flex items-center justify-center w-[640px] h-[640px]"
      : "rounded-2xl overflow-hidden bg-white p-3 shadow-md flex items-center justify-center w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]";

    const qrAlternativeClasses = isPrint
      ? "text-[46px] font-black tracking-[0.15em] uppercase opacity-95 mt-6"
      : "text-[14px] font-black tracking-[0.15em] uppercase opacity-95 mt-3";

    // Footer section
    const footerClasses = isPrint
      ? "flex items-center justify-between border-t border-white/10 pt-6 pb-4 mb-4"
      : "flex items-center justify-between border-t border-white/10 pt-2";

    // Bracket line dimensions
    const bracketLen = isPrint ? "48px" : "20px";
    const bracketThick = isPrint ? "7px" : "3px";

    return (
      <div ref={ref} style={posterStyle} className={containerClasses}>
        {/* 1 & 2. Main Group for tighter spacing between header and QR */}
        <div className="flex flex-col items-center w-full flex-1 justify-start">
          {/* Header Section */}
          <div className={headerClasses}>
            <span className={titlePrefixClasses}>MÁQUINA:</span>
            <h3 className={titleClasses} title={machineName}>
              {machineName || "Nombre de Máquina"}
            </h3>
            <span className={subTitleClasses}>Info & Variaciones</span>
            <ChevronDown className={arrowIconClasses} />
          </div>

          {/* Flexible spacer to push QR Section all the way down, reducing bottom empty space */}
          <div className="flex-1" />

          {/* QR Code Section (Large & Focused) */}
          <div className={qrSectionClasses}>
            <span className={qrInstructionClasses}>Escaneá aquí para más info</span>

            {/* Brackets around QR frame */}
            <div className={qrBracketsClasses}>
              {/* Top Left Bracket */}
              <div
                className="absolute top-0 left-0"
                style={{
                  width: bracketLen,
                  height: bracketThick,
                  backgroundColor: config.posterTextColor,
                }}
              />
              <div
                className="absolute top-0 left-0"
                style={{
                  width: bracketThick,
                  height: bracketLen,
                  backgroundColor: config.posterTextColor,
                }}
              />

              {/* Top Right Bracket */}
              <div
                className="absolute top-0 right-0"
                style={{
                  width: bracketLen,
                  height: bracketThick,
                  backgroundColor: config.posterTextColor,
                }}
              />
              <div
                className="absolute top-0 right-0"
                style={{
                  width: bracketThick,
                  height: bracketLen,
                  backgroundColor: config.posterTextColor,
                }}
              />

              {/* Bottom Left Bracket */}
              <div
                className="absolute bottom-0 left-0"
                style={{
                  width: bracketLen,
                  height: bracketThick,
                  backgroundColor: config.posterTextColor,
                }}
              />
              <div
                className="absolute bottom-0 left-0"
                style={{
                  width: bracketThick,
                  height: bracketLen,
                  backgroundColor: config.posterTextColor,
                }}
              />

              {/* Bottom Right Bracket */}
              <div
                className="absolute bottom-0 right-0"
                style={{
                  width: bracketLen,
                  height: bracketThick,
                  backgroundColor: config.posterTextColor,
                }}
              />
              <div
                className="absolute bottom-0 right-0"
                style={{
                  width: bracketThick,
                  height: bracketLen,
                  backgroundColor: config.posterTextColor,
                }}
              />

              {/* White QR Code Frame */}
              <div className={`${qrCardClasses} relative`}>
                {qrUrl ? (
                  <>
                    <img
                      src={qrUrl}
                      alt="QR Code"
                      className={`w-full h-full object-contain transition-opacity duration-200 ${
                        isGenerating ? "opacity-35" : "opacity-100"
                      }`}
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800" />
                      </div>
                    )}
                  </>
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

          {/* Flexible spacer to push QR Section up, keeping it perfectly centered and symmetric */}
          <div className="flex-1" />
        </div>

        {/* 3. Footer Branding Section */}
        <div className={footerClasses}>
          {activeGymLogo ? (
            hasGymName ? (
              /* CASE A: Gym Logo (with Gym Name) & Entrenio branding next to each other (left & right sides) */
              <>
                {/* Gym logo area */}
                <div className="flex items-center gap-4 max-w-[55%]">
                  <div
                    className={`flex items-center justify-center shrink-0 ${
                      isPrint ? "w-40 h-40" : "w-16 h-16"
                    }`}
                  >
                    <img
                      src={activeGymLogo}
                      alt="Gym Logo"
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain drop-shadow-md"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`font-black uppercase tracking-wider break-words whitespace-normal leading-tight ${
                        isPrint ? "text-4xl" : "text-sm"
                      }`}
                    >
                      {activeGymName}
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
              /* CASE C: Centered Gym Logo + Centered Entrenio branding side-by-side (when gym name is hidden) */
              <div className="flex items-center justify-center gap-8 md:gap-12 w-full">
                {/* Gym logo area */}
                <div
                  className={`flex items-center justify-center shrink-0 ${
                    isPrint ? "w-40 h-40" : "w-16 h-16"
                  }`}
                >
                  <img
                    src={activeGymLogo}
                    alt="Gym Logo"
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Elegant separator line */}
                <div className={`bg-white/20 shrink-0 ${isPrint ? "w-0.5 h-16" : "w-[1px] h-8"}`} />

                {/* Entrenio logo area */}
                <div className="flex items-center gap-4 text-left">
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
              </div>
            )
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
