import FormularioDinamico from "../../components/FormularioDinamico/FormularioDinamico";
import logoUfba from "../../assets/logo-ufba.png";
import "./Inscricao.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { TipoInput, } from "@/types/dynamicForm";
import {InscricaoService} from "@/services/InscricaoService/inscricao.service";

export type FormsConfiguration = {
  titleInscricao: string;
  descricaoInscricao: string;
  pages: PageConfig[];
};

export type PageConfig = {
  titulo: string;
  inputs: InputsConfig[];
  botaoContinuar?: string;
};

export type InputsConfig = {
  titulo: string;
  nome: string;
  obrigatorio: boolean;
  tipo: TipoInput;
  // TODO: FORMATACAO
  formatacao?: any;
  placeholder?: string;
  opcoes?: Option[];
};

export type Option = {
  valor: string;
  label: string;
};

export type PagesResponse = {
  id: number;
  texto: string;
  perguntas: QuestionsResponse[];
};

export type QuestionsResponse = {
  id: number;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  // TODO: FORMATACAO
  tipo_formatacao: any;
  placeholder: string;
  opcoes: string[];
};

export type Answers = {
  vaga_id: number;
  respostas: Array<{
    perguntaId: number;
    valorTexto?: string;
    valorOpcoes?: string[];
    urlArquivo?: string;
  }>;
};


// TODO: Retirar service da camada de pages!
export default function Inscricao() {
  const inscricaoService = InscricaoService.getInstance();
  const location = useLocation();
  const { editalId, tituloEdital, descricaoEdital } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [pages, setPages] = useState<FormsConfiguration>({
    titleInscricao: tituloEdital,
    descricaoInscricao: descricaoEdital,
    pages: [],
  });

  useEffect(() => {
    const loadPages = async () => {
      try {
        const pages = await inscricaoService.fetchPagesInformation(editalId);
        const addedPages: PageConfig[] = [];
        pages.forEach((page: PagesResponse) => {
          let inputs: InputsConfig[] = [];
          page.perguntas.forEach((pergunta: QuestionsResponse) => {
            inputs.push({
              tipo: pergunta.tipo_Pergunta,
              titulo: pergunta.pergunta,
              nome: String(pergunta.id),
              obrigatorio: pergunta.obrigatoriedade,
              formatacao: pergunta.tipo_formatacao,
              placeholder: pergunta.placeholder,
              opcoes:
                pergunta.opcoes != null ? getOptions(pergunta.opcoes) : [],
            });
          });
          addedPages.push({ titulo: page.texto, inputs: inputs });
        });
        setPages((prev) => ({ ...prev, pages: addedPages }));
      } catch (e) {
        navigate("/portal-aluno");
      }
    };
    loadPages();
  }, []);

  const getOptions = (options: string[]): Option[] => {
    let optionsTyped: Option[] = [];
    options.forEach((option) => {
      optionsTyped.push({ valor: option, label: option });
    });
    return optionsTyped;
  };

  const handleFormSubmit = async (dados: Record<string, any>) => {
    // Extrair vaga_id dos dados (adicionado pelo FormularioDinamico)
    const { vaga_id, ...respostasData } = dados;
    
    if (!vaga_id) {
      console.error("Vaga não selecionada");
      return;
    }

    let answers: Answers = { vaga_id: vaga_id, respostas: [] };
    
    Object.entries(respostasData).forEach(([chave, valor]) => {
      const perguntaId = parseInt(chave);
      
      // Processar diferentes tipos de resposta
      if (Array.isArray(valor)) {
        // Para select múltiplo ou checkboxes
        answers.respostas.push({
          perguntaId: perguntaId,
          valorOpcoes: valor,
        });
      } else if (typeof valor === 'string' && valor.startsWith('http')) {
        // Para arquivos (URLs)
        answers.respostas.push({
          perguntaId: perguntaId,
          urlArquivo: valor,
        });
      } else {
        // Para texto, número, email, etc.
        answers.respostas.push({
          perguntaId: perguntaId,
          valorTexto: valor.toString(),
        });
      }
    });

    try {
      setIsLoading(true);
      await inscricaoService.saveInscricao(answers);
    } catch (e) {
      console.error("Error ao tentar salvar inscrição:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const configFormulario = {
    titulo: pages.titleInscricao,
    subtitulo: pages.descricaoInscricao,
    paginas: pages.pages,
    botaoFinal: "Enviar sua inscrição",
    rotaRedirecionamento: "/portal-aluno",
    rotaCancelamento: "/portal-aluno",
    logoSrc: logoUfba,
    onSubmit: handleFormSubmit,
    editalId: editalId,
  };

  return (
    <>
      <LoadingScreen
        isVisible={isLoading}
        message="Processando sua inscrição..."
      />
      <FormularioDinamico {...configFormulario} />
    </>
  );
}
