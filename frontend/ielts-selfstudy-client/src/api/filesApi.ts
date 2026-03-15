import httpClient from './httpClient';

export interface UploadResponse {
    url: string;
    fileName: string;
}

export const uploadFile = async (file: File, folder: string = 'common'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await httpClient.post<UploadResponse>('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const importQuestions = async (file: File): Promise<any[]> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<any[]>('/files/import-questions', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
