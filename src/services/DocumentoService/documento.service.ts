import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { RDocumento, TipoDocumento } from "../../types/documento";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + `/documentos`;

export default class DocumentoService{
    private readonly httpClient: FetchAdapter;

    constructor(){
        this.httpClient = new FetchAdapter();
    }

    async uploadDocumento(file: File, inscricaoId: string, tipo_documento: TipoDocumento): Promise<RDocumento>{
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