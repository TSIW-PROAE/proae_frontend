import "./ConfiguracaoAluno.css";
import AlunoForm from "../../../components/FormularioConfiguracao/Form";

export default function ConfiguracaoAluno() {
  return (
    <div className="container">
      <div id="page-config-wrapper">
        <div id="title">
          <h1>Perfil do Aluno</h1>
        </div>
        <div className="form">
            <AlunoForm />
        </div>
      </div>
    </div>
  );
}

