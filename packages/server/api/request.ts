import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { ApiEndpoints, getApiUrl } from './enum'; // 导入上面定义的枚举和函数

export class ApiService {
    private static headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    private static async request<T>(
        method: Method,
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        data?: any,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        const url = getApiUrl(endpoint, params);
        return axios.request({
            url,
            method,
            headers: ApiService.headers,
            data,
            ...config,
        });
    }

    public static async head<T>(
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.request('HEAD', endpoint, params, undefined, config);
    }

    public static async get<T>(
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.request('GET', endpoint, params, undefined, config);
    }

    public static async delete<T>(
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.request('DELETE', endpoint, params, undefined, config);
    }

    public static async post<T>(
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        data: any,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.request('POST', endpoint, params, data, config);
    }

    public static async put<T>(
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        data: any,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.request('PUT', endpoint, params, data, config);
    }

    public static async patch<T>(
        endpoint: ApiEndpoints,
        params: Record<string, string | number>,
        data: any,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        return this.request('PATCH', endpoint, params, data, config);
    }

    public static setHeader(key: string, value: string) {
        this.headers[key] = value;
    }
}

// 使用示例
// ApiService.setHeader('Authorization', 'Bearer token'); // 如果需要设置其他 header
// ApiService.get(ApiEndpoints.GetQQLevel, { 0: '123456' }).then(response => {
//     console.log(response.data);
// });
