import SideBar from "@/components/Side Bar/SideBar";
import "./ConfiguracaoAluno.css";
import AlunoForm from "../../../components/FormularioConfiguracao/Form";

export default function ConfiguracaoAluno() {
  return (
    <div className="container">
      <SideBar
        homeIconRedirect="/portal-aluno"
        processIconRedirect="/portal-aluno/processos"
        configIconRedirect="/portal-aluno/configuracao"
        shouldShowDocsIcon={false}
        defaultSelected="config"
      />
      <div >
        <h1>
          Configurações do Aluno
        </h1>
        <div className="form">
          <AlunoForm />
        </div>
      </div>
    </div>
  );
}

