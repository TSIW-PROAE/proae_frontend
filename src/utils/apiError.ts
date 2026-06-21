import { humanizeValidationMessage } from './humanizeValidationMessage';

/**
 * Extrai mensagem legível de erros do Axios/Nest (`response.data`).
 */
export function getApiErrorMessage(err: unknown): string {
  const fallbackMessage = 'Não foi possível completar a operação. Tente novamente.';
  const isTechnicalMessage = (message: string): boolean => {
    const lower = message.toLowerCase();
    return (
      lower.includes('cannot read properties of undefined') ||
      lower.includes('undefined') ||
      lower.includes('null') ||
      lower.includes('network error') ||
      lower.includes('request failed') ||
      lower.includes('internal server error')
    );
  };

  if (err == null) return 'Erro desconhecido.';
  if (typeof err === 'string') return humanizeValidationMessage(err);
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;

    const errors = o.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors
        .map((e) => humanizeValidationMessage(String(e)))
        .filter(Boolean)
        .join(' ');
    }

    const m = o.message;
    if (Array.isArray(m)) {
      return m
        .map((x) => humanizeValidationMessage(String(x)))
        .filter(Boolean)
        .join(' ');
    }
    if (typeof m === 'string' && m.trim()) {
      const msg = humanizeValidationMessage(m);
      return isTechnicalMessage(msg) ? fallbackMessage : msg;
    }
    if (typeof o.error === 'string' && o.error.trim()) {
      const errText = o.error.trim();
      if (errText !== 'Bad Request' && errText !== 'Dados inválidos') {
        return humanizeValidationMessage(errText);
      }
    }
  }
  if (err instanceof Error && err.message) {
    const msg = humanizeValidationMessage(err.message);
    return isTechnicalMessage(msg) ? fallbackMessage : msg;
  }
  return fallbackMessage;
}
