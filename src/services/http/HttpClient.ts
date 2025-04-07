
export default interface IHttpClient {
    get<T>(url: string): Promise<T>;

    post<T>(url: string, data: unknown, token: string): Promise<T>;

    put<T>(url: string, data: unknown, token: string): Promise<T>;

    delete<T>(url: string, token: string): Promise<T>;

    setHeader(name: string, value: string): void;
}



export class FetchAdapter implements IHttpClient {

  private headers: Record<string, string> = {};

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });
    return response.json();
  }

  async post<T>(url: string, data: unknown, token: string): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json(); 
      throw new Error(JSON.stringify(errorData)); 
    }
    return response.json();
  }

  async put<T>(url: string, data: unknown, token: string): Promise<T> {
    console.log(url);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete<T>(url: string): Promise<T> {
      const response = await fetch(url, {
          method: 'DELETE',
          headers: {
              'Accept': 'application/json',
          },
      });
      return response.json(); 
  }
}