import React from "react";
import "./InfoCard.css";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  backgroundColor?: string;
  borderColor?: string;
}

export default function InfoCard({
  icon,
  title,
  description,
  backgroundColor = "var(--cor-dourado)",
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
          <h3>{title}</h3>
        </div>
      </div>
      <div className="info-card-description">
        <p>{description}</p>
      </div>
    </div>
  );
}
