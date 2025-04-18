import pgcompLogo from "../assets/204805776.png";
import { Button } from "@heroui/react";

export default function Home() {
  return (
    <div>
      <div>
        <a href="https://github.com/TSIW-PROAE" target="_blank" rel="noopener">
          <img src={pgcompLogo} className="logo react" alt="Pgcomp logo" />
        </a>
      </div>
      <h1>Bem-vindo ao Sistema PROAE</h1>
      <div className="card">
        <p>Estamos em construção...</p>
        <Button color="primary">Clique Aqui</Button>
      </div>
    </div>
  );
}
