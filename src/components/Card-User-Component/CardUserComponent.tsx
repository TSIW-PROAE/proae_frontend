import React from "react";
import "./card-user-aluno.css";

type Beneficio = {
  nome: string;
  edital: string;
  validade: string;
  status: "ativo" | "deferido";
};

type Aluno = {
  nome: string;
  matricula: string;
  dataCadastro: string;
  validade: string;
  status: string;
  foto: string;
  beneficios: Beneficio[];
};

interface AlunoDashboardProps {
  aluno: Aluno;
}

const AlunoDashboard: React.FC<AlunoDashboardProps> = ({ aluno }) => {
  return (
    <div className="dashboardContainer">
      <header className="dashboardHeader">
        <h2>Olá {aluno.nome.split(' ')[0]}, bem vindo ao portal do aluno!</h2>
        <span className="matricula">{aluno.matricula}</span>
      </header>

      <main className="dashboardContent">
        <section className="cardCadastro">
          <div className="cardInfo">
            <h3>Cadastro PROAE</h3>
            <p><strong>Nome:</strong> <br />{aluno.nome}</p>
            <p><strong>Matrícula:</strong> <br />{aluno.matricula}</p>
            <p><strong>Data de Cadastramento:</strong> <br />{aluno.dataCadastro}</p>
            <p><strong>Data de Validade:</strong> <br />{aluno.validade}</p>
          </div>
          <div className="cardFoto">
            <img src={aluno.foto} alt="Foto do aluno" />
            <span className="status ativo">{aluno.status}</span>
          </div>
        </section>

        <section className="beneficios">
          <h3>Meus benefícios</h3>
          {aluno.beneficios.map((b, index) => (
            <div key={index} className="beneficioCard">
              <div>
                <p className="beneficioNome">{b.nome}</p>
                <p className="beneficioEdital">{b.edital}</p>
              </div>
              <div className="beneficioDireita">
                <span className="beneficioData">{b.validade}</span>
                <span className={`beneficioStatus ${b.status === "ativo" ? "ativo" : "deferido"}`}>
                  {b.status === "ativo" ? "Benefício ativo" : "Deferido"}
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AlunoDashboard;
