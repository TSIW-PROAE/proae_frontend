import "./sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Settings,
  BookOpen,
  LogOut,
  Users,
  ShieldCheck,
  ListChecks,
  CircleHelp,
  MoreHorizontal,
  ListOrdered,
} from "lucide-react";
import React, { useState, useEffect } from "react";

export interface ISideBarProps {
  homeIconRedirect: string;
  processIconRedirect: string;
  configIconRedirect: string;
  pendenciasIconRedirect: string;
  docsIconRedirect: string;
  pareceresIconRedirect?: string;
  alunosIconRedirect?: string;
  inscricoesIconRedirect?: string;
  ranqueamentoIconRedirect?: string;
  equipeIconRedirect?: string;
  tutorialRedirect?: string;
  portalVariant?: "aluno" | "proae";
  logoutIconRedirect: string;
  logoutOnClick: () => void;
}

export interface ISideBarIconsConfig {
  icon: React.ComponentType<{ className?: string }>;
  alt: string;
  label: string;
  redirect: string;
  shouldShowIcon: boolean;
  matchNested?: boolean;
  isLogout?: boolean;
}

interface NavSection {
  /** Rótulo pequeno acima do bloco (ex.: Cadastro, Gestão). */
  label?: string;
  items: ISideBarIconsConfig[];
  /** Configurações + Sair, fixos no rodapé da barra. */
  placement?: "footer";
}

const SideBar: React.FC<ISideBarProps> = ({
  homeIconRedirect,
  processIconRedirect,
  configIconRedirect,
  logoutIconRedirect,
  logoutOnClick,
  pendenciasIconRedirect = "",
  alunosIconRedirect = "",
  inscricoesIconRedirect = "",
  ranqueamentoIconRedirect = "",
  equipeIconRedirect = "",
  tutorialRedirect = "",
  portalVariant = "proae",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMoreOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setIsMobileMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMoreOpen) {
      return undefined;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMoreOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileMoreOpen]);

  const isPortalAluno = portalVariant === "aluno";
  const logoSubtitle = isPortalAluno ? "Portal do Aluno" : "Portal Admin";

  const footerNav: ISideBarIconsConfig[] = [
    {
      icon: Settings,
      alt: "Configurações",
      label: "Configurações",
      redirect: configIconRedirect,
      shouldShowIcon: configIconRedirect !== "",
    },
    {
      icon: LogOut,
      alt: "Sair",
      label: "Sair",
      redirect: logoutIconRedirect,
      shouldShowIcon: true,
      isLogout: true,
    },
  ];

  const navSections: NavSection[] = isPortalAluno
    ? [
        {
          label: "Acompanhamento",
          items: [
            {
              icon: Home,
              alt: "Início",
              label: "Início",
              redirect: homeIconRedirect,
              shouldShowIcon: homeIconRedirect !== "",
            },
            {
              icon: BookOpen,
              alt: "Pendências",
              label: "Pendências",
              redirect: pendenciasIconRedirect,
              shouldShowIcon: pendenciasIconRedirect !== "",
            },
          ],
        },
        {
          label: "Ajuda",
          items: [
            {
              icon: CircleHelp,
              alt: "Tutorial",
              label: "Tutorial",
              redirect: tutorialRedirect,
              shouldShowIcon: tutorialRedirect !== "",
            },
          ],
        },
        { label: "Conta", items: footerNav, placement: "footer" },
      ]
    : [
        {
          label: "Gestão",
          items: [
            {
              icon: FileText,
              alt: "Processos e editais",
              label: "Editais",
              redirect: processIconRedirect,
              shouldShowIcon: processIconRedirect !== "",
            },
            {
              icon: ShieldCheck,
              alt: "Equipe PROAE",
              label: "Equipe",
              redirect: equipeIconRedirect,
              shouldShowIcon: equipeIconRedirect !== "",
            },
          ],
        },
        {
          label: "Análise",
          items: [
            {
              icon: Home,
              alt: "Inscrições e análise",
              label: "Inscrições",
              redirect: homeIconRedirect,
              shouldShowIcon: homeIconRedirect !== "",
            },
            {
              icon: ListChecks,
              alt: "Gerenciar inscrições",
              label: "Análise",
              redirect: inscricoesIconRedirect,
              shouldShowIcon: inscricoesIconRedirect !== "",
            },
            {
              icon: ListOrdered,
              alt: "Ranqueamento e resultados",
              label: "Ranqueamento",
              redirect: ranqueamentoIconRedirect,
              shouldShowIcon: ranqueamentoIconRedirect !== "",
            },
            {
              icon: Users,
              alt: "Central de estudantes",
              label: "Estudantes",
              redirect: alunosIconRedirect,
              shouldShowIcon: alunosIconRedirect !== "",
            },
          ],
        },
        {
          label: "Suporte",
          items: [
            {
              icon: CircleHelp,
              alt: "Tutorial",
              label: "Tutorial",
              redirect: tutorialRedirect,
              shouldShowIcon: tutorialRedirect !== "",
            },
          ],
        },
        { label: "Conta", items: footerNav, placement: "footer" },
      ];

  const flatIcons = navSections.flatMap((s) => s.items);

  const handleNavigation = (iconConfig: ISideBarIconsConfig) => {
    if (isMobileMoreOpen) {
      setIsMobileMoreOpen(false);
    }
    if (iconConfig.isLogout) {
      logoutOnClick();
    } else {
      navigate(iconConfig.redirect);
    }
  };

  const renderNavButton = (iconConfig: ISideBarIconsConfig) => {
    const normalizePath = (path: string) =>
      path.length > 1 ? path.replace(/\/+$/, "") : path;

    const currentPath = normalizePath(location.pathname);
    const iconPath = normalizePath(iconConfig.redirect);

    const isCurrentIconSelected =
      currentPath === iconPath ||
      (Boolean(iconConfig.matchNested) &&
        iconPath !== "" &&
        currentPath.startsWith(`${iconPath}/`));
    const IconComponent = iconConfig.icon;
    return (
      <button
        key={`${iconConfig.alt}-${iconConfig.redirect}`}
        type="button"
        className={`nav-item ${isCurrentIconSelected ? "active" : ""} ${iconConfig.isLogout ? "logout" : ""}`}
        onClick={() => handleNavigation(iconConfig)}
        aria-label={iconConfig.alt}
        aria-current={isCurrentIconSelected ? "page" : undefined}
        title={iconConfig.alt}
      >
        <div className="nav-icon">
          <IconComponent className="icon" />
        </div>
        <span className="nav-label">{iconConfig.label}</span>
      </button>
    );
  };

  const renderSectionedNav = (ariaLabel: string) => (
    <nav
      className="sidebar-nav sidebar-nav--sectioned"
      aria-label={ariaLabel}
    >
      {navSections.map((section, idx) => {
        const visible = section.items.filter((i) => i.shouldShowIcon);
        if (visible.length === 0) return null;

        if (section.placement === "footer") {
          return (
            <React.Fragment key={`section-footer-${idx}`}>
              <div className="sidebar-nav-spacer" aria-hidden="true" />
              <div className="sidebar-nav-group sidebar-nav-group--footer">
                {section.label ? (
                  <span className="sidebar-section-label">{section.label}</span>
                ) : null}
                {visible.map(renderNavButton)}
              </div>
            </React.Fragment>
          );
        }

        return (
          <div
            key={`section-${section.label ?? idx}`}
            className={`sidebar-nav-group${section.label ? " sidebar-nav-group--labeled" : ""}`}
          >
            {section.label ? (
              <span className="sidebar-section-label">{section.label}</span>
            ) : null}
            {visible.map(renderNavButton)}
          </div>
        );
      })}
    </nav>
  );

  const visibleIcons = flatIcons.filter((icon) => icon.shouldShowIcon);
  const visiblePrimaryMobileIcons = navSections
    .filter((section) => section.placement !== "footer")
    .flatMap((section) => section.items)
    .filter((icon) => icon.shouldShowIcon);
  const visibleFooterMobileIcons = navSections
    .filter((section) => section.placement === "footer")
    .flatMap((section) => section.items)
    .filter((icon) => icon.shouldShowIcon);

  if (isMobile) {
    if (isPortalAluno) {
      return (
        <>
          <button
            type="button"
            className={`mobile-more-backdrop${isMobileMoreOpen ? " open" : ""}`}
            onClick={() => setIsMobileMoreOpen(false)}
            aria-label="Fechar menu de conta"
            tabIndex={isMobileMoreOpen ? 0 : -1}
          />

          <div
            id="mobile-account-menu"
            className={`mobile-more-sheet${isMobileMoreOpen ? " open" : ""}`}
            aria-hidden={!isMobileMoreOpen}
            aria-label="Ações da conta"
          >
            <span className="mobile-more-title">Conta</span>
            {visibleFooterMobileIcons.map(renderNavButton)}
          </div>

          <nav
            className={`mobile-bottom-nav mobile-bottom-nav--sectioned mobile-bottom-nav--aluno mobile-bottom-nav--with-more`}
            aria-label={isPortalAluno ? "Menu do estudante" : "Menu PROAE"}
          >
            <div className="bottom-nav-container">
              {visiblePrimaryMobileIcons.map(renderNavButton)}

              {visibleFooterMobileIcons.length > 0 ? (
                <button
                  type="button"
                  className={`nav-item mobile-more-trigger${isMobileMoreOpen ? " active open" : ""}`}
                  onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                  aria-label="Abrir menu de conta"
                  aria-controls="mobile-account-menu"
                  aria-expanded={isMobileMoreOpen}
                >
                  <div className="nav-icon">
                    <MoreHorizontal className="icon" />
                  </div>
                  <span className="nav-label">Mais</span>
                </button>
              ) : null}
            </div>
          </nav>
        </>
      );
    }

    return (
      <nav
        className={`mobile-bottom-nav mobile-bottom-nav--sectioned`}
        aria-label={isPortalAluno ? "Menu do estudante" : "Menu PROAE"}
      >
        <div className="bottom-nav-container">
          {visibleIcons.map(renderNavButton)}
        </div>
      </nav>
    );
  }

  return (
    <aside className="desktop-sidebar desktop-sidebar--sectioned">
      <div className="sidebar-container">
        <div className="sidebar-logo">
          <div className="logo-text">
            <h1>PROAE</h1>
            <p className="logo-subtitle">{logoSubtitle}</p>
          </div>
        </div>

        {renderSectionedNav(
          isPortalAluno ? "Menu do portal do estudante" : "Menu do portal PROAE",
        )}
      </div>
    </aside>
  );
};

export default SideBar;
