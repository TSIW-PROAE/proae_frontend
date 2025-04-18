import { Button } from "@heroui/react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1>404 - Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link to="/">
        <Button color="primary">Voltar à página inicial</Button>
      </Link>
    </div>
  );
}
