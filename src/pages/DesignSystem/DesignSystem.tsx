import { Button } from "@heroui/button";
import "./DesignSystem.css";

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
      </div>
    </div>
  );
}
