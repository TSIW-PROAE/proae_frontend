export class MockInscription {
    getInscriptions() {
        return [
            {
                modalidade: "transporte",
                dataNascimento: "01/01/2000",
                cpf: "123.456.789-00",
                curso: "engenharia",
                campus: "centro",
                telefone: "11987654321",
                dataIngresso: "01012020",
                matricula: "987654321000",
                justificativa: "Lorem ipsum dolor sit amet",
            },
            {
                modalidade: "alimentação",
                dataNascimento: "02/02/2001",
                cpf: "987.654.321-00",
                curso: "medicina",
                campus: "norte",
                telefone: "11912345678",
                dataIngresso: "02022021",
                matricula: "123456789000",
                justificativa: "Consectetur adipiscing elit",
            },
        ];
    }

    save(inscription: any) {
        console.log("Inscription saved:", inscription);
        return { success: true, message: "Inscription saved successfully" };
    }

    getInscriptionById(id: string) {
        console.log("Fetching inscription by ID:", id);
        return {
            modalidade: "alimentação",
            dataNascimento: "02/02/2001",
            cpf: "987.654.321-00",
            curso: "medicina",
            campus: "norte",
            telefone: "11912345678",
            dataIngresso: "02022021",
            matricula: "123456789000",
            justificativa: "Consectetur adipiscing elit",
        };
    }
}