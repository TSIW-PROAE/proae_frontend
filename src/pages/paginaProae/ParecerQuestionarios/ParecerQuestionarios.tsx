import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Chip, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  MessageSquare
} from 'lucide-react';
import { stepService } from '@/services/StepService/stepService';
import { validacaoService, Validacao } from '@/services/ValidacaoService/validacaoService';
import ParecerQuestionario from '@/components/ParecerQuestionario/ParecerQuestionario';
import { StepResponseDto } from '@/types/step';
import './ParecerQuestionarios.css';

interface QuestionarioComValidacao extends StepResponseDto {
  validacoes?: Validacao[];
  ultimaValidacao?: Validacao;
}

export default function ParecerQuestionarios() {
  const [questionarios, setQuestionarios] = useState<QuestionarioComValidacao[]>([]);
  const [questionariosFiltrados, setQuestionariosFiltrados] = useState<QuestionarioComValidacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<QuestionarioComValidacao | null>(null);
  const [showParecerModal, setShowParecerModal] = useState(false);

  useEffect(() => {
    carregarQuestionarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [questionarios, filtroStatus, termoBusca]);

  const carregarQuestionarios = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar todos os questionários (steps) de todos os editais
      // Como não temos um endpoint específico, vamos simular com dados de exemplo
      // Em um cenário real, você precisaria de um endpoint que retorne todos os questionários
      
      const questionariosData: QuestionarioComValidacao[] = [
        {
          id: 1,
          titulo: "Questionário de Documentação",
          texto: "Questionário para validação de documentos",
          perguntas: []
        },
        {
          id: 2,
          titulo: "Questionário Socioeconômico",
          texto: "Avaliação da situação socioeconômica do candidato",
          perguntas: []
        },
        {
          id: 3,
          titulo: "Questionário de Residência",
          texto: "Questionário para candidatos à residência universitária",
          perguntas: []
        }
      ];

      // Buscar validações para cada questionário
      const questionariosComValidacoes = await Promise.all(
        questionariosData.map(async (questionario) => {
          try {
            const validacoes = await validacaoService.buscarValidacoesPorQuestionario(questionario.id);
            const ultimaValidacao = validacoes.length > 0 ? validacoes[0] : undefined;
            
            return {
              ...questionario,
              validacoes,
              ultimaValidacao
            };
          } catch (err) {
            console.error(`Erro ao buscar validações para questionário ${questionario.id}:`, err);
            return {
              ...questionario,
              validacoes: [],
              ultimaValidacao: undefined
            };
          }
        })
      );

      setQuestionarios(questionariosComValidacoes);
    } catch (err) {
      setError('Erro ao carregar questionários. Tente novamente.');
      console.error('Erro ao carregar questionários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...questionarios];

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(q => {
        if (!q.ultimaValidacao) return filtroStatus === 'sem-parecer';
        return q.ultimaValidacao.status === filtroStatus;
      });
    }

    // Filtro por termo de busca
    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase();
      filtrados = filtrados.filter(q => 
        q.titulo.toLowerCase().includes(termo) ||
        q.texto.toLowerCase().includes(termo)
      );
    }

    setQuestionariosFiltrados(filtrados);
  };

  const handleVisualizarParecer = (questionario: QuestionarioComValidacao) => {
    setQuestionarioSelecionado(questionario);
    setShowParecerModal(true);
  };

  const handleParecerAtualizado = (validacao: Validacao) => {
    // Atualizar o questionário na lista
    setQuestionarios(prev => 
      prev.map(q => {
        if (q.id === validacao.questionario_id) {
          const validacoesAtualizadas = q.validacoes?.map(v => 
            v.id === validacao.id ? validacao : v
          ) || [validacao];
          
          return {
            ...q,
            validacoes: validacoesAtualizadas,
            ultimaValidacao: validacao
          };
        }
        return q;
      })
    );
  };

  const handleParecerCriado = (validacao: Validacao) => {
    // Adicionar nova validação ao questionário
    setQuestionarios(prev => 
      prev.map(q => {
        if (q.id === validacao.questionario_id) {
          return {
            ...q,
            validacoes: [validacao, ...(q.validacoes || [])],
            ultimaValidacao: validacao
          };
        }
        return q;
      })
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="w-4 h-4" />;
      case 'reprovado':
        return <XCircle className="w-4 h-4" />;
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'aprovado':
        return 'success';
      case 'reprovado':
        return 'danger';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (questionario: QuestionarioComValidacao) => {
    if (!questionario.ultimaValidacao) {
      return 'Sem parecer';
    }
    return questionario.ultimaValidacao.status.charAt(0).toUpperCase() + 
           questionario.ultimaValidacao.status.slice(1);
  };

  return (
    <div className="parecer-questionarios-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <FileText className="w-6 h-6" />
            <h1>Pareceres de Questionários</h1>
          </div>
          <p className="header-subtitle">
            Gerencie e visualize pareceres dos questionários do sistema
          </p>
        </div>
      </div>

      <div className="filters-section">
        <Card>
          <CardBody>
            <div className="filters-container">
              <div className="search-container">
                <Input
                  placeholder="Buscar questionários..."
                  value={termoBusca}
                  onValueChange={setTermoBusca}
                  startContent={<Search className="w-4 h-4" />}
                  className="search-input"
                />
              </div>
              
              <div className="filter-container">
                <Select
                  placeholder="Filtrar por status"
                  selectedKeys={[filtroStatus]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setFiltroStatus(selectedKey || 'todos');
                  }}
                  startContent={<Filter className="w-4 h-4" />}
                  className="status-filter"
                >
                  <SelectItem key="todos" value="todos">
                    Todos os status
                  </SelectItem>
                  <SelectItem key="sem-parecer" value="sem-parecer">
                    Sem parecer
                  </SelectItem>
                  <SelectItem key="pendente" value="pendente">
                    Pendente
                  </SelectItem>
                  <SelectItem key="aprovado" value="aprovado">
                    Aprovado
                  </SelectItem>
                  <SelectItem key="reprovado" value="reprovado">
                    Reprovado
                  </SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="questionarios-section">
        {isLoading ? (
          <div className="loading-container">
            <div className="text-center py-8">
              <div className="text-default-500">Carregando questionários...</div>
            </div>
          </div>
        ) : error ? (
          <Card>
            <CardBody className="text-center py-8">
              <div className="text-danger">{error}</div>
              <Button
                color="primary"
                variant="flat"
                onPress={carregarQuestionarios}
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </CardBody>
          </Card>
        ) : questionariosFiltrados.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">
                {termoBusca || filtroStatus !== 'todos' 
                  ? 'Nenhum questionário encontrado com os filtros aplicados.'
                  : 'Nenhum questionário encontrado.'
                }
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="questionarios-grid">
            {questionariosFiltrados.map((questionario) => (
              <Card key={questionario.id} className="questionario-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="questionario-info">
                    <h3 className="text-lg font-semibold">{questionario.titulo}</h3>
                    <p className="text-sm text-default-500">{questionario.texto}</p>
                  </div>
                  <Chip
                    color={getStatusColor(questionario.ultimaValidacao?.status)}
                    variant="flat"
                    startContent={getStatusIcon(questionario.ultimaValidacao?.status)}
                  >
                    {getStatusText(questionario)}
                  </Chip>
                </CardHeader>
                
                <CardBody>
                  <div className="questionario-stats">
                    <div className="stat-item">
                      <span className="stat-label">Perguntas:</span>
                      <span className="stat-value">{questionario.perguntas.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Pareceres:</span>
                      <span className="stat-value">{questionario.validacoes?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="questionario-actions">
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => handleVisualizarParecer(questionario)}
                      startContent={<Eye className="w-4 h-4" />}
                    >
                      Ver Pareceres
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={showParecerModal} 
        onClose={() => setShowParecerModal(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span>Pareceres do Questionário</span>
            </div>
          </ModalHeader>
          <ModalBody className="pb-6">
            {questionarioSelecionado && (
              <ParecerQuestionario
                questionarioId={questionarioSelecionado.id}
                tituloQuestionario={questionarioSelecionado.titulo}
                onParecerCriado={handleParecerCriado}
                onParecerAtualizado={handleParecerAtualizado}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

