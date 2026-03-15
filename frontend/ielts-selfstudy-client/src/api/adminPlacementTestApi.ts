import httpClient from './httpClient';

export type QuestionDto = {
    id: number;
    text: string;
    type: 'Grammar' | 'Vocab' | 'Listening' | 'Speaking' | 'Writing';
    options: string[];
    correctAnswer: string;
    audioUrl?: string;
};

export type PlacementTestListDto = {
    id: number;
    title: string;
    durationSeconds: number;
    questionCount: number;
    isActive: boolean;
    createdAt: string;
};

export type PlacementTestDetailDto = PlacementTestListDto & {
    questions: QuestionDto[];
};

export type CreatePlacementTestRequest = {
    title: string;
    durationSeconds: number;
    questions: QuestionDto[];
};

export type UpdatePlacementTestRequest = CreatePlacementTestRequest & {
    isActive: boolean;
};

// API Functions

export async function getAllPlacementTests(): Promise<PlacementTestListDto[]> {
    const response = await httpClient.get<PlacementTestListDto[]>('/placementTests/admin/all');
    return response.data;
}

export async function getPlacementTestById(id: number): Promise<PlacementTestDetailDto> {
    const response = await httpClient.get<PlacementTestDetailDto>(`/placementTests/admin/${id}`);
    return response.data;
}

export async function createPlacementTest(data: CreatePlacementTestRequest): Promise<PlacementTestDetailDto> {
    const response = await httpClient.post<PlacementTestDetailDto>('/placementTests/admin', data);
    return response.data;
}

export async function updatePlacementTest(id: number, data: UpdatePlacementTestRequest): Promise<PlacementTestDetailDto> {
    const response = await httpClient.put<PlacementTestDetailDto>(`/placementTests/admin/${id}`, data);
    return response.data;
}

export async function deletePlacementTest(id: number): Promise<void> {
    await httpClient.delete(`/placementTests/admin/${id}`);
}

export async function activatePlacementTest(id: number): Promise<void> {
    await httpClient.put(`/placementTests/admin/${id}/activate`);
}

export const uploadAudio = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post<{ url: string }>('/placementTests/admin/upload-audio', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.url;
};
