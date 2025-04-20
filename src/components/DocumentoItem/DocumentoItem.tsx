import React from "react";
import arqAzulPdf from "../../assets/icons/arquivo-azul-pdf.svg";
import arqBegePdf from "../../assets/icons/arquivo-bege-pdf.svg";
import "./DocumentoItem.css";

interface DocumentoItemProps {
  titulo: string;
  url: string;
  tema?: "dourado" | "azul";
}

const DocumentoItem: React.FC<DocumentoItemProps> = ({
  titulo,
  url,
  tema = "dourado",
}) => {
  const icone = tema === "dourado" ? arqAzulPdf : arqBegePdf;
  const cor = tema === "dourado" ? "var(--cor-azul-escuro)" : "var(--cor-creme-escuro)";

  return (
    <div className="documento-item">
      <a
        href={url}
        className="documento-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="documento-icone">
          <img src={icone} alt="PDF" />
        </div>
        <div style={{borderBottom: `0.4px solid ${cor}`}} className="documento-info">
          <span className="documento-titulo" style={{ color: cor }}>{titulo}</span>
          <span className="documento-tipo" style={{ color: cor }}>PDF</span>
        </div>
      </a>
    </div>
  );
};

export default DocumentoItem;
