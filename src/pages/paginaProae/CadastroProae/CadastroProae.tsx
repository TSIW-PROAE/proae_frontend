import {useForm, Controller} from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { verificarEmailInstitucional, validarCPFReal, formatCPF, formatPhone, formatarData } from "@/utils/validations";
import z from "zod"
import { Input } from '@heroui/input';
import { DatePicker } from '@heroui/react';
import {Button} from '@heroui/react';
import { toast, Toaster } from "react-hot-toast";
import { DefaultResponse } from '@/types/auth';
import {  useNavigate } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { AuthContext } from '@/context/AuthContext';
import { useContext, useEffect, useState } from 'react';

export const cadastroProaeFormSchema = z.object({
    cargo: z.string({error: 'Cargo não pode estar vazio'}).min(5, "O campo cargo é obrigatório"),
    email: z.email({error: "Email inválido"}).refine((val) => {
        return verificarEmailInstitucional(val, "@ufba.br");
    }, {error: "O email deve ser do domínio @ufba.br"}),
    senha: z.string({error: "Senha inválida"}).min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string({error: "Confirmação de senha inválida"}).min(6, "A confirmação de senha deve ter no mínimo 6 caracteres"),
    nome: z.string({error: "O campo nome é obrigatório"}).min(2, "Nome deve ter no mínimo 2 caracteres"),
    data_nascimento: z.string({error: "Data de nascimento é obrigatória"}).min(1, "Data de nascimento é obrigatória"),
    cpf: z.string({error: "O campo CPF é obrigatório"}).refine((val) => {
        return validarCPFReal(val);
    }, {error: "CPF inválido"}),
    celular: z.string({error: "O campo celular é obrigatório"}).min(10, "O campo celular é obrigatório"),
}).refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem"
})

export type CadastroFormData = z.infer<typeof cadastroProaeFormSchema>;

export default function CadastroProae() {
    const {control, handleSubmit, formState: { errors } } = useForm<CadastroFormData>({
        resolver: zodResolver(cadastroProaeFormSchema),
        mode: "onBlur",
    }); 
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, registerAdmin} = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        if(isAuthenticated){
            navigate("portal-proae/inscricoes");
        }
    }, [isAuthenticated]);



    const onSubmit = async (data: CadastroFormData) => {
        try {
            setIsLoading(true);
            const response = await registerAdmin(data)
            if (response.sucesso) {
                toast.success(response.mensagem);
                navigate("/login");
            }
            
        } catch (error) {
                toast.error((error as DefaultResponse).mensagem || "Erro ao realizar cadastro. Tente novamente.");
        }finally{
            setIsLoading(false);
        }
    }

  return (
    <section className='w-full min-h-screen flex items-center justify-center bg-[#183b4e] py-6 px-4'>
        <Toaster position="top-right" />
        <div className='w-full max-w-2xl h-auto p-8 space-y-6 bg-white rounded-lg shadow-md py-4 md:py-6'>
            <h2 className='text-2xl font-bold text-center'>Cadastro PROAE</h2>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
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
                            value={field.value ? undefined : null}
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
                            type='password'
                            variant='bordered'
                            isInvalid={!!errors.senha}
                            errorMessage={errors.senha?.message}
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
                            type='password'
                            variant='bordered'
                            isInvalid={!!errors.confirmarSenha}
                            errorMessage={errors.confirmarSenha?.message}
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
