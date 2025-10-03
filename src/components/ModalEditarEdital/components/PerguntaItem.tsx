import React from "react";
import {
  Save,
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  Link2,
  Info,
  Type,
  Hash,
  Calendar,
  List,
  FileText,
  CheckCircle,
  XCircle,
  FileUp,
} from "lucide-react";
import { PerguntaEditorItem, DadoAluno } from "../types";

// Mock de dados do aluno - futuramente virá de uma API
const DADOS_ALUNO_MOCK: DadoAluno[] = [
  {
    nome: "CPF",
    tipo: "text",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "Nome Completo",
    tipo: "text",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "Data de Nascimento",
    tipo: "date",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "Estado Civil",
    tipo: "select",
    obrigatorio: false,
    opcoes: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"],
  },
  {
    nome: "Endereço Completo",
    tipo: "text",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "Telefone",
    tipo: "text",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "Renda Familiar",
    tipo: "number",
    obrigatorio: false,
    opcoes: [],
  },
  {
    nome: "Comprovante de Residência",
    tipo: "file",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "RG (Frente e Verso)",
    tipo: "file",
    obrigatorio: true,
    opcoes: [],
  },
  {
    nome: "Histórico Escolar",
    tipo: "file",
    obrigatorio: false,
    opcoes: [],
  },
];

interface PerguntaItemProps {
  pergunta: PerguntaEditorItem;
  index: number;
  onUpdate: (field: keyof PerguntaEditorItem, value: any) => void;
  onUpdateOpcao: (opcaoIndex: number, value: string) => void;
  onAddOpcao: () => void;
  onRemoveOpcao: (opcaoIndex: number) => void;
  onDelete: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
}

const PerguntaItem: React.FC<PerguntaItemProps> = ({
  pergunta,
  index,
  onUpdate,
  onUpdateOpcao,
  onAddOpcao,
  onRemoveOpcao,
  onDelete,
  onToggleEditing,
  onSave,
}) => {
  return (
    <div
      className={`pergunta-item ${pergunta.isEditing ? "editing" : "saved"}`}
    >
      {pergunta.isEditing ? (
        // Estado de edição
        <>
          <div className="pergunta-header">
            <span className="pergunta-numero">Pergunta {index + 1}</span>
            <div className="pergunta-actions">
              <label
                className={`pergunta-toggle-compact ${pergunta.vincularDadosAluno ? "toggle-disabled" : ""}`}
                title={
                  pergunta.vincularDadosAluno
                    ? "Obrigatoriedade definida pelo dado vinculado"
                    : "Marcar como obrigatória"
                }
              >
                <input
                  type="checkbox"
                  checked={pergunta.obrigatoria}
                  onChange={(e) => onUpdate("obrigatoria", e.target.checked)}
                  disabled={pergunta.vincularDadosAluno}
                />
                <AlertCircle size={14} className="toggle-icon" />
                <span className="toggle-text">Obrigatória</span>
              </label>
              <label
                className="pergunta-toggle-compact"
                title="Vincular resposta aos dados cadastrais do aluno"
              >
                <input
                  type="checkbox"
                  checked={pergunta.vincularDadosAluno || false}
                  onChange={(e) =>
                    onUpdate("vincularDadosAluno", e.target.checked)
                  }
                />
                <Link2 size={14} className="toggle-icon" />
                <span className="toggle-text">Vincular</span>
              </label>
              <button
                onClick={onDelete}
                className="delete-pergunta-button"
                title="Excluir pergunta"
                aria-label="Excluir pergunta"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="pergunta-content">
            <div className="pergunta-field">
              <label>Texto da pergunta:</label>
              <textarea
                value={pergunta.texto}
                onChange={(e) => onUpdate("texto", e.target.value)}
                placeholder="Digite a pergunta..."
                rows={2}
              />
            </div>

            {/* Se vincular está ativo, mostra select de dados do aluno */}
            {pergunta.vincularDadosAluno ? (
              <>
                <div className="pergunta-field">
                  <label>Selecione o dado a ser vinculado:</label>
                  <select
                    value={pergunta.dadoVinculado || ""}
                    onChange={(e) => {
                      const nomeDado = e.target.value;
                      const dado = DADOS_ALUNO_MOCK.find(
                        (d) => d.nome === nomeDado
                      );

                      console.log("Dado selecionado:", nomeDado, dado);
                      console.log("Estado atual da pergunta:", pergunta);

                      if (dado) {
                        // Mapeia o tipo do dado para o tipo da pergunta
                        const tipoMap: Record<
                          string,
                          PerguntaEditorItem["tipo"]
                        > = {
                          text: "texto",
                          number: "numero",
                          date: "data",
                          select: "multipla_escolha",
                          file: "arquivo",
                        };

                        const novoTipo = tipoMap[dado.tipo] || "texto";
                        console.log("Atualizando tipo para:", novoTipo);
                        console.log(
                          "Atualizando obrigatoria para:",
                          dado.obrigatorio
                        );

                        // Atualiza todos os campos de uma vez usando objeto
                        const updates: any = {
                          dadoVinculado: nomeDado,
                          tipo: novoTipo,
                          obrigatoria: dado.obrigatorio,
                        };

                        if (dado.opcoes && dado.opcoes.length > 0) {
                          console.log("Atualizando opções para:", dado.opcoes);
                          updates.opcoes = dado.opcoes;
                        } else {
                          updates.opcoes = [];
                        }

                        console.log("Atualizando com:", updates);
                        onUpdate(updates as any, undefined);
                      } else {
                        // Se não houver dado, apenas limpa dadoVinculado
                        onUpdate("dadoVinculado", nomeDado);
                      }
                    }}
                    aria-label="Dado do aluno"
                    className="select-dado-aluno"
                  >
                    <option value="">-- Selecione um dado --</option>
                    {DADOS_ALUNO_MOCK.map((dado) => {
                      const tipoLabel = {
                        text: "Texto",
                        number: "Número",
                        date: "Data",
                        select: "Seleção",
                        file: "Arquivo",
                      }[dado.tipo];

                      const obrigLabel = dado.obrigatorio
                        ? "Obrigatório"
                        : "Opcional";

                      return (
                        <option key={dado.nome} value={dado.nome}>
                          {dado.nome} • {tipoLabel} • {obrigLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Aviso quando nenhum dado está selecionado */}
                {!pergunta.dadoVinculado && (
                  <div className="select-dado-placeholder">
                    <Info size={18} />
                    <span>
                      Selecione um dado da lista acima para vincular à pergunta
                    </span>
                  </div>
                )}

                {/* Chip de informação do dado selecionado */}
                {pergunta.dadoVinculado &&
                  pergunta.dadoVinculado !== "" &&
                  (() => {
                    console.log(
                      "Renderizando preview para:",
                      pergunta.dadoVinculado
                    );
                    const dadoSelecionado = DADOS_ALUNO_MOCK.find(
                      (d) => d.nome === pergunta.dadoVinculado
                    );

                    console.log("Dado encontrado:", dadoSelecionado);

                    if (!dadoSelecionado) {
                      console.log("Dado não encontrado!");
                      return null;
                    }

                    // Ícone baseado no tipo
                    const TipoIcon =
                      dadoSelecionado.tipo === "text"
                        ? Type
                        : dadoSelecionado.tipo === "number"
                          ? Hash
                          : dadoSelecionado.tipo === "date"
                            ? Calendar
                            : dadoSelecionado.tipo === "select"
                              ? List
                              : dadoSelecionado.tipo === "file"
                                ? FileUp
                                : FileText;

                    return (
                      <div className="dado-vinculado-preview">
                        <div className="preview-row">
                          <div className="preview-icon">
                            <TipoIcon size={18} />
                          </div>
                          <div className="preview-content">
                            <div className="preview-title">
                              <span className="preview-dado-nome">
                                {dadoSelecionado.nome}
                              </span>
                            </div>

                            <div className="preview-meta">
                              <span
                                className={`preview-obrigatorio ${dadoSelecionado.obrigatorio ? "obrig-sim" : "obrig-nao"}`}
                              >
                                {dadoSelecionado.obrigatorio ? (
                                  <>
                                    <CheckCircle size={12} />
                                    Obrigatório
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={12} />
                                    Opcional
                                  </>
                                )}
                              </span>

                              {dadoSelecionado.opcoes &&
                                dadoSelecionado.opcoes.length > 0 && (
                                  <span className="preview-opcoes-count">
                                    {dadoSelecionado.opcoes.length} alternativa
                                    {dadoSelecionado.opcoes.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="preview-tipo-badge">
                            {dadoSelecionado.tipo === "text" && "Texto"}
                            {dadoSelecionado.tipo === "number" && "Número"}
                            {dadoSelecionado.tipo === "date" && "Data"}
                            {dadoSelecionado.tipo === "select" && "Seleção"}
                            {dadoSelecionado.tipo === "file" && "Documento"}
                          </div>
                        </div>

                        {/* Alternativas (estilo igual ao preview de pergunta) */}
                        {dadoSelecionado.opcoes &&
                          dadoSelecionado.opcoes.length > 0 && (
                            <div className="preview-alternativas">
                              {dadoSelecionado.opcoes.map((opcao, idx) => (
                                <span
                                  key={idx}
                                  className="preview-alternativa-item"
                                >
                                  {opcao}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })()}
              </>
            ) : (
              /* Modo normal - sem vincular */
              <>
                <div className="pergunta-field">
                  <label>Tipo de resposta:</label>
                  <select
                    value={pergunta.tipo}
                    onChange={(e) => onUpdate("tipo", e.target.value)}
                    aria-label="Tipo de resposta"
                  >
                    <option value="texto">Texto</option>
                    <option value="numero">Número</option>
                    <option value="multipla_escolha">Múltipla Escolha</option>
                    <option value="multipla_selecao">Múltipla Seleção</option>
                    <option value="data">Data</option>
                    <option value="arquivo">Arquivo</option>
                  </select>
                </div>

                {/* Opções para múltipla escolha/seleção */}
                {(pergunta.tipo === "multipla_escolha" ||
                  pergunta.tipo === "multipla_selecao") && (
                  <div className="pergunta-opcoes">
                    <label>Opções:</label>
                    {pergunta.opcoes?.map((opcao, opcaoIndex) => (
                      <div key={opcaoIndex} className="opcao-item">
                        <input
                          type="text"
                          value={opcao}
                          onChange={(e) =>
                            onUpdateOpcao(opcaoIndex, e.target.value)
                          }
                          placeholder={`Opção ${opcaoIndex + 1}`}
                        />
                        <button
                          onClick={() => onRemoveOpcao(opcaoIndex)}
                          className="remove-opcao-button"
                          title="Remover opção"
                          aria-label="Remover opção"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={onAddOpcao} className="add-opcao-button">
                      <Plus size={14} />
                      Adicionar opção
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Card de Aviso - Aparece apenas quando Vincular está ativo */}
          {pergunta.vincularDadosAluno && (
            <div className="pergunta-aviso-card">
              <div className="aviso-icon">
                <Info size={20} />
              </div>
              <div className="aviso-content">
                <h4 className="aviso-title">
                  Pergunta Vinculada a Dados do Aluno
                </h4>
                <p className="aviso-text">
                  As respostas desta pergunta serão{" "}
                  <strong>
                    automaticamente salvas na ficha cadastral do aluno
                  </strong>
                  . O tipo de resposta, obrigatoriedade e opções disponíveis são
                  pré-definidos pela lista de dados vinculáveis e não podem ser
                  alterados manualmente.
                </p>
              </div>
            </div>
          )}

          {/* Rodapé com botão de salvar */}
          <div className="pergunta-footer">
            <button
              onClick={onSave}
              className="save-pergunta-footer-button"
              title="Salvar pergunta"
              aria-label="Salvar pergunta"
            >
              <Save size={16} />
              Salvar Pergunta
            </button>
          </div>
        </>
      ) : (
        // Estado salvo
        <>
          <div className="pergunta-header">
            <div className="pergunta-info">
              <span className="pergunta-numero">Pergunta {index + 1}</span>
              <span className="pergunta-tipo-badge">
                {pergunta.tipo === "multipla_escolha"
                  ? "Múltipla Escolha"
                  : pergunta.tipo === "multipla_selecao"
                    ? "Múltipla Seleção"
                    : pergunta.tipo === "texto"
                      ? "Texto"
                      : pergunta.tipo === "numero"
                        ? "Número"
                        : pergunta.tipo === "data"
                          ? "Data"
                          : pergunta.tipo === "arquivo"
                            ? "Arquivo"
                            : "Email"}
              </span>
              {pergunta.obrigatoria && (
                <span className="obrigatoria-badge">Obrigatória</span>
              )}
              {pergunta.vincularDadosAluno && (
                <span
                  className="vinculada-badge"
                  title="Vinculada a dados do aluno"
                >
                  Vinculada a dados
                </span>
              )}
            </div>
            <div className="pergunta-actions">
              <button
                onClick={onToggleEditing}
                className="edit-pergunta-button"
                title="Editar pergunta"
                aria-label="Editar pergunta"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={onDelete}
                className="delete-pergunta-button"
                title="Excluir pergunta"
                aria-label="Excluir pergunta"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="pergunta-preview">
            <p className="pergunta-texto">
              {pergunta.texto || "Pergunta sem texto"}
            </p>
            {(pergunta.tipo === "multipla_escolha" ||
              pergunta.tipo === "multipla_selecao") &&
              pergunta.opcoes &&
              pergunta.opcoes.length > 0 && (
                <div className="opcoes-preview">
                  {pergunta.opcoes
                    .filter((opcao) => opcao.trim())
                    .map((opcao, opcaoIndex) => (
                      <span key={opcaoIndex} className="opcao-preview">
                        {opcao}
                      </span>
                    ))}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default PerguntaItem;
