import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "@/utils/utils";

export default function InfoModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const cookie = getCookie("infoModalSeen");
    if (!cookie) {
      onOpen();
    }
  }, []);

  const handleClose = (onClose: () => void) => {
    if (dontShowAgain) {
      setCookie("infoModalSeen", "true", 730);
    }
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={onOpenChange}
        size={"2xl"}
        placement="center"
        closeButton={<></>}
        shouldBlockScroll={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Aviso sobre Retenção de Dados
              </ModalHeader>
              <ModalBody>
                <p className="mb-4">
                  Informamos que, em conformidade com a política de retenção de
                  dados do sistema, suas informações de aluno poderão ser
                  permanentemente excluídas após um determinado período.
                  Recomendamos que você faça backup de quaisquer dados
                  importantes antes do término desse período para evitar perda
                  de informações relevantes.
                </p>
                <Checkbox
                  isSelected={dontShowAgain}
                  onValueChange={setDontShowAgain}
                  size="sm"
                >
                  Não mostrar esta mensagem novamente
                </Checkbox>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => handleClose(onClose)}>
                  Entendi
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
