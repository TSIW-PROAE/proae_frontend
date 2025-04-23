import { Button } from "@heroui/button";
import "./DesignSystem.css";
import CardUserComponent from "@/components/Card-User-Component/CardUserComponent.tsx";
import SideBar from "@/components/Side Bar/SideBar.tsx";
import Alert from "@/components/Alert/Alert.tsx";

export default function DesignSystem() {
  return (
    <div>
      <h1>Design System</h1>
      <div className="component-section">
        <h2>Botões</h2>
        <div className="component-row">
          <Button color="primary">Primário</Button>
          <Button color="secondary">Secundário</Button>
          <Button color="success">Sucesso</Button>
          <Button color="warning">Alerta</Button>
          <Button color="danger">Perigo</Button>
        </div>
          <CardUserComponent aluno={{"nome": "Allan", "matricula": "2000222", "dataCadastro": "20/12/2200", "validade": "20/12/12", "status": "de boas", "foto": "", beneficios: [{"nome": "beneficio1", "edital": "sla", "validade": "20/12/2024", "status": "ativo"}]}}/>
          <SideBar homeIconRedirect={""} processIconRedirect={""} configIconRedirect={""} shouldShowDocsIcon={true} docsIconRedirect={""}/>
          <Alert titulo='Inscrição Confirmada' descricao='Inscrição realizada.' data='03/04'/>
          <Alert titulo='Documentação Negada' descricao='Caro aluno, por favor faça o reenvio do documento de matricula devidamente atualizado, conforme o especificado no item 2.3 do edital.' data='04/04'/>
          <Alert titulo='Documentação Pendente' descricao='Caro aluno, por favor faça o envio do CAD Único.' data='04/04'/>
      </div>
    </div>
  );
}
