// PortalAluno.tsx
import BenefitsCard from "@/components/BenefitsCard/BenefitsCard";
import PageLayout from "@/pages/PageLayout/PageLayout";
import OpenSelections from "@/pages/paginaAluno/PortalAluno/componentes/OpenSelections";
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PortalAlunoService from "@/services/PortalAluno/PortalAlunoService";
import { useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from 'react';
import "./PortalAluno.css";
import CandidateStatus from "./componentes/CandidateStatus";


interface ResponseData {
  dados: {
    beneficios: [];
  };
}
export default function PortalAluno() {
  const { user } = useClerk()
  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState('')
  const [benefits, setBenefts] = useState<any[]>([])
  const [openSelections, setOpenSelections] = useState<any[]>([])
  const [inscriptions, setInscriptions] = useState<any[]>([])
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setUserId(user.id)
    }
  }, [user])



  const client = new FetchAdapter()
  const portalAlunoService = new PortalAlunoService(client);

  const getBenefits = async () => {
    try {
        const response = await portalAlunoService.getBenefts();
        const data = (response as ResponseData).dados.beneficios;
        setBenefts(data);
      } catch (error) {
        console.error("Erro ao obter benefícios:", error);
      }
  }

  const getOpenSelections = async () => {
      try {
        const response = await portalAlunoService.getEditals();
        if (!response || !Array.isArray(response)) {
          throw new Error("Resposta inválida do servidor");
        }
        setOpenSelections(response);
      } catch (error) {
        console.error("Erro ao obter seleções abertas:", error);
      }
  };

   const getInscriptions = async () => {
      try {
        const response = await portalAlunoService.getInscriptions();
        console.log("Inscriptions response:", response);
        if (!response || !Array.isArray(response)) {
          throw new Error("Resposta inválida do servidor");
        }
        setInscriptions(response);
      } catch (error) {
        console.error("Erro ao obter seleções abertas:", error);
      }
  };

  useEffect(() => {
    if (userId) {
      getBenefits();
      getOpenSelections();
      getInscriptions();
    }
  }, [userId]);

  return (
    <PageLayout>
      <div className="max-w-[1500px] mx-auto">
        <h1 className="text-2xl font-normal text-[#1B3A4B] mb-6">
          Olá {firstName}, bem vindo ao portal do aluno !
        </h1>

        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <div className="w-full lg:w-1/2">
            <BenefitsCard benefits={benefits} />
          </div>
          <div className="w-full lg:w-1/2">
            <OpenSelections editais={openSelections} />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-medium text-[#1B3A4B] mb-3">
            Minhas últimas inscrições{" "}
          </h2>
          <div className="flex  flex-col gap-6">
            {inscriptions.length > 0 ? (
                inscriptions.map((edital) => (<CandidateStatus key={edital.id} edital={edital} />))
                ) : <h3>Você ainda não se inscreveu em nenhum edital.</h3>
            }
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
