/** GET /inscricoes/admin/:id/status-audit */
export interface InscricaoStatusAuditEntry {
  id: number;
  inscricao_id: number;
  actor_usuario_id: string | null;
  /** Nome do usuário PROAE/admin quando encontrado no cadastro */
  actor_nome?: string | null;
  status_anterior: string | null;
  status_novo: string;
  observacao: string | null;
  created_at: string;
}
