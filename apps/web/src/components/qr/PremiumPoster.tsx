"use client";
import React, { forwardRef, useState, useEffect, useRef } from "react";
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
    
    // Scale state for preview
    const [scale, setScale] = useState(1);
    const wrapperRef = useRef<HTMLDivElement>(null);

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
    
    // Observe wrapper width for preview scaling
    useEffect(() => {
      if (isPrint || !wrapperRef.current) return;
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          const { width } = entries[0].contentRect;
          // The base width of the poster is 1200px
          setScale(width / 1200);
        }
      });
      observer.observe(wrapperRef.current);
      return () => observer.disconnect();
    }, [isPrint]);
    
    // The base poster content (ALWAYS 1200x1800)
    const posterContent = (
      <div 
        ref={ref}
        className="flex flex-col justify-between select-none font-sans overflow-hidden box-border shrink-0 px-24 py-24"
        style={{
          width: "1200px",
          height: "1800px",
          backgroundColor: config.posterBgColor,
          color: config.posterTextColor,
          ...(isPrint ? {} : {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0
          })
        }}
      >
        {/* 1 & 2. Main Group */}
        <div className="flex flex-col items-center w-full flex-1 justify-start">
          {/* Header Section */}
          <div className="text-center space-y-4 mt-2 w-full">
            <span className="text-3xl tracking-[0.25em] font-black uppercase opacity-90 block">MÁQUINA:</span>
            <h3 className="text-[92px] font-black uppercase tracking-wide leading-[1.1] px-4 font-sans break-words whitespace-normal font-bold" title={machineName}>
              {machineName || "Nombre de Máquina"}
            </h3>
            <span className="text-5xl tracking-[0.15em] font-black uppercase opacity-80 block pt-2">Info & Variaciones</span>
            <ChevronDown className={`w-20 h-20 mx-auto opacity-80 mt-4 ${isPrint ? "" : "animate-bounce"}`} />
          </div>

          {/* Flexible spacer */}
          <div className="flex-[0.5]" />

          {/* QR Code Section */}
          <div className="flex flex-col items-center w-full">
            <span className="text-[52px] font-black tracking-[0.15em] uppercase opacity-95 mb-8">Escaneá aquí para más info</span>

            {/* Brackets around QR frame */}
            <div className="relative p-6">
              {/* Top Left Bracket */}
              <div className="absolute top-0 left-0" style={{ width: "64px", height: "10px", backgroundColor: config.posterTextColor }} />
              <div className="absolute top-0 left-0" style={{ width: "10px", height: "64px", backgroundColor: config.posterTextColor }} />

              {/* Top Right Bracket */}
              <div className="absolute top-0 right-0" style={{ width: "64px", height: "10px", backgroundColor: config.posterTextColor }} />
              <div className="absolute top-0 right-0" style={{ width: "10px", height: "64px", backgroundColor: config.posterTextColor }} />

              {/* Bottom Left Bracket */}
              <div className="absolute bottom-0 left-0" style={{ width: "64px", height: "10px", backgroundColor: config.posterTextColor }} />
              <div className="absolute bottom-0 left-0" style={{ width: "10px", height: "64px", backgroundColor: config.posterTextColor }} />

              {/* Bottom Right Bracket */}
              <div className="absolute bottom-0 right-0" style={{ width: "64px", height: "10px", backgroundColor: config.posterTextColor }} />
              <div className="absolute bottom-0 right-0" style={{ width: "10px", height: "64px", backgroundColor: config.posterTextColor }} />

              {/* White QR Code Frame */}
              <div className="rounded-[48px] overflow-hidden bg-white p-8 shadow-2xl flex items-center justify-center w-[740px] h-[740px] relative">
                {qrUrl ? (
                  <>
                    <img
                      src={qrUrl}
                      alt="QR Code"
                      className={`w-full h-full object-contain transition-opacity duration-200 ${isGenerating ? "opacity-35" : "opacity-100"}`}
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

            <span className="text-[52px] font-black tracking-[0.15em] uppercase opacity-95 mt-8">Descubre alternativas</span>
          </div>

          {/* Flexible spacer */}
          <div className="flex-[0.5]" />
        </div>

        {/* 3. Footer Branding Section */}
        <div className="flex items-center justify-between border-t-2 border-white/10 pt-8 pb-2 w-full">
          {activeGymLogo ? (
            hasGymName ? (
              <>
                <div className="flex items-center gap-4 max-w-[55%]">
                  <div className="flex items-center justify-center shrink-0 w-40 h-40">
                    <img src={activeGymLogo} alt="Gym Logo" crossOrigin="anonymous" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black uppercase tracking-wider break-words whitespace-normal leading-tight text-4xl">{activeGymName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 max-w-[45%] text-left">
                  <img src="/entrenio-logo.png" alt="Entrenio Logo" className="rounded-2xl shrink-0 object-cover shadow-lg bg-black w-28 h-28" />
                  <div className="min-w-0">
                    <p className="font-semibold opacity-70 leading-none text-xl mb-1">Powered by</p>
                    <p className="font-black uppercase tracking-wider leading-none my-0.5 text-4xl">ENTRENIO</p>
                    <p className="font-semibold opacity-70 leading-none text-xl mt-1">Descarga la App</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-12 w-full">
                <div className="flex items-center justify-center shrink-0 w-40 h-40">
                  <img src={activeGymLogo} alt="Gym Logo" crossOrigin="anonymous" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                </div>
                <div className="bg-white/20 shrink-0 w-0.5 h-16" />
                <div className="flex items-center gap-4 text-left">
                  <img src="/entrenio-logo.png" alt="Entrenio Logo" className="rounded-2xl shrink-0 object-cover shadow-lg bg-black w-28 h-28" />
                  <div className="min-w-0">
                    <p className="font-semibold opacity-70 leading-none text-xl mb-1">Powered by</p>
                    <p className="font-black uppercase tracking-wider leading-none my-0.5 text-4xl">ENTRENIO</p>
                    <p className="font-semibold opacity-70 leading-none text-xl mt-1">Descarga la App</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center gap-4 w-full">
              <img src="/entrenio-logo.png" alt="Entrenio Logo" className="rounded-2xl shrink-0 object-cover shadow-lg bg-black w-28 h-28" />
              <div className="text-left">
                <p className="font-semibold opacity-70 leading-none text-xl mb-1">Powered by</p>
                <p className="font-black uppercase tracking-wider leading-none my-0.5 text-4xl">ENTRENIO</p>
                <p className="font-semibold opacity-70 leading-none text-xl mt-1">Descarga la App</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    if (isPrint) {
      return posterContent;
    }

    // Wrap in a scaled container for preview
    return (
      <div 
        ref={wrapperRef}
        className="w-full max-w-[420px] aspect-[2/3] rounded-2xl shadow-xl mx-auto relative overflow-hidden bg-background"
      >
        {posterContent}
      </div>
    );
  }
);

PremiumPoster.displayName = "PremiumPoster";
