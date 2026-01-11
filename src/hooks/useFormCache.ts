import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { InscricaoService } from "@/services/InscricaoService/inscricao.service";
import toast from "react-hot-toast";

interface UseFormCacheProps {
  form: UseFormReturn<any>;
  vagaId: number | null;
  currentPage: number;
}

interface UseFormCacheReturn {
  saveToCache: (showToast?: boolean) => Promise<void>;
  loadFromCache: (vagaId: number) => Promise<boolean>;
  isSavingCache: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  clearCacheState: () => void;
}

/**
 * Hook para gerenciar cache/auto-save das respostas do formulário.
 */
export function useFormCache({ form, vagaId, currentPage }: UseFormCacheProps): UseFormCacheReturn {
  const [isSavingCache, setIsSavingCache] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const lastSavedDataRef = useRef<string>("");
  const inscricaoService = InscricaoService.getInstance();


  const prepareRespostasForCache = useCallback((data: Record<string, any>) => {
    return Object.entries(data)
      .filter(([key]) => key.startsWith('pergunta_'))
      .map(([key, value]) => {
        const perguntaId = parseInt(key.replace('pergunta_', ''));
        
        if (value instanceof File) {
          return { perguntaId, valorTexto: value.name };
        }
        
        if (Array.isArray(value)) {
          return {
            perguntaId,
            valorOpcoes: value,
            valorTexto: value.join(', ')
          };
        }
        
        if (value && typeof value === 'object' && 'year' in value) {
          const { year, month, day } = value as { year: number; month: number; day: number };
          return {
            perguntaId,
            valorTexto: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
          };
        }
        
        return {
          perguntaId,
          valorTexto: String(value || '')
        };
      });
  }, []);

  const saveToCache = useCallback(async (showToast = false) => {
    if (!vagaId || isSavingCache) return;

    const currentData = form.getValues();
    const respostas = prepareRespostasForCache(currentData);
    
    const currentDataString = JSON.stringify(respostas);
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    try {
      setIsSavingCache(true);
      await inscricaoService.salvarRespostas(vagaId, respostas);
      
      lastSavedDataRef.current = currentDataString;
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast.success('Progresso salvo!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
      if (showToast) {
        toast.error('Erro ao salvar progresso');
      }
    } finally {
      setIsSavingCache(false);
    }
  }, [vagaId, form, prepareRespostasForCache, isSavingCache]);


  const loadFromCache = useCallback(async (vagaId: number): Promise<boolean> => {
    try {
      const response = await inscricaoService.buscarRespostas(vagaId);
      
      if (!response?.respostas || response.respostas.length === 0) {
        return false;
      }

      const cachedData: Record<string, any> = {};
      
      response.respostas.forEach((resposta: any) => {
        const fieldName = `pergunta_${resposta.perguntaId}`;
        
        if (resposta.valorTexto?.endsWith('.pdf')) {
          cachedData[fieldName] = null;
        } else if (resposta.valorOpcoes?.length > 0) {
          cachedData[fieldName] = resposta.valorOpcoes;
        } else {
          cachedData[fieldName] = resposta.valorTexto || '';
        }
      });
      
      Object.entries(cachedData).forEach(([key, value]) => {
        if (value !== null) {
          form.setValue(key, value);
        }
      });
      
      lastSavedDataRef.current = JSON.stringify(response.respostas);
      setLastSavedAt(new Date());
      
      toast.success('Progresso anterior restaurado!', { duration: 3000 });
      return true;
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
      return false;
    }
  }, [form]);


  const clearCacheState = useCallback(() => {
    setHasUnsavedChanges(false);
    lastSavedDataRef.current = "";
  }, []);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (vagaId && currentPage > 0) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, vagaId, currentPage]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && vagaId) {
        saveToCache(false);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, vagaId, saveToCache]);

  return {
    saveToCache,
    loadFromCache,
    isSavingCache,
    lastSavedAt,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    clearCacheState
  };
}
