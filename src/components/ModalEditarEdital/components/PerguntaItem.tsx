import React, { useState } from "react";
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
  X,
} from "lucide-react";
import { PerguntaEditorItem, DadoAluno } from "../types";

interface PerguntaItemProps {
  pergunta: PerguntaEditorItem;
  index: number;
  dadosAluno?: DadoAluno[]; // Lista de dados do aluno disponíveis
  onUpdate: (field: keyof PerguntaEditorItem, value: any) => void;
  onUpdateOpcao: (opcaoIndex: number, value: string) => void;
  onAddOpcao: () => void;
  onRemoveOpcao: (opcaoIndex: number) => void;
  onDelete: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onCreateDado?: (dado: Omit<DadoAluno, "id">) => Promise<DadoAluno | null>; // Função para criar novo dado
}

const PerguntaItem: React.FC<PerguntaItemProps> = ({
  pergunta,
  index,
  dadosAluno = [],
  onUpdate,
  onUpdateOpcao,
  onAddOpcao,
  onRemoveOpcao,
  onDelete,
  onToggleEditing,
  onSave,
  onCreateDado,
}) => {
  const [showModalNovoDado, setShowModalNovoDado] = useState(false);
  const [novoDado, setNovoDado] = useState<DadoAluno>({
    nome: "",
    tipo: "text",
    obrigatorio: false,
    opcoes: [],
  });
  const [opcoesTemp, setOpcoesTemp] = useState<string[]>([]);

  const handleSolicitarCriacaoDado = async () => {
    if (!novoDado.nome.trim()) {
      alert("Por favor, informe o nome do dado.");
      return;
    }

    // Verifica duplicidade
    const dadoDuplicado = dadosAluno.find(
      (d) => d.nome.toLowerCase().trim() === novoDado.nome.toLowerCase().trim()
    );

    if (dadoDuplicado) {
      alert(
        `Já existe um dado com o nome "${novoDado.nome}". Por favor, escolha outro nome.`
      );
      return;
    }

    // Se temos a função de criar, chama a API
    if (onCreateDado) {
      const dadoParaAdicionar: DadoAluno = {
        ...novoDado,
        opcoes:
          novoDado.tipo === "select" ? opcoesTemp.filter((o) => o.trim()) : [],
      };

      const created = await onCreateDado(dadoParaAdicionar);

      if (created && created.id) {
        // Limpa o formulário
        setNovoDado({
          nome: "",
          tipo: "text",
          obrigatorio: false,
          opcoes: [],
        });
        setOpcoesTemp([]);
        setShowModalNovoDado(false);

        // Seleciona automaticamente o dado recém-criado e atualiza o dadoId
        onUpdate(
          {
            dadoVinculado: created.nome,
            dadoId: created.id,
          } as any,
          undefined
        );

        alert("Dado criado com sucesso!");
      } else {
        alert("Erro ao criar o dado. Tente novamente.");
      }
    } else {
      // Fallback caso não tenha a função (não deveria acontecer)
      alert("Função de criação de dado não disponível.");
    }
  };

  return (
    <div
      className={`pergunta-item ${pergunta.isEditing ? "editing" : "saved"} ${
        pergunta.vincularDadosAluno && !pergunta.isEditing ? "vinculada" : ""
      }`}
      onClick={() => {
        if (!pergunta.isEditing) {
          onToggleEditing();
        }
      }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
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

                  <div className="select-with-button">
                    <select
                      value={pergunta.dadoVinculado || ""}
                      onChange={(e) => {
                        const nomeDado = e.target.value;
                        const dado = dadosAluno.find(
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
                          console.log("Atualizando dadoId para:", dado.id);

                          // Atualiza todos os campos de uma vez usando objeto, incluindo dadoId
                          const updates: any = {
                            dadoVinculado: nomeDado,
                            dadoId: dado.id, // Armazena o ID do dado
                            tipo: novoTipo,
                            obrigatoria: dado.obrigatorio,
                          };

                          if (dado.opcoes && dado.opcoes.length > 0) {
                            console.log(
                              "Atualizando opções para:",
                              dado.opcoes
                            );
                            updates.opcoes = dado.opcoes;
                          } else {
                            updates.opcoes = [];
                          }

                          console.log("Atualizando com:", updates);
                          onUpdate(updates as any, undefined);
                        } else {
                          // Se não houver dado, apenas limpa dadoVinculado e dadoId
                          onUpdate(
                            {
                              dadoVinculado: nomeDado,
                              dadoId: undefined,
                            } as any,
                            undefined
                          );
                        }
                      }}
                      aria-label="Dado do aluno"
                      className="select-dado-aluno"
                    >
                      <option value="">-- Selecione um dado --</option>
                      {dadosAluno.map((dado) => {
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
                    <button
                      type="button"
                      onClick={() => setShowModalNovoDado(true)}
                      className="btn-adicionar-dado"
                      title="Adicionar novo dado do aluno"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
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
                    const dadoSelecionado = dadosAluno.find(
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
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
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
        // Estado salvo (não editável)
        <>
          <div className="pergunta-header-saved">
            <span className="pergunta-numero-saved">Pergunta {index + 1}</span>
            <div className="pergunta-actions-saved">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditing();
                }}
                className="edit-pergunta-button-saved"
                title="Editar pergunta"
                aria-label="Editar pergunta"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="delete-pergunta-button-saved"
                title="Excluir pergunta"
                aria-label="Excluir pergunta"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="pergunta-content-saved">
            <div className="pergunta-texto-saved">
              {pergunta.texto || "Pergunta sem texto"}
            </div>

            {/* Opções para múltipla escolha/seleção */}
            {(pergunta.tipo === "multipla_escolha" ||
              pergunta.tipo === "multipla_selecao") &&
              pergunta.opcoes &&
              pergunta.opcoes.length > 0 && (
                <div className="opcoes-preview-saved">
                  <span className="opcoes-label">Alternativas:</span>
                  <div className="opcoes-list-saved">
                    {pergunta.opcoes
                      .filter((opcao) => opcao.trim())
                      .map((opcao, opcaoIndex) => (
                        <span key={opcaoIndex} className="opcao-item-saved">
                          {opcao}
                        </span>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {/* Footer com badges */}
          <div className="pergunta-footer-saved">
            <div className="pergunta-badges-footer">
              <span className="tipo-badge-saved">
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
                <span className="obrigatoria-badge-saved">
                  <CheckCircle size={12} />
                  Obrigatória
                </span>
              )}
              {pergunta.vincularDadosAluno && (
                <span
                  className="vinculada-badge-saved"
                  title={`Vinculada ao dado: ${pergunta.dadoVinculado || "N/A"}`}
                >
                  <Link2 size={12} />
                  {pergunta.dadoVinculado
                    ? `Vinculada a: ${pergunta.dadoVinculado}`
                    : "Vinculada"}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mini Modal para adicionar novo dado */}
      {showModalNovoDado && (
        <div
          className="mini-modal-overlay"
          onClick={() => setShowModalNovoDado(false)}
        >
          <div
            className="mini-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mini-modal-header">
              <h3>Adicionar Novo Dado do Aluno</h3>
              <button
                onClick={() => setShowModalNovoDado(false)}
                className="mini-modal-close"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Alerta de duplicidade */}
            <div className="alerta-duplicidade-modal">
              <AlertCircle size={18} />
              <span>
                Certifique-se de que esse tipo de dado já não existe para evitar
                duplicidade.
              </span>
            </div>

            <div className="mini-modal-body">
              <div className="mini-modal-field">
                <label>Nome do Dado *</label>
                <input
                  type="text"
                  value={novoDado.nome}
                  onChange={(e) =>
                    setNovoDado({ ...novoDado, nome: e.target.value })
                  }
                  placeholder="Ex: CPF, RG, Comprovante..."
                />
              </div>

              <div className="mini-modal-field">
                <label>Tipo *</label>
                <select
                  value={novoDado.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as DadoAluno["tipo"];
                    setNovoDado({ ...novoDado, tipo: novoTipo });
                    if (novoTipo !== "select") {
                      setOpcoesTemp([]);
                    }
                  }}
                  aria-label="Tipo do dado"
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Data</option>
                  <option value="select">Seleção (Múltipla Escolha)</option>
                  <option value="file">Documento/Arquivo</option>
                </select>
              </div>

              <div className="mini-modal-field">
                <label className="mini-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={novoDado.obrigatorio}
                    onChange={(e) =>
                      setNovoDado({
                        ...novoDado,
                        obrigatorio: e.target.checked,
                      })
                    }
                  />
                  <span>Campo obrigatório</span>
                </label>
              </div>

              {/* Opções para tipo select */}
              {novoDado.tipo === "select" && (
                <div className="mini-modal-field">
                  <label>Alternativas</label>
                  <div className="mini-modal-opcoes">
                    {opcoesTemp.map((opcao, idx) => (
                      <div key={idx} className="mini-modal-opcao-item">
                        <input
                          type="text"
                          value={opcao}
                          onChange={(e) => {
                            const novasOpcoes = [...opcoesTemp];
                            novasOpcoes[idx] = e.target.value;
                            setOpcoesTemp(novasOpcoes);
                          }}
                          placeholder={`Alternativa ${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const novasOpcoes = opcoesTemp.filter(
                              (_, i) => i !== idx
                            );
                            setOpcoesTemp(novasOpcoes);
                          }}
                          className="mini-modal-remove-opcao"
                          title="Remover alternativa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setOpcoesTemp([...opcoesTemp, ""])}
                      className="mini-modal-add-opcao"
                    >
                      <Plus size={14} />
                      Adicionar Alternativa
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mini-modal-footer">
              <button
                onClick={() => setShowModalNovoDado(false)}
                className="mini-modal-btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitarCriacaoDado}
                className="mini-modal-btn-save"
              >
                <Plus size={16} />
                Adicionar Dado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
    </div>
  );
};

export default PerguntaItem;
