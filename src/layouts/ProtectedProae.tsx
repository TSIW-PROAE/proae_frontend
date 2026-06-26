import SideBar from "@/components/SideBar/SideBar";

import { AuthContext } from "@/context/AuthContext";

import { useContext } from "react";

import { Outlet } from "react-router-dom";

import { canManageEditais } from "@/utils/authRoles";



export default function ProtectedRouteProae() {

  const { logout, userInfo } = useContext(AuthContext);



  // Perfil gerencial: editais, formulários e equipe PROAE. Demais perfis não veem esses atalhos.

  const podeGerenciar = canManageEditais(userInfo?.adminPerfil ?? null);



  return (

    <div className="app-layout app-layout--proae">

      <SideBar

        portalVariant="proae"

        homeIconRedirect={"/portal-proae/inscricoes"}

        processIconRedirect={podeGerenciar ? "/portal-proae/processos" : ""}

        alunosIconRedirect={"/portal-proae/alunos"}

        ranqueamentoIconRedirect={"/portal-proae/ranqueamento"}

        docsIconRedirect={""}

        configIconRedirect={"/portal-proae/configuracao"}

        pendenciasIconRedirect={""}

        tutorialRedirect={"/portal-proae/tutorial"}

        equipeIconRedirect={podeGerenciar ? "/portal-proae/equipe" : ""}

        logoutIconRedirect={"/"}

        logoutOnClick={logout}

      />



      <main className="main-content with-sidebar">

        <Outlet />

      </main>

    </div>

  );

}

