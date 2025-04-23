import React from "react";
import "./InfoCard.css";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  
}

export default function InfoCard({
  icon,
  title,
  description,
  backgroundColor = "var(--cor-dourado)",
  color = "var(--cor-azul-escuro)",
  borderColor = "var(--cor-azul-escuro)",
}: InfoCardProps) {
  return (
    <div
      className="info-card"
      style={{
        backgroundColor,
        borderColor,
      }}
    >
      <div className="info-card-header">
        <div className="info-card-icon">{icon}</div>
        <div className="info-card-title">
          <h3 style={{ color }}>{title}</h3>
        </div>
      </div>
      <div className="info-card-description">
        <p style={{ color }}>{description}</p>
      </div>
    </div>
  );
}
