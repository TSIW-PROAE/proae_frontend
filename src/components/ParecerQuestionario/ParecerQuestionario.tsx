import React, { useState, useEffect, useContext } from 'react';
import { Button, Textarea, Select, SelectItem, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from 'lucide-react';
import { validacaoService, Validacao, CreateValidacaoRequest } from '@/services/ValidacaoService/validacaoService';
import { AuthContext } from '@/context/AuthContext';
import './ParecerQuestionario.css';

interface ParecerQuestionarioProps {
  questionarioId: number;
  tituloQuestionario: string;
  onParecerCriado?: (validacao: Validacao) => void;
  onParecerAtualizado?: (validacao: Validacao) => void;
}

export const ParecerQuestionario: React.FC<ParecerQuestionarioProps> = ({
  questionarioId,
  tituloQuestionario,
  onParecerCriado,
  onParecerAtualizado
}) => {
  const { userInfo } = useContext(AuthContext);
  const [validacoes, setValidacoes] = useState<Validacao[]>([]);
  const [novoParecer, setNovoParecer] = useState('');
  const [novoStatus, setNovoStatus] = useState<'pendente' | 'aprovado' | 'reprovado'>('pendente');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarValidacoes();
  }, [questionarioId]);

  const carregarValidacoes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const validacoesData = await validacaoService.buscarValidacoesPorQuestionario(questionarioId);
      setValidacoes(validacoesData);
    } catch (err) {
      setError('Erro ao carregar pareceres. Tente novamente.');
      console.error('Erro ao carregar validações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitParecer = async () => {
    if (!novoParecer.trim()) {
      setError('O parecer é obrigatório');
      return;
    }

    if (!userInfo?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const novaValidacao: CreateValidacaoRequest = {
        parecer: novoParecer.trim(),
        status: novoStatus,
        responsavel_id: userInfo.id,
        questionario_id: questionarioId,
        data_validacao: new Date().toISOString().split('T')[0]
      };

      const validacaoCriada = await validacaoService.criarValidacao(novaValidacao);
      
      setValidacoes(prev => [validacaoCriada, ...prev]);
      setNovoParecer('');
      setNovoStatus('pendente');
      setShowForm(false);
      
      if (onParecerCriado) {
        onParecerCriado(validacaoCriada);
      }
    } catch (err) {
      setError('Erro ao criar parecer. Tente novamente.');
      console.error('Erro ao criar validação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAprovar = async (validacaoId: number) => {
    try {
      const validacaoAtualizada = await validacaoService.aprovarValidacao(validacaoId);
      setValidacoes(prev => 
        prev.map(v => v.id === validacaoId ? validacaoAtualizada : v)
      );
      
      if (onParecerAtualizado) {
        onParecerAtualizado(validacaoAtualizada);
      }
    } catch (err) {
      setError('Erro ao aprovar validação');
      console.error('Erro ao aprovar:', err);
    }
  };

  const handleReprovar = async (validacaoId: number) => {
    try {
      const validacaoAtualizada = await validacaoService.reprovarValidacao(validacaoId);
      setValidacoes(prev => 
        prev.map(v => v.id === validacaoId ? validacaoAtualizada : v)
      );
      
      if (onParecerAtualizado) {
        onParecerAtualizado(validacaoAtualizada);
      }
    } catch (err) {
      setError('Erro ao reprovar validação');
      console.error('Erro ao reprovar:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="w-4 h-4" />;
      case 'reprovado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'success';
      case 'reprovado':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="parecer-questionario">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Pareceres - {tituloQuestionario}</h3>
          </div>
          <Button
            color="primary"
            variant="flat"
            onPress={() => setShowForm(!showForm)}
            isDisabled={isLoading}
          >
            {showForm ? 'Cancelar' : 'Novo Parecer'}
          </Button>
        </CardHeader>

        {showForm && (
          <CardBody className="border-t">
            <div className="space-y-4">
              <Textarea
                label="Parecer"
                placeholder="Digite seu parecer sobre este questionário..."
                value={novoParecer}
                onValueChange={setNovoParecer}
                minRows={3}
                maxRows={6}
                isRequired
              />
              
              <Select
                label="Status"
                placeholder="Selecione o status"
                selectedKeys={[novoStatus]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setNovoStatus(selectedKey as 'pendente' | 'aprovado' | 'reprovado');
                }}
              >
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

              {error && (
                <div className="text-danger text-sm">{error}</div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="light"
                  onPress={() => {
                    setShowForm(false);
                    setNovoParecer('');
                    setNovoStatus('pendente');
                    setError(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmitParecer}
                  isLoading={isSubmitting}
                  isDisabled={!novoParecer.trim()}
                >
                  Salvar Parecer
                </Button>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-default-500">Carregando pareceres...</div>
        </div>
      ) : validacoes.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-default-300 mb-4" />
            <p className="text-default-500">Nenhum parecer encontrado para este questionário.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {validacoes.map((validacao) => (
            <Card key={validacao.id} className="parecer-card">
              <CardBody>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Chip
                        color={getStatusColor(validacao.status)}
                        variant="flat"
                        startContent={getStatusIcon(validacao.status)}
                      >
                        {validacao.status.charAt(0).toUpperCase() + validacao.status.slice(1)}
                      </Chip>
                    </div>
                    
                    {validacao.status === 'pendente' && userInfo?.roles.includes('admin') && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => handleAprovar(validacao.id!)}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleReprovar(validacao.id!)}
                        >
                          Reprovar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="parecer-content">
                    <p className="text-default-700">{validacao.parecer}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-default-500">
                    {validacao.responsavel && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{validacao.responsavel.nome}</span>
                      </div>
                    )}
                    
                    {validacao.data_validacao && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(validacao.data_validacao)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParecerQuestionario;

