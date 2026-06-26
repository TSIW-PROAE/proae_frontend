import { useForm, Controller, type FieldErrors } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { verificarEmailInstitucional, validarCPFReal, formatCPF, formatPhone, formatarData, formatarCelular } from "@/utils/validations";
import { parseDate } from "@internationalized/date";
import { getApiErrorMessage } from "@/utils/apiError";
import { humanizeValidationMessage } from "@/utils/humanizeValidationMessage";
import z from "zod"
import { Input } from '@heroui/input';
import { DatePicker, Select, SelectItem } from '@heroui/react';
import {Button} from '@heroui/react';
import { toast, Toaster } from "react-hot-toast";
import {  useNavigate } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { AuthContext } from '@/context/AuthContext';
import { useContext, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const ADMIN_PERFIL_OPCOES = [
    { value: "tecnico", label: "Técnico — análise de inscrições" },
    { value: "gerencial", label: "Gerencial — editais e equipe PROAE" },
    { value: "coordenacao", label: "Coordenação — apenas consulta" },
] as const;

export const cadastroProaeFormSchema = z.object({
    cargo: z.string({error: 'Cargo não pode estar vazio'}).min(5, "O campo cargo é obrigatório"),
    perfil: z.enum(["tecnico", "gerencial", "coordenacao"], {
        error: "Selecione um perfil de acesso",
    }),
    email: z.email({error: "Email inválido"}).refine((val) => {
        return verificarEmailInstitucional(val, "@ufba.br");
    }, {error: "O email deve ser do domínio @ufba.br"}),
    senha: z
        .string({ error: "Senha inválida" })
        .min(8, "Use pelo menos 8 caracteres (letras, números e símbolos — o servidor valida força da senha)"),
    confirmarSenha: z
        .string({ error: "Confirmação de senha inválida" })
        .min(8, "A confirmação deve ter no mínimo 8 caracteres"),
    nome: z.string({error: "O campo nome é obrigatório"}).min(2, "Nome deve ter no mínimo 2 caracteres"),
    data_nascimento: z
        .string({ error: "Informe sua data de nascimento." })
        .min(1, "Informe sua data de nascimento.")
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Selecione uma data válida no calendário (dia, mês e ano).",
        ),
    cpf: z.string({error: "O campo CPF é obrigatório"}).refine((val) => {
        return validarCPFReal(val);
    }, {error: "CPF inválido"}),
    celular: z
        .string({ error: "Informe seu celular com DDD." })
        .min(14, "Informe o celular completo com DDD, por exemplo (71) 99999-9999."),
}).refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem"
})

export type CadastroFormData = z.infer<typeof cadastroProaeFormSchema>;

export default function CadastroProae() {
    const {control, handleSubmit, formState: { errors } } = useForm<CadastroFormData>({
        resolver: zodResolver(cadastroProaeFormSchema),
        mode: "onSubmit",
        defaultValues: { perfil: "gerencial" },
    }); 
    const [isLoading, setIsLoading] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
    const { isAuthenticated, registerAdmin, checkAuth } = useContext(AuthContext);

    const navigate = useNavigate();

    const onSubmit = async (data: CadastroFormData) => {
        try {
            setIsLoading(true);
            const payload = {
                ...data,
                celular: formatarCelular(data.celular),
            };
            const response = await registerAdmin(payload);
            const legacySuccess = (response as unknown as { success?: boolean | string }).success;
            const ok =
                response.sucesso === true ||
                legacySuccess === true ||
                legacySuccess === "true";
            if (ok) {
                toast.success(response.mensagem || "Cadastro enviado. Aguarde aprovação da equipe.");
                if (isAuthenticated) {
                    await checkAuth();
                    navigate("/tela-de-espera", { replace: true });
                } else {
                    navigate("/login");
                }
            } else {
                toast.error(response.mensagem || "Não foi possível concluir o cadastro.");
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const onInvalid = (fieldErrors: FieldErrors<CadastroFormData>) => {
        const first = Object.values(fieldErrors)[0];
        const raw =
            first && "message" in first && typeof first.message === "string"
                ? first.message
                : null;
        toast.error(
            raw ? humanizeValidationMessage(raw) : "Revise os campos destacados antes de enviar.",
        );
    };

  return (
    <section className='w-full min-h-screen flex items-center justify-center bg-[#183b4e] py-6 px-4'>
        <Toaster position="top-right" />
        <div className='w-full max-w-2xl h-auto p-8 space-y-6 bg-white rounded-lg shadow-md py-4 md:py-6'>
            <h2 className='text-2xl font-bold text-center'>Cadastro PROAE</h2>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className='flex flex-col gap-4' noValidate>
                <div>
                    <Controller
                        name='nome'
                        control={control}
                        render={({ field }) => 
                        <Input {...field} 
                            placeholder='Digite seu Nome'
                            label='Nome'
                            variant='bordered'
                            isInvalid={!!errors.nome}
                            errorMessage={errors.nome?.message}
                            />
                    }
                    />
                </div>

                <div>
                    <Controller
                        name='email'
                        control={control}
                        render={({ field }) => 
                        <Input {...field} 
                            placeholder='exemplo@ufba.br'
                            label='Email'
                            variant='bordered'
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                            />
                    }
                    />
                  
                </div>
                 <div>
                    <Controller
                        name='cargo'
                        control={control}
                        render={({ field }) => 
                        <Input {...field} 
                            placeholder='Digite seu Cargo'
                            label='Cargo'
                            variant='bordered'
                            isInvalid={!!errors.cargo}
                            errorMessage={errors.cargo?.message}
                            />
                    }
                    />
                </div>
                <div>
                    <Controller
                        name='perfil'
                        control={control}
                        render={({ field }) => (
                            <Select
                                label='Perfil de acesso'
                                variant='bordered'
                                placeholder='Selecione o perfil'
                                selectedKeys={field.value ? [field.value] : []}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0];
                                    if (value) field.onChange(String(value));
                                }}
                                isInvalid={!!errors.perfil}
                                errorMessage={errors.perfil?.message}
                                description='Será revisado pela equipe na aprovação do cadastro.'
                            >
                                {ADMIN_PERFIL_OPCOES.map((opt) => (
                                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </Select>
                        )}
                    />
                </div>
                <div>
                    <Controller
                        name='cpf'
                        control={control}
                        render={({ field }) => 
                        <Input {...field} 
                            placeholder='Digite seu CPF'
                            label='CPF'
                            variant='bordered'
                            onChange = {(val) => field.onChange(formatCPF(val.target.value))}
                            isInvalid={!!errors.cpf}
                            errorMessage={errors.cpf?.message}
                            />
                    }
                    />
                </div>
                <div>
                    <Controller
                        name='celular'
                        control={control}
                        render={({ field }) => 
                        <Input {...field} 
                            placeholder='Digite seu celular'
                            label='Celular'
                            variant='bordered'
                            onChange = {(val) => field.onChange(formatPhone(val.target.value))}
                            isInvalid={!!errors.celular}
                            errorMessage={errors.celular?.message}
                            />
                    }
                    />
                </div>
                <div>
                    <Controller
                        name='data_nascimento'
                        control={control}
                        render={({ field }) => 
                        <DatePicker 
                            label="Data de Nascimento"
                            variant='bordered'
                            isRequired
                            value={
                              field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                                ? parseDate(field.value)
                                : null
                            }
                            onChange={(val) => field.onChange(formatarData(val))}
                            isInvalid={!!errors.data_nascimento}
                            errorMessage={errors.data_nascimento?.message}
                            />
                    }
                    />
                </div>

                <div>
                    <Controller
                        name='senha'
                        control={control}
                        render={({ field }) => 
                        <Input {...field}
                            placeholder='Digite sua senha'
                            label='Senha'
                            type={showSenha ? 'text' : 'password'}
                            variant='bordered'
                            isInvalid={!!errors.senha}
                            errorMessage={errors.senha?.message}
                            classNames={{ innerWrapper: "items-center", input: "pr-10" }}
                            endContent={
                              <button type="button" className="p-1 focus:outline-none" onClick={() => setShowSenha(!showSenha)} aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}>
                                {showSenha ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                              </button>
                            }
                        />
                    }
                    />
                </div>


                <div>
                    <Controller
                        name='confirmarSenha'
                        control={control}
                        render={({ field }) => 
                        <Input {...field}
                            placeholder='Digite sua senha'
                            label='Confirmar Senha'
                            type={showConfirmarSenha ? 'text' : 'password'}
                            variant='bordered'
                            isInvalid={!!errors.confirmarSenha}
                            errorMessage={errors.confirmarSenha?.message}
                            classNames={{ innerWrapper: "items-center", input: "pr-10" }}
                            endContent={
                              <button type="button" className="p-1 focus:outline-none" onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} aria-label={showConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}>
                                {showConfirmarSenha ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                              </button>
                            }
                        />
                    }
                    />
                </div>
                
                <Button 
                    type='submit'
                    variant='solid'
                    fullWidth
                    className='bg-[#183b4e] hover:bg-[#14526d] text-white p-6 rounded-xl font-[600] text-base'
                    disabled={isLoading}
                    >
                    {isLoading ? <Spinner size="md" className="text-white" /> : 'Cadastrar'}
                </Button>
                <a href="/login" className='text-[#183b4e] underline text-center md:text-base text-sm'>Já possui uma conta? Faça login</a>
                
            </form>
        </div>
    </section>
  );
}
