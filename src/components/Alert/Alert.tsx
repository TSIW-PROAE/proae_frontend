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

//Por padrão esse componente tem 400px de largura, mas dá pra passar um valor diferente via props
function Alert({ titulo, descricao, data, largura = '400px' }: AlertProps) {
    const normalizedTitle = normalize(titulo);
    const icon = iconMap[normalizedTitle];

    return (
        <div className={styles.aviso} style={{ width: largura }}>
            <div className={styles.conteudoPrincipal}>
                <img className={styles.icon} src={icon} alt={`Ícone para ${titulo}`} />
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