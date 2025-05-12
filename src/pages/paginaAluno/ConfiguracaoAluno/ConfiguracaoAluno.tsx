import SideBar from "@/components/Side Bar/SideBar";
import "./ConfiguracaoAluno.css";

export default function ConfiguracaoAluno() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar on the left */}
      <SideBar
        homeIconRedirect="/portal-aluno"
        processIconRedirect="/portal-aluno/processos"
        configIconRedirect="/portal-aluno/configuracao"
        shouldShowDocsIcon={false}
        defaultSelected="config"
      />

      {/* Page content on the right */}
      <div style={{ flex: 1, padding: "2rem", backgroundColor: "#F4EBD0", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Configurações do Aluno
        </h1>
        <p style={{ marginBottom: "2rem" }}>
          Aqui você pode alterar suas configurações pessoais.
        </p>

        {/* Later: insert the form component here */}
      </div>
    </div>
  );
}

