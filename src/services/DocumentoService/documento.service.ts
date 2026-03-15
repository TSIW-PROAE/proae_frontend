import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { RDocumento, TipoDocumento } from "../../types/documento";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/documentos";

export default class DocumentoService{
    private readonly httpClient: FetchAdapter;

    constructor(){
        this.httpClient = new FetchAdapter();
    }

    async uploadDocumento(file: File, inscricaoId: number, tipo_documento: TipoDocumento): Promise<RDocumento>{
            const url = `${BASE_URL}/upload`; 
            
            const data = new FormData();
            data.append('files', file);
            data.append('inscricao', inscricaoId.toString());
            data.append('tipo_documento', tipo_documento);

           const response =  await axios.post<RDocumento>(url, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
           });
           return response.data;
    }    

}