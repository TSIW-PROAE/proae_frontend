import styles from "./Alert.module.css";

import tickCircle from "../../assets/icon-tick-circle.png";
import warning from "../../assets/icon-attention.png";
import danger from "../../assets/icon-danger.png";

type AlertProps = {
    titulo: string;
    descricao: string;
    data: string;
    largura?: string;
};

// Associa cada alert com a classe do ícone correspondente
const iconMap: { [key: string]: string } = {
    "inscrição confirmada": tickCircle,
    "documentação aprovada": tickCircle,
    "documentação pendente": warning,
    "documentação negada": danger,
    "cancelado": danger,
};

function normalize(str: string) {
    return str.toLowerCase();
}

function Alert({ titulo, descricao, data, largura = '400px' }: AlertProps) {
    const normalizedTitle = normalize(titulo);
    const icon = iconMap[normalizedTitle] || warning;

    return (
        <div className={styles.aviso} style={{ width: largura }}>
            <div className={styles.conteudoPrincipal}>
                <div className={styles.icon}>
                    <img src={icon} alt={`Ícone para ${titulo}`} />
                </div>
                <div className={styles.texto}>
                    <p className={styles.titulo}>{titulo}</p>
                    <p className={styles.descricao}>{descricao}</p>
                </div>
            </div>
            <p className={styles.data}>{data}</p>
        </div>
    );
}

export default Alert;