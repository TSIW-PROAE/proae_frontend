import "./sidebar.css"
import { useNavigate } from 'react-router-dom';
import {useState} from "react";

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
        {srcNotSelectedIcon: '/home-not-selected.svg', srcSelectedIcon: '/home-selected.svg', alt: 'home icon', redirect: homeIconRedirect, onClick: () => setIsHomeSelected((isHomeSelected) => !isHomeSelected), isIconSelected: isHomeSelected, shouldShowIcon: true},
        {srcNotSelectedIcon: '/apps-processos-not-selected.svg', srcSelectedIcon: '/apps-processos-selected.svg', alt: 'process icon', redirect: processIconRedirect, onClick: () => setIsProcessSelected((isProcessSelected) => !isProcessSelected), isIconSelected: isProcessSelected, shouldShowIcon: true},
        {srcNotSelectedIcon: '/settings-not-selected.svg', srcSelectedIcon: '/settings-selected.svg', alt: 'settings icon', redirect: configIconRedirect, onClick: () => setIsConfigSelected((isConfigSelected) => !isConfigSelected), isIconSelected: isConfigSelected, shouldShowIcon: true},
        {srcNotSelectedIcon: '/docs-not-selected.svg', srcSelectedIcon: '/docs-selected.svg', alt: 'docs icon', redirect: docsIconRedirect, onClick: () => setIsDocsSelected((isDocsSelected) => !isDocsSelected), isIconSelected: isDocsSelected, shouldShowIcon: shouldShowDocsIcon},
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
                    <img id="proaeLogo" src="/PROAE.svg" alt="PROAE LOGO" />
                        {icons.map((iconConfig) => (
                            iconConfig.shouldShowIcon ? (
                                    <div id="icon-wrapper" style={iconConfig.isIconSelected ? {'border': '2px solid #27548A'} : {}}>
                                        <img src={iconConfig.isIconSelected ? iconConfig.srcSelectedIcon : iconConfig.srcNotSelectedIcon} alt={iconConfig.alt} key={iconConfig.alt} onClick={() => {navigate(iconConfig.redirect); resetSelection(); iconConfig.onClick();}}/>
                                    </div>
                            ) : null
                        ))}
                </div>
            </aside>
        </>
    )
}
export default SideBar