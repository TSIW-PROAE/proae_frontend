import { useState } from "react";
import "./App.css";


function App() {
  const processos = [
    {
      titulo: "Seleção para benefícios PROAE - Campus Camaçari",
      status: "Inscrições abertas",
      cor: "green",
    },
    {
      titulo: "Seleção para benefícios PROAE - Campus Salvador",
      status: "Inscrições Encerradas",
      cor: "blue",
    },
    {
      titulo: "RENOVAÇÃO DOS BENEFÍCIOS DA PROAE 2025",
      status: "Inscrições Encerradas",
      cor: "blue",
    },
    {
      titulo: "Seleção para benefícios PROAE - Campus Vitória",
      status: "Inscrições abertas",
      cor: "green",
    },
  ];

  const [expandido, setExpandido] = useState(null);

  return (
    <div className="container">
      <h1 className="titulo">processos seletivos</h1>
      <div className="botoes-filtro">
        <button className="filtro">Todos</button>
        <button className="filtro">Inscrições abertas</button>
        <button className="filtro">Concluídos</button>
        <button className="filtro">Editais abertos</button>
      </div>
      {processos.map((processo, index) => (
        <div
          key={index}
          className={`card ${expandido === index ? "expandido" : ""}`}
          onClick={() => setExpandido(expandido === index ? null : index)}
        >
          <div className="card-header">
            <h2>{processo.titulo}</h2>
            <span className={`status ${processo.cor}`}>{processo.status}</span>
          </div>
          <p>{processo.edital}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
