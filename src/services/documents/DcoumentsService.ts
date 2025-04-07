import { MockDocuments } from "../../mock/MockDocuments";
import IHttpClient from "../http/HttpClient"

export default class DocumentsService {

    constructor(private readonly httpClient: IHttpClient) {
        
    }

    async getDocuments(){

        if(process.env.NEXT_PUBLIC_API_URL_SERVICES === 'false'){
            const mockDocuments = new MockDocuments();
           return mockDocuments.getDocuments();
        }

        const url = process.env.PUBLIC_API_URL_SERVICES + `documents`;
        const response = await this.httpClient.get(url);

        return  response;
    }


}
