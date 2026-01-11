import axios from "axios";
import { FetchAdapter } from "../BaseRequestService/HttpClient";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/documents";

export class MinioService{

    private httpClient: FetchAdapter;

    constructor() {
        this.httpClient = new FetchAdapter();
    }

    async uploadDocument(file: File, vagaId?: number){
        const url = `${BASE_URL}/upload`;


        const formData = new FormData();
        formData.append("files", file);

        if(vagaId){
            formData.append("vagaId", vagaId.toString());
        }


            const response = await axios.post(url, formData, {withCredentials: true});

            if(response.status !== 201){
                throw new Error("Erro ao fazer upload do arquivo");
            }

            return response.urlArquivo || "https://example.com/fake-url"; // Ajuste conforme a resposta real
    }

    async downloadDocument(fileName: string){
        const url = `${BASE_URL}/documents/${fileName}`;
        const response = await this.httpClient.get<any>(url);
        
        console.log(response);
        return response.data;
    }

}