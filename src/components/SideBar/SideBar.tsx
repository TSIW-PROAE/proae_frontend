import "./sidebar.css"
import { useNavigate } from 'react-router-dom';
import {useState} from "react";
import homeNotSelectedIcon from "../../assets/home-not-selected.svg";
import homeSelectedIcon from "../../assets/home-selected.svg";
import appsProcessNotSelectedIcon from "../../assets/apps-processos-not-selected.svg";
import appsProcessSelectedIcon from "../../assets/apps-processos-selected.svg";
import settingsNotSelectedIcon from "../../assets/settings-not-selected.svg";
import settingsSelectedIcon from "../../assets/settings-selected.svg";
import docsNotSelectedIcon from "../../assets/docs-not-selected.svg";
import docsSelectedIcon from "../../assets/docs-selected.svg";

export interface ISideBarProps {
    shouldShowDocsIcon?: boolean,
    homeIconRedirect: string,
    processIconRedirect: string,
    configIconRedirect: string,
    docsIconRedirect?: string
}

export interface ISideBarIconsConfig {
    srcNotSelectedIcon: string,
    srcSelectedIcon: string,
    alt: string,
    redirect: string,
    onClick: () => void,
    isIconSelected: boolean,
    shouldShowIcon: boolean
}

const SideBar = ({ homeIconRedirect, processIconRedirect, configIconRedirect, shouldShowDocsIcon = false, docsIconRedirect = ""}: ISideBarProps) => {
    const navigate = useNavigate();
    const [isHomeSelected, setIsHomeSelected] = useState(true);
    const [isProcessSelected, setIsProcessSelected] = useState(false);
    const [isConfigSelected, setIsConfigSelected] = useState(false);
    const [isDocsSelected, setIsDocsSelected] = useState(false);

    const icons: ISideBarIconsConfig[] = [
        {srcNotSelectedIcon: homeNotSelectedIcon, srcSelectedIcon: homeSelectedIcon, alt: 'home icon', redirect: homeIconRedirect, onClick: () => setIsHomeSelected((isHomeSelected) => !isHomeSelected), isIconSelected: isHomeSelected, shouldShowIcon: true},
        {srcNotSelectedIcon: appsProcessNotSelectedIcon, srcSelectedIcon: appsProcessSelectedIcon, alt: 'process icon', redirect: processIconRedirect, onClick: () => setIsProcessSelected((isProcessSelected) => !isProcessSelected), isIconSelected: isProcessSelected, shouldShowIcon: true},
        {srcNotSelectedIcon: settingsNotSelectedIcon, srcSelectedIcon: settingsSelectedIcon, alt: 'settings icon', redirect: configIconRedirect, onClick: () => setIsConfigSelected((isConfigSelected) => !isConfigSelected), isIconSelected: isConfigSelected, shouldShowIcon: true},
        {srcNotSelectedIcon: docsNotSelectedIcon, srcSelectedIcon: docsSelectedIcon, alt: 'docs icon', redirect: docsIconRedirect, onClick: () => setIsDocsSelected((isDocsSelected) => !isDocsSelected), isIconSelected: isDocsSelected, shouldShowIcon: shouldShowDocsIcon},
    ];

    function resetSelection() {
        setIsHomeSelected(false);
        setIsProcessSelected(false);
        setIsConfigSelected(false);
        setIsDocsSelected(false);
    }

    return (
        <>
            <aside id="sideBarWrapper">
                <div id="sideBar">
                    <div className="logo">
                        <h1>PROAE</h1>
                    </div>
                    {icons.map((iconConfig) => (
                        iconConfig.shouldShowIcon && (
                                    <div id="iconWrapper" style={iconConfig.isIconSelected ? {'border': '2px solid #27548A'} : {}}>
                                        <img src={iconConfig.isIconSelected ? iconConfig.srcSelectedIcon : iconConfig.srcNotSelectedIcon} alt={iconConfig.alt} key={iconConfig.alt} onClick={() => {navigate(iconConfig.redirect); resetSelection(); iconConfig.onClick();}}/>
                                    </div>
                            )
                        ))}
                </div>
            </aside>
        </>
    )
}
export default SideBar