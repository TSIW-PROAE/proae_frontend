import React from "react";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  variant?: "dourado" | "azul";
}

export default function InfoCard({
  icon,
  title,
  description,
  backgroundColor = "var(--cor-dourado)",
  variant = "dourado"
}: InfoCardProps) {
  const isDourado = variant === "dourado" || backgroundColor === "var(--cor-dourado)";
  
  return (
    <div className={`
      group relative w-full h-56 rounded-2xl border-2 p-6 
      flex flex-col justify-between overflow-hidden
      transition-all duration-300 ease-in-out
      hover:transform hover:-translate-y-2 hover:shadow-2xl
      ${isDourado 
        ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 border-yellow-600' 
        : 'bg-gradient-to-br from-[#183b4e] via-[#1e4a5d] to-[#2a5a71] border-[#183b4e]'
      }
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-12 -translate-x-12"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-4 mb-3">
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
            transition-transform duration-300 group-hover:scale-110
            ${isDourado 
              ? 'bg-white/20 backdrop-blur-sm' 
              : 'bg-white/10 backdrop-blur-sm'
            }
          `}>
            <div className="w-8 h-8 flex items-center justify-center">
              {icon}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className={`
              font-semibold text-lg leading-tight
              ${isDourado ? 'text-[#183b4e]' : 'text-white'}
            `}>
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="mt-2">
          <p className={`
            text-sm leading-relaxed font-bold
            ${isDourado ? 'text-[#183b4e]' : 'text-white/90'}
          `}>
            {description}
          </p>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
