import React, { useState, useContext } from "react";
import { X, MessageSquare, CheckCircle2 } from "lucide-react";
import { AlunoInscrito, RespostaStep } from "../../types/inscricao";
import { validationService } from "../../services/ValidationService/validationService";
import { AuthContext } from "../../context/AuthContext";
import "./ModalRespostaAluno.css";

interface ModalRespostaAlunoProps {
  aluno: AlunoInscrito | null;
  questionarioId?: number | null;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ModalRespostaAluno({ aluno, questionarioId, onClose, onSaved }: ModalRespostaAlunoProps) {
  const { userInfo } = useContext(AuthContext as any);
  const [parecer, setParecer] = useState<string>("");
  const [status, setStatus] = useState<"pendente" | "aprovado" | "reprovado">("pendente");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!aluno) return null;

  const handleSalvar = async () => {
    if (!userInfo || !userInfo.id) {
      setMessage("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const dto = {
        parecer,
        status,
        responsavel_id: userInfo.id,
        questionario_id: questionarioId ?? null,
      } as any;

      await validationService.criarValidacao(dto);

      setMessage("Validação criada com sucesso.");
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error(err);
      setMessage(err?.mensagem || err?.message || "Erro ao criar validação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay resposta-modal" onClick={onClose}>
      <div className="modal-content resposta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3>Respostas - {aluno.nome}</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="aluno-info">
            <div><strong>Matrícula:</strong> {aluno.matricula}</div>
            <div><strong>Email:</strong> {aluno.email}</div>
            <div><strong>Curso:</strong> {aluno.curso} - {aluno.campus}</div>
          </div>

          <div className="respostas-list">
            <h4>Respostas do Questionário</h4>
            {!aluno.respostas_step || aluno.respostas_step.length === 0 ? (
              <div className="empty-respostas">Nenhuma resposta encontrada para este aluno.</div>
            ) : (
              <ul>
                {aluno.respostas_step!.map((r: RespostaStep) => (
                  <li key={r.pergunta_id} className="resposta-item">
                    <div className="pergunta">{r.pergunta_texto}</div>
                    <div className="resposta-text">{r.resposta_texto}</div>
                    <div className="resposta-meta">{new Date(r.data_resposta).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="validacao-form">
            <h4>Registrar Validação</h4>
            <label htmlFor="validacao-parecer">Parecer</label>
            <textarea id="validacao-parecer" value={parecer} onChange={(e) => setParecer(e.target.value)} placeholder="Escreva um parecer..." />

            <label htmlFor="validacao-status">Status</label>
            <select id="validacao-status" value={status} onChange={(e) => setStatus(e.target.value as any)} aria-label="Status da validação">
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
            </select>

            {message && <div className="action-message">{message}</div>}

            <div className="validacao-actions">
              <button className="btn-primary" onClick={handleSalvar} disabled={loading}>
                <CheckCircle2 className="w-4 h-4" />
                {loading ? "Salvando..." : "Salvar Validação"}
              </button>
              <button className="btn-cancel" onClick={onClose} disabled={loading}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
