import pgcompLogo from "../../assets/PGCOMP.png";
import { Button } from "@heroui/button";
import "./Home.css";

export default function Home() {
  return (
    <div>
      <div>
        <a
          href="https://github.com/TSIW-PROAE"
          target="_blank"
          rel="noopener"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <img
            src={pgcompLogo}
            className="logo react"
            style={{ width: "100px" }}
            alt="Pgcomp logo"
          />
        </a>
      </div>
      <h1>Bem-vindo ao Sistema PROAE</h1>
      <div className="card">
        <p>Estamos em construção...</p>
      </div>
    </div>
  );
}
