import { MockInscription } from "@/mock/MockInscription";
import IHttpClient from "../http/HttpClient";

export default class InscriptionService {
    headerToken: string;
    

    constructor(private readonly httpClient: IHttpClient) {
        //TODO: Implementar o token de autenticação
        // this.headerToken = localStorage.getItem('token') || '';
        this.headerToken = '';
        
    }

    async index() {
        if (process.env.NEXT_PUBLIC_API_URL_SERVICES === 'false') {
            const mockInscription = new MockInscription();
            return mockInscription.getInscriptions();
        }

        const url = process.env.PUBLIC_API_URL_SERVICES + `documents`;
        const response = await this.httpClient.get(url);

        return response;
    }

    async save(document: any) {
        if (process.env.NEXT_PUBLIC_API_URL_SERVICES === 'false') {
            const mockInscription = new MockInscription();
            return mockInscription.save(document);
        }

        const url = process.env.PUBLIC_API_URL_SERVICES + `documents`;
        const response = await this.httpClient.post(url, document, this.headerToken);

        return response;
    }


    async getInscriptionById(id: string) {
        if (process.env.NEXT_PUBLIC_API_URL_SERVICES === 'false') {
            const mockInscription = new MockInscription();
            return mockInscription.getInscriptionById(id);
        }

        const url = process.env.PUBLIC_API_URL_SERVICES + `documents/${id}`;
        const response = await this.httpClient.get(url);

        return response;
    }
}