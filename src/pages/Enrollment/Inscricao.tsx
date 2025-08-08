import FormularioDinamico, {
  TipoInput,
  TipoFormatacao,
} from "../../components/FormularioDinamico/FormularioDinamico";
import logoUfba from "../../assets/logo-ufba.png";
import "./Inscricao.css";
import IHttpClient, {
  FetchAdapter,
} from "@/services/BaseRequestService/HttpClient.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.tsx";
import { getCookie } from "@/utils/utils";

export type FormsConfiguration = {
  titleInscricao: string;
  descricaoInscricao: string;
  pages: PageConfig[];
};

type PageConfig = {
  titulo: string;
  inputs: InputsConfig[];
  botaoContinuar?: string;
};

type InputsConfig = {
  titulo: string;
  nome: string;
  obrigatorio: boolean;
  tipo: TipoInput;
  formatacao?: TipoFormatacao;
  placeholder?: string;
  opcoes?: Option[];
};

type Option = {
  valor: string;
  label: string;
};

type PagesResponse = {
  id: number;
  texto: string;
  perguntas: QuestionsResponse[];
};

type QuestionsResponse = {
  id: number;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  tipo_formatacao: TipoFormatacao;
  placeholder: string;
  opcoes: string[];
};

type Answers = {
  edital: number;
  respostas: Array<{ pergunta_id: number; texto: string }>;
};

export class InscricaoService {
  private static instance: InscricaoService;
  private readonly httpClient: IHttpClient;
  private readonly url;
  private readonly headerToken: string;

  private constructor() {
    this.httpClient = new FetchAdapter();
    this.url = import.meta.env.VITE_API_URL_SERVICES;
    this.headerToken = getCookie("__session") || "";
  }

  static getInstance(): InscricaoService {
    if (!InscricaoService.instance) {
      InscricaoService.instance = new InscricaoService();
    }
    return InscricaoService.instance;
  }

  async fetchPagesInformation(editalId: number): Promise<PagesResponse[]> {
    return await this.httpClient.get<PagesResponse[]>(
      this.url + "/steps/edital/" + editalId,
      this.headerToken
    );
  }

  async saveInscricao(answers: Answers) {
    return await this.httpClient.post(
      this.url + "/inscricoes",
      answers,
      this.headerToken
    );
  }
}

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
    let answers: Answers = { edital: editalId, respostas: [] };
    Object.entries(dados).forEach(([chave, valor]) => {
      answers.respostas.push({
        pergunta_id: parseInt(chave),
        texto: Array.isArray(valor) ? valor.join(",") : valor.toString(),
      });
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
