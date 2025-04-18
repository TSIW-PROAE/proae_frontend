import styles from "./Status.module.css";

type StatusProps = {
  titulo: string;
};

// Associa cada status com a classe correspondente para ficar na cor certa
function Status({ titulo }: StatusProps) {
  const statusClassMap: Record<string, string> = {
    "benefício ativo": styles.positivo,
    "benefício inativo": styles.negativo,
    "deferido": styles.positivo,
    "indeferido": styles.negativo,
    "inscrições abertas": styles.positivo,
    "inscrições encerradas": styles.negativo,
    "aprovado": styles.positivo,
    "reprovado": styles.negativo,
    "em análise": styles.analise,
    "pendente": styles.pendente,
  };

  const dynamicClass = statusClassMap[titulo.toLowerCase()] || "";

  return (
    <div className={`${styles.status} ${dynamicClass}`}>
      <p className={styles.titulo}>{titulo}</p>
    </div>
  );
}

export default Status;