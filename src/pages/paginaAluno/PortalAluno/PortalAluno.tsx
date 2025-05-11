// PortalAluno.tsx
import SideBar from "@/components/SideBar/SideBar";
import PageLayout from "@/pages/PageLayout/PageLayout";
import BenefitsCard from "@/components/BenefitsCard/BenefitsCard";
import OpenSelections from "@/pages/paginaAluno/PortalAluno/componentes/OpenSelections";
import "./PortalAluno.css";

export default function PortalAluno() {
  const benefits = [
    { name: "Plano de Saúde", date: "10/01/2025", active: true },
    { name: "Vale Refeição", date: "15/11/2024", active: false },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
  ];

  const openSelections = [
    {
      title: "Bolsa Permanência 2025.2",
      code: "05/2023",
      status: "Applications open",
    },
    {
      title: "Auxílio Moradia 2025.1",
      code: "05/2023",
      status: "Document Review",
    },
    {
      title: "Renovação de Benefícios 2025.1",
      code: "05/2023",
      status: "closed",
    },
  ];

  return (
    <PageLayout
      sidebar={
        <SideBar
          homeIconRedirect="/home"
          processIconRedirect="/process"
          configIconRedirect="/config"
        />
      }
    >
      <div className="max-w-[1500px] mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Olá Caio, bem vindo ao portal do aluno !
        </h1>

        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <div className="w-full lg:w-1/2">
            <BenefitsCard benefits={benefits} />
          </div>
          <div className="w-full lg:w-1/2">
            <OpenSelections selections={openSelections} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
