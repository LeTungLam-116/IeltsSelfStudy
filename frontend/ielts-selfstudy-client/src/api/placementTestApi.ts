import httpClient from './httpClient';

// Types
export type PlacementTestDto = {
    id: number;
    title: string;
    durationSeconds: number;
    questionsJson: string;
}

export type UserLevelDto = {
    userId: number;
    grammarScore: number;
    listeningScore: number;
    speakingScore: number;
    writingScore: number;
    overallBand: number;
    roadmapJson: string;
    testedAt: string;
}

export type PlacementTestSubmitRequest = {
    answersJson: string;
    writingEssay?: string;
    speakingAudio?: File;
}

export type PlacementTestResultDto = {
    overallBand: number;
    grammarScore: number;
    listeningScore: number;
    speakingScore: number;
    writingScore: number;
    roadmapJson: string;
}

// API Functions
export async function getPlacementTest(): Promise<PlacementTestDto> {
    const response = await httpClient.get<PlacementTestDto>('/placementTests');
    return response.data;
}

export async function getUserLevel(): Promise<UserLevelDto | null> {
    const response = await httpClient.get<UserLevelDto>('/placementTests/level');
    return response.data || null;
}

export async function submitPlacementTest(data: PlacementTestSubmitRequest): Promise<PlacementTestResultDto> {
    const formData = new FormData();
    formData.append('answersJson', data.answersJson);

    if (data.writingEssay) {
        formData.append('writingEssay', data.writingEssay);
    }

    if (data.speakingAudio) {
        formData.append('speakingAudio', data.speakingAudio);
    }

    const response = await httpClient.post<PlacementTestResultDto>('/placementTests/submit', formData, {
        timeout: 120000, // 2 minutes for placement test submission
    });
    return response.data;
}

export type PlacementTestHistoryDto = {
    id: number;
    testedAt: string;
    overallBand: number;
    testTitle: string;
}

export type QuestionDto = {
    id: number;
    text: string;
    type: string;
    options: string[];
    correctAnswer: string;
}

export type PlacementTestResultDetailDto = {
    id: number;
    testedAt: string;
    overallBand: number;
    grammarScore: number;
    listeningScore: number;
    speakingScore: number;
    writingScore: number;
    roadmapJson: string; // JSON string
    answersJson: string; // JSON string
    writingEssay?: string;
    speakingAudioUrl?: string; // Relative URL
    aiFeedbackJson?: string; // JSON string
    questions: QuestionDto[];
}

export async function getHistory(): Promise<PlacementTestHistoryDto[]> {
    const response = await httpClient.get<PlacementTestHistoryDto[]>('/placementTests/history');
    return response.data;
}

export async function getResultDetail(id: number): Promise<PlacementTestResultDetailDto> {
    const response = await httpClient.get<PlacementTestResultDetailDto>(`/placementTests/history/${id}`);
    return response.data;
}
