import { memo } from "react";

export const WaterBackground = memo(function WaterBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base Gradient: Soft White -> Ice Blue -> Light Aqua */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FDFF] via-[#E8F8FC] to-[#C9EEF8]/60" />

      {/* Hero Radial Product Glow (Soft Aqua-Blue) */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#58D7EA]/30 via-[#35BFE0]/15 to-transparent blur-3xl opacity-80 animate-pulse-slow" />
      <div className="absolute top-1/3 left-10 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#C9EEF8]/40 via-[#58D7EA]/15 to-transparent blur-3xl opacity-60" />

      {/* SVG Wave Layer 1 - Deep Soft Ice Blue Wave */}
      <div className="absolute top-28 left-0 right-0 w-[200%] opacity-40 animate-wave-slow">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-48 md:h-72 object-cover"
          preserveAspectRatio="none"
        >
          <path
            fill="#C9EEF8"
            fillOpacity="0.7"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
      </div>

      {/* SVG Wave Layer 2 - Flowing Aqua Crest */}
      <div className="absolute top-64 left-0 right-0 w-[200%] opacity-35 animate-wave-medium">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-56 md:h-80 object-cover"
          preserveAspectRatio="none"
        >
          <path
            fill="#58D7EA"
            fillOpacity="0.45"
            d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,138.7C840,117,960,107,1080,122.7C1200,139,1320,181,1380,202.7L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </svg>
      </div>

      {/* SVG Wave Layer 3 - Sky Blue Dynamic Water Flow */}
      <div className="absolute top-96 left-0 right-0 w-[200%] opacity-25 animate-wave-fast">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-64 md:h-96 object-cover"
          preserveAspectRatio="none"
        >
          <path
            fill="#35BFE0"
            fillOpacity="0.35"
            d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,213.3C1120,203,1280,149,1360,122.7L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          />
        </svg>
      </div>

      {/* Sunlight Reflection Sweep Line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full transform -skew-x-12 animate-reflection-sweep opacity-30" />

      {/* Water Droplet Particles */}
      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-[15%] left-[12%] w-3 h-3 rounded-full bg-[#58D7EA]/40 backdrop-blur-sm animate-droplet-float-1" />
        <div className="absolute top-[28%] left-[45%] w-2 h-2 rounded-full bg-[#35BFE0]/50 backdrop-blur-sm animate-droplet-float-2" />
        <div className="absolute top-[20%] right-[18%] w-4 h-4 rounded-full bg-white/60 shadow-sm shadow-[#58D7EA]/30 animate-droplet-float-3" />
        <div className="absolute top-[42%] left-[25%] w-2.5 h-2.5 rounded-full bg-[#C9EEF8]/60 backdrop-blur-sm animate-droplet-float-2" />
        <div className="absolute top-[55%] right-[28%] w-3 h-3 rounded-full bg-[#58D7EA]/45 backdrop-blur-sm animate-droplet-float-1" />
        <div className="absolute top-[70%] left-[15%] w-2 h-2 rounded-full bg-[#35BFE0]/40 backdrop-blur-sm animate-droplet-float-3" />
        <div className="absolute top-[82%] right-[12%] w-3.5 h-3.5 rounded-full bg-[#C9EEF8]/50 backdrop-blur-sm animate-droplet-float-1" />
      </div>
    </div>
  );
});
