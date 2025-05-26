import "./sidebar.css"
import { useNavigate, useLocation } from 'react-router-dom';
import homeNotSelectedIcon from "../../assets/home-not-selected.svg";
import homeSelectedIcon from "../../assets/home-selected.svg";
import appsProcessNotSelectedIcon from "../../assets/apps-processos-not-selected.svg";
import appsProcessSelectedIcon from "../../assets/apps-processos-selected.svg";
import settingsNotSelectedIcon from "../../assets/settings-not-selected.svg";
import settingsSelectedIcon from "../../assets/settings-selected.svg";
import docsNotSelectedIcon from "../../assets/docs-not-selected.svg";
import docsSelectedIcon from "../../assets/docs-selected.svg";
import logoutIcon from "../../assets/logout-svgrepo-com 1.svg"
import React from "react";

export interface ISideBarProps {
    shouldShowDocsIcon?: boolean,
    homeIconRedirect: string,
    processIconRedirect: string,
    configIconRedirect: string,
    docsIconRedirect?: string,
    logoutIconRedirect: string,
    logoutOnClick: () => void,
}

export interface ISideBarIconsConfig {
    srcNotSelectedIcon: string,
    srcSelectedIcon: string,
    alt: string,
    redirect: string,
    shouldShowIcon: boolean
}

const SideBar: React.FC<ISideBarProps> = ({homeIconRedirect, processIconRedirect, configIconRedirect, logoutIconRedirect, logoutOnClick, shouldShowDocsIcon = false, docsIconRedirect = ""}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const icons: ISideBarIconsConfig[] = [
        {srcNotSelectedIcon: homeNotSelectedIcon, srcSelectedIcon: homeSelectedIcon, alt: 'Home', redirect: homeIconRedirect, shouldShowIcon: true},
        {srcNotSelectedIcon: appsProcessNotSelectedIcon, srcSelectedIcon: appsProcessSelectedIcon, alt: 'Processos', redirect: processIconRedirect, shouldShowIcon: true},
        {srcNotSelectedIcon: settingsNotSelectedIcon, srcSelectedIcon: settingsSelectedIcon, alt: 'Configurações', redirect: configIconRedirect, shouldShowIcon: true},
        {srcNotSelectedIcon: docsNotSelectedIcon, srcSelectedIcon: docsSelectedIcon, alt: 'Documentos', redirect: docsIconRedirect, shouldShowIcon: shouldShowDocsIcon},
        {srcNotSelectedIcon: logoutIcon, srcSelectedIcon: logoutIcon, alt: 'Logout', redirect: logoutIconRedirect, shouldShowIcon: true}
    ];

    return (
        <>
            <aside id="sideBarWrapper">
                <div id="sideBar">
                    <div className="logo">
                        <h1>PROAE</h1>
                    </div>
                    {icons.map((iconConfig) => {
                        const isCurrentIconSelected = location.pathname === iconConfig.redirect;

                        if (iconConfig.alt === 'Logout') {
                            return iconConfig.shouldShowIcon && (
                                <div id="option-wrapper">
                                    <div key={iconConfig.alt} id="iconWrapper">
                                        <img src={iconConfig.srcNotSelectedIcon} alt={iconConfig.alt} onClick={() => {logoutOnClick(); navigate(logoutIconRedirect)}} />
                                    </div>
                                    <p>{iconConfig.alt}</p>
                                </div>
                            );
                        }

                        return (
                            iconConfig.shouldShowIcon && (
                                <div id="option-wrapper">
                                    <div key={iconConfig.alt} id="iconWrapper" style={isCurrentIconSelected ? {'border': '2px solid #27548A'} : {}}>
                                        <img src={isCurrentIconSelected ? iconConfig.srcSelectedIcon : iconConfig.srcNotSelectedIcon}
                                             alt={iconConfig.alt} onClick={() => {navigate(iconConfig.redirect)}}/>
                                    </div>
                                    <p>{iconConfig.alt}</p>
                                </div>
                            )
                        );
                    })}
                </div>
            </aside>
        </>
    )
}
export default SideBar