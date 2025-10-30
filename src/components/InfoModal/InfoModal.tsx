import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalContent,
    ModalFooter,
    Button,
    useDisclosure
} from "@heroui/react";
import { useEffect } from "react";


export default function InfoModal(){
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(() => {
        onOpen();
    }, [])


    return(
        <>
        <Modal 
        isOpen={isOpen} 
        isDismissable={false}
        isKeyboardDismissDisabled={true} 
        onOpenChange={onOpenChange}
        size={'2xl'}
        placement="center"
        closeButton={<></>}
        shouldBlockScroll={true}
        >      
            <ModalContent>
                
                {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Aviso sobre Retenção de Dados</ModalHeader>
              <ModalBody>
                <p>
                  Informamos que, em conformidade com a política de retenção de dados do sistema, suas informações de aluno poderão ser permanentemente excluídas após um determinado período. Recomendamos que você faça backup de quaisquer dados importantes antes do término desse período para evitar perda de informações relevantes.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
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