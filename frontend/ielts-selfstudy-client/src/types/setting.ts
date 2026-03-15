export interface SystemSetting {
    id?: number;
    key: string;
    value: string;
    group: string; // 'AI', 'Payment', 'General'
    type: string; // 'string', 'number', 'boolean', 'text', 'password'
    description?: string;
    updatedAt?: string;
}

export type SettingGroup = 'AI' | 'Payment' | 'General';
