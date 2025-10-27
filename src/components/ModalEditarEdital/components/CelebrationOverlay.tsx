import React from "react";

interface CelebrationOverlayProps {
  isVisible: boolean;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="celebration-container" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className={`balloon b${i + 1}`} />
      ))}
    </div>
  );
};

export default CelebrationOverlay;
