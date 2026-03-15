import axiosClient from './httpClient';
import type { SystemSetting } from '../types/setting';

export const settingsApi = {
    getAll: async (): Promise<SystemSetting[]> => {
        const response = await axiosClient.get('/settings');
        return response.data;
    },

    getByKey: async (key: string): Promise<{ key: string; value: string }> => {
        const response = await axiosClient.get(`/settings/${key}`);
        return response.data;
    },

    updateSettings: async (settings: SystemSetting[]): Promise<void> => {
        await axiosClient.put('/settings', settings);
    }
};
