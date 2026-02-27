"use client";

import React from "react";

interface MovieStatusBadgeProps {
  status: string | null;
  className?: string;
}

export default function MovieStatusBadge({ status, className = "" }: MovieStatusBadgeProps) {
  if (!status) return null;

  // Hide badge for ended movies
  if (status === "ended") return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "now_showing":
        return {
          text: "ĐANG CHIẾU",
          bgClass: "bg-gradient-to-r from-red-600 to-red-500",
          textClass: "text-white",
          borderClass: "border-red-600",
          shadowClass: "shadow-red-500/30"
        };
      case "coming_soon":
        return {
          text: "SẮP CHIẾU",
          bgClass: "bg-gradient-to-r from-blue-600 to-blue-500",
          textClass: "text-white",
          borderClass: "border-blue-600",
          shadowClass: "shadow-blue-500/30"
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig(status);
  if (!config) return null;

  return (
    <div
      className={`
        absolute top-2 left-2 z-30
        px-3 py-1.5 rounded-full
        text-xs font-black tracking-wider uppercase
        ${config.bgClass} ${config.textClass}
        ${config.borderClass} border-2
        ${config.shadowClass} shadow-lg
        transform -rotate-12 hover:rotate-0
        transition-all duration-300
        ${className}
      `}
    >
      <span className="drop-shadow-sm">{config.text}</span>
    </div>
  );
}
