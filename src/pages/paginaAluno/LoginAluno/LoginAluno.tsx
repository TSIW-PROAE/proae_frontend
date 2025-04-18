import { Button } from "@heroui/button";
import "./LoginAluno.css";

export default function LoginAluno() {
  return (
    <div>
      <h1>Login de Aluno</h1>
      <div className="login-container">
        <p>Área de login para alunos</p>
        <Button color="primary">Entrar</Button>
      </div>
    </div>
  );
}
