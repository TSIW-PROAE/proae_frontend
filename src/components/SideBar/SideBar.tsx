import "./sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Settings,
  BookOpen,
  LogOut,
} from "lucide-react";
import React, { useState, useEffect } from "react";

export interface ISideBarProps {
  homeIconRedirect: string;
  processIconRedirect: string;
  configIconRedirect: string;
  docsIconRedirect: string;
  logoutIconRedirect: string;
  logoutOnClick: () => void;
}

export interface ISideBarIconsConfig {
  icon: React.ComponentType<{ className?: string }>;
  alt: string;
  label: string;
  redirect: string;
  shouldShowIcon: boolean;
  isLogout?: boolean;
}

const SideBar: React.FC<ISideBarProps> = ({
  homeIconRedirect,
  processIconRedirect,
  configIconRedirect,
  logoutIconRedirect,
  logoutOnClick,
  docsIconRedirect = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const icons: ISideBarIconsConfig[] = [
    {
      icon: Home,
      alt: "Home",
      label: "Início",
      redirect: homeIconRedirect,
      shouldShowIcon: homeIconRedirect !== "",
    },
    {
      icon: FileText,
      alt: "Processos",
      label: "Processos",
      redirect: processIconRedirect,
      shouldShowIcon: processIconRedirect !== "",
    },
    {
      icon: BookOpen,
      alt: "Documentos",
      label: "Documentos",
      redirect: docsIconRedirect,
      shouldShowIcon: docsIconRedirect !== "",
    },
    {
      icon: Settings,
      alt: "Configurações",
      label: "Config",
      redirect: configIconRedirect,
      shouldShowIcon: configIconRedirect !== "",
    },
    {
      icon: LogOut,
      alt: "Logout",
      label: "Sair",
      redirect: logoutIconRedirect,
      shouldShowIcon: true,
      isLogout: true,
    },
  ];

  const handleNavigation = (iconConfig: ISideBarIconsConfig) => {
    if (iconConfig.isLogout) {
      logoutOnClick();
      //navigate(logoutIconRedirect);
    } else {
      navigate(iconConfig.redirect);
    }
  };

  const Logo = () => (
    <div className="sidebar-logo">
      {!isMobile && (
        <div className="logo-text">
          <h1>PROAE</h1>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <nav className="mobile-bottom-nav">
        <div className="bottom-nav-container">
          {icons
            .filter((icon) => icon.shouldShowIcon)
            .map((iconConfig) => {
              const isCurrentIconSelected =
                location.pathname === iconConfig.redirect;
              const IconComponent = iconConfig.icon;

              return (
                <button
                  key={iconConfig.alt}
                  className={`nav-item ${isCurrentIconSelected ? "active" : ""} ${iconConfig.isLogout ? "logout" : ""}`}
                  onClick={() => handleNavigation(iconConfig)}
                  aria-label={iconConfig.alt}
                >
                  <div className="nav-icon">
                    <IconComponent className="icon" />
                  </div>
                  <span className="nav-label">{iconConfig.label}</span>
                </button>
              );
            })}
        </div>
      </nav>
    );
  }

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-container">
        <Logo />

        <nav className="sidebar-nav">
          {icons
            .filter((icon) => icon.shouldShowIcon)
            .map((iconConfig) => {
              const isCurrentIconSelected =
                location.pathname === iconConfig.redirect;
              const IconComponent = iconConfig.icon;

              return (
                <button
                  key={iconConfig.alt}
                  className={`nav-item ${isCurrentIconSelected ? "active" : ""} ${iconConfig.isLogout ? "logout" : ""}`}
                  onClick={() => handleNavigation(iconConfig)}
                  aria-label={iconConfig.alt}
                  title={iconConfig.alt}
                >
                  <div className="nav-icon">
                    <IconComponent className="icon" />
                  </div>
                  <span className="nav-label">{iconConfig.label}</span>
                </button>
              );
            })}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-brand">
            <div className="brand-line"></div>
            <span>Portal Estudantil</span>
            <div className="brand-line"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
