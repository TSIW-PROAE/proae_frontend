import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface TutorialStep {
  title: string;
  description: string;
  checklist?: string[];
  emoji?: string;
  mockup?: "pendencias" | "cadastro" | "edital" | "inscricao" | "homologacao";
  targetPath?: string;
  targetLabel?: string;
  tip?: string;
}

interface SystemTutorialProps {
  audienceLabel: string;
  intro: string;
  steps: TutorialStep[];
}

const AUTO_ADVANCE_MS = 7000;

export default function SystemTutorial({
  audienceLabel,
  intro,
  steps,
}: SystemTutorialProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const total = steps.length;
  const activeStep = useMemo(() => steps[activeIndex], [steps, activeIndex]);
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === total - 1;
  const doneCount = completedSteps.size;
  const isActiveDone = completedSteps.has(activeIndex);

  const renderMockup = () => {
    const kind = activeStep.mockup;
    const baseCard =
      "w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm";

    if (kind === "pendencias") {
      return (
        <div className={baseCard}>
          <div className="mb-2 h-2 w-20 rounded bg-amber-300" />
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-900">
              <span>Documento pendente</span>
              <span>Urgente</span>
            </div>
            <div className="flex items-center justify-between rounded bg-orange-50 px-2 py-1 text-[10px] text-orange-900">
              <span>Ajuste solicitado</span>
              <span>Prazo</span>
            </div>
          </div>
        </div>
      );
    }

    if (kind === "cadastro") {
      return (
        <div className={baseCard}>
          <div className="mb-2 h-2 w-24 rounded bg-blue-300" />
          <div className="space-y-2">
            <div className="h-2 rounded bg-slate-200" />
            <div className="h-2 rounded bg-slate-200" />
            <div className="h-2 rounded bg-slate-200" />
            <div className="mt-2 h-5 w-20 rounded bg-blue-500 text-center text-[10px] leading-5 text-white">
              Enviar
            </div>
          </div>
        </div>
      );
    }

    if (kind === "edital") {
      return (
        <div className={baseCard}>
          <div className="mb-2 h-2 w-28 rounded bg-emerald-300" />
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border border-slate-200 p-2 text-[10px]">
              Edital A
            </div>
            <div className="rounded border border-slate-200 p-2 text-[10px]">
              Edital B
            </div>
            <div className="col-span-2 rounded bg-emerald-50 p-2 text-[10px] text-emerald-900">
              Status: aberto
            </div>
          </div>
        </div>
      );
    }

    if (kind === "inscricao") {
      return (
        <div className={baseCard}>
          <div className="mb-2 h-2 w-20 rounded bg-purple-300" />
          <div className="space-y-2">
            <div className="rounded bg-slate-100 px-2 py-1 text-[10px]">Analise</div>
            <div className="rounded bg-slate-100 px-2 py-1 text-[10px]">Ajuste</div>
            <div className="rounded bg-emerald-50 px-2 py-1 text-[10px] text-emerald-900">
              Aprovada
            </div>
          </div>
        </div>
      );
    }

    if (kind === "homologacao") {
      return (
        <div className={baseCard}>
          <div className="mb-2 h-2 w-24 rounded bg-teal-300" />
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded bg-slate-100 px-2 py-1 text-[10px]">
              <span>Inscricao</span>
              <span>Aprovada</span>
            </div>
            <div className="flex items-center justify-between rounded bg-teal-50 px-2 py-1 text-[10px] text-teal-900">
              <span>Beneficio</span>
              <span>Homologado</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={baseCard}>
        <div className="h-2 w-24 rounded bg-slate-300" />
        <div className="mt-2 space-y-2">
          <div className="h-2 rounded bg-slate-200" />
          <div className="h-2 rounded bg-slate-200" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= total - 1) {
          setAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoPlay, total]);

  if (!total) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <PlayCircle className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold">Tutorial do Sistema</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Perfil: <strong>{audienceLabel}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-700">{intro}</p>
          <p className="mt-2 text-xs text-slate-500">
            Progresso: {doneCount}/{total} passos concluídos
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setAutoPlay((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {autoPlay ? (
                <>
                  <PauseCircle className="h-4 w-4" />
                  Pausar autoapresentacao
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Iniciar autoapresentacao
                </>
              )}
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Passo {activeIndex + 1} de {total}
              </p>
              <div className="flex h-[120px] items-center justify-center rounded-xl border border-dashed border-blue-200 bg-white">
                <span className="text-6xl leading-none animate-pulse">
                  {activeStep.emoji ?? "✨"}
                </span>
              </div>
              <div className="mt-3">{renderMockup()}</div>
              <p className="mt-3 text-xs text-slate-500">
                Navegacao manual. Use Proximo/Anterior ou selecione um passo abaixo.
              </p>
            </aside>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">{activeStep.title}</h2>
              <p className="mt-2 text-slate-700">{activeStep.description}</p>

              {activeStep.checklist?.length ? (
                <ul className="mt-4 space-y-2">
                  {activeStep.checklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {activeStep.tip ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <span className="font-semibold">Dica:</span> {activeStep.tip}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {activeStep.targetPath ? (
                  <button
                    type="button"
                    onClick={() => navigate(activeStep.targetPath as string)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
                  >
                    {activeStep.targetLabel ?? "Ir para esta tela"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    setCompletedSteps((prev) => {
                      const next = new Set(prev);
                      if (next.has(activeIndex)) {
                        next.delete(activeIndex);
                      } else {
                        next.add(activeIndex);
                      }
                      return next;
                    })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    isActiveDone
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isActiveDone ? "Passo concluído" : "Marcar como concluído"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              disabled={isFirstStep}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => Math.min(total - 1, prev + 1))}
              disabled={isLastStep}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold">Roteiro completo</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {steps.map((step, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  type="button"
                  key={`${step.title}-${index}`}
                  onClick={() => {
                    setAutoPlay(false);
                    setActiveIndex(index);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Passo {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{step.title}</p>
                  {completedSteps.has(index) ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Concluído
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
