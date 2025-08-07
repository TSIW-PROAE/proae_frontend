import { Button } from "@heroui/button";
import { Link } from "react-router-dom";
import pgcompLogo from "../../assets/PGCOMP.png";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div>
      <a
        href="https://github.com/TSIW-PROAE"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <img
          src={pgcompLogo}
          className="logo react"
          style={{ width: "100px" }}
          alt="Pgcomp logo"
        />
      </a>
      <h1>404 - Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link to="/">
        <Button style={{marginTop: "20px"}} color="primary">Voltar à página inicial</Button>
      </Link>
    </div>
  );
}
