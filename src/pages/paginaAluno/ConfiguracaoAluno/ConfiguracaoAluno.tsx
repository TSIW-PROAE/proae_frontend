import SideBar from "@/components/Side Bar/SideBar";
import "./ConfiguracaoAluno.css";
import AlunoForm from "../../../components/FormularioConfiguracao/Form";

export default function ConfiguracaoAluno() {
  return (
    <div className="container">
      <div id="side-bar">
        <SideBar
          homeIconRedirect="/portal-aluno"
          processIconRedirect="/portal-aluno/processos"
          configIconRedirect="/portal-aluno/configuracao"
          shouldShowDocsIcon={false}
          defaultSelected="config"
        />
      </div>
      <div id="page-config-wrapper">
        <div id="title">
          <h1>Configurações do Aluno</h1>
        </div>
        <div className="form">
            <AlunoForm />
        </div>
      </div>
    </div>
  );
}

