import React from "react";

export function WaterFlowBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none aria-hidden">
      {/* 1. Base Gradient: Ice Blue -> Very Light Aqua */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#E8F8FC] via-[#C9EEF8]/60 to-[#F2FAFD]"
        style={{
          backgroundImage: `
            linear-gradient(135deg, #E8F8FC 0%, #C9EEF8 38%, #E2F5FC 72%, #F4FCFE 100%)
          `
        }}
      />

      {/* 2. Soft Aqua-Blue Radial Glow (Positioned on the Right Side / Product Area) */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full blur-[90px] opacity-70 animate-product-glow"
        style={{
          background: `radial-gradient(circle, rgba(88, 215, 234, 0.38) 0%, rgba(53, 191, 224, 0.22) 45%, rgba(8, 124, 193, 0.08) 70%, transparent 100%)`
        }}
      />

      {/* 3. Secondary Left/Bottom Water Glow */}
      <div 
        className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-50"
        style={{
          background: `radial-gradient(circle, rgba(201, 238, 248, 0.8) 0%, rgba(88, 215, 234, 0.2) 50%, transparent 80%)`
        }}
      />

      {/* 4. Sunlight Reflection / Shimmer Bar */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div 
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] animate-water-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 45%, rgba(88, 215, 234, 0.3) 50%, rgba(255, 255, 255, 0.5) 55%, transparent 100%)`
          }}
        />
      </div>

      {/* 5. SVG Wave Layers (Flowing from Left/Bottom -> Center -> Right Product Area) */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden">
        {/* Layer 1: Deep Aqua Base Wave */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-[65%] min-h-[350px] opacity-35 animate-wave-1 transform-gpu"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,224 C280,320 560,160 840,240 C1120,320 1260,192 1440,256 L1440,600 L0,600 Z"
            fill="url(#wave-grad-1)"
          />
          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9EEF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#58D7EA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#35BFE0" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Layer 2: Middle Smooth Aqua Wave */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-[55%] min-h-[300px] opacity-30 animate-wave-2 transform-gpu"
          viewBox="0 0 1440 500"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,160 C320,80 640,240 960,140 C1280,40 1360,200 1440,160 L1440,500 L0,500 Z"
            fill="url(#wave-grad-2)"
          />
          <defs>
            <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8F8FC" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#58D7EA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#087CC1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Layer 3: Top Crest Wave (Light White & Cyan Reflection) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-[45%] min-h-[250px] opacity-40 animate-wave-3 transform-gpu"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,192 C360,288 720,96 1080,192 C1260,240 1380,144 1440,176 L1440,400 L0,400 Z"
            fill="url(#wave-grad-3)"
          />
          <defs>
            <linearGradient id="wave-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#C9EEF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#58D7EA" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 6. Subtle Water Particle Droplets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        {[
          { left: "12%", size: "12px", duration: "16s", delay: "0s" },
          { left: "28%", size: "8px", duration: "22s", delay: "3s" },
          { left: "45%", size: "14px", duration: "19s", delay: "7s" },
          { left: "62%", size: "10px", duration: "25s", delay: "2s" },
          { left: "78%", size: "16px", duration: "17s", delay: "5s" },
          { left: "90%", size: "9px", duration: "21s", delay: "9s" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="absolute rounded-full border border-[#58D7EA]/40 bg-gradient-to-tr from-[#58D7EA]/30 to-[#FFFFFF]/60 backdrop-blur-[1px]"
            style={{
              left: item.left,
              bottom: "-5%",
              width: item.size,
              height: item.size,
              animation: `waterBubbleFloat ${item.duration} ease-in-out infinite`,
              animationDelay: item.delay,
              boxShadow: "0 0 10px rgba(88, 215, 234, 0.3)"
            }}
          />
        ))}
      </div>
    </div>
  );
}
