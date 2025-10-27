import React from "react";
import { Link, ChevronDown, Edit, Save, Trash2, Plus } from "lucide-react";
import { EditableDocumento } from "../types";

interface DocumentosSectionProps {
  documentos: EditableDocumento[];
  openLinks: boolean;
  onDocumentosChange: (documentos: EditableDocumento[]) => void;
  onToggleOpen: () => void;
}

const DocumentosSection: React.FC<DocumentosSectionProps> = ({
  documentos,
  openLinks,
  onDocumentosChange,
  onToggleOpen,
}) => {
  const updateDocumento = (
    index: number,
    field: keyof EditableDocumento["value"],
    value: any
  ) => {
    const newDocs = [...documentos];
    newDocs[index].value = { ...newDocs[index].value, [field]: value };
    onDocumentosChange(newDocs);
  };

  const toggleDocumentoEditing = (index: number, editing: boolean) => {
    const newDocs = [...documentos];
    newDocs[index].isEditing = editing;
    onDocumentosChange(newDocs);
  };

  const deleteDocumento = (index: number) => {
    const newDocs = documentos.filter((_, i) => i !== index);
    onDocumentosChange(newDocs);
  };

  const addDocumento = () => {
    const newDocumento: EditableDocumento = {
      value: { titulo_documento: "", url_documento: "" },
      isEditing: true,
    };
    onDocumentosChange([...documentos, newDocumento]);
  };

  const saveDocumento = (index: number) => {
    const documento = documentos[index];
    if (documento.value.titulo_documento && documento.value.url_documento) {
      toggleDocumentoEditing(index, false);
    }
  };

  return (
    <section className="section-card">
      <div className="section-header-modal" onClick={onToggleOpen}>
        <div className="section-title">
          <h3>
            <Link size={20} /> Links e Documentos
          </h3>
          <p className="section-subtitle">
            URLs e PDFs relevantes que complementam o edital
          </p>
        </div>
        <button
          className={`section-toggle ${openLinks ? "open" : ""}`}
          aria-label="Alternar links"
          title="Alternar links"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {openLinks && (
        <div className="links-list section-body">
          {documentos.map((documento, index) => (
            <div key={index} className="link-item">
              {documento.isEditing ? (
                <div className="link-editing">
                  <input
                    type="text"
                    placeholder="Título do documento"
                    value={documento.value.titulo_documento}
                    onChange={(e) =>
                      updateDocumento(index, "titulo_documento", e.target.value)
                    }
                    className="link-input"
                  />
                  <input
                    type="url"
                    placeholder="URL do documento"
                    value={documento.value.url_documento}
                    onChange={(e) =>
                      updateDocumento(index, "url_documento", e.target.value)
                    }
                    className="link-input"
                  />
                  <div className="link-actions">
                    <button
                      aria-label="Salvar link"
                      title="Salvar link"
                      onClick={() => saveDocumento(index)}
                      className="btn-save-link"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      aria-label="Excluir link"
                      title="Excluir link"
                      onClick={() => deleteDocumento(index)}
                      className="btn-delete-link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="link-display">
                  <div className="link-info">
                    <span className="link-title">
                      {documento.value.titulo_documento}
                    </span>
                    <a
                      href={documento.value.url_documento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-url"
                    >
                      {documento.value.url_documento}
                    </a>
                  </div>
                  <div className="link-actions">
                    <button
                      aria-label="Editar link"
                      title="Editar link"
                      onClick={() => toggleDocumentoEditing(index, true)}
                      className="btn-edit-link"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      aria-label="Excluir link"
                      title="Excluir link"
                      onClick={() => deleteDocumento(index)}
                      className="btn-delete-link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {documentos.length === 0 && (
            <div className="empty-state">Nenhum link adicionado.</div>
          )}
          <button onClick={addDocumento} className="btn-add-link">
            <Plus size={16} />
            Adicionar Link
          </button>
        </div>
      )}
    </section>
  );
};

export default DocumentosSection;
