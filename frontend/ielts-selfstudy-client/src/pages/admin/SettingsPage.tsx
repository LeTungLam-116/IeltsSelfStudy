import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { settingsApi } from '../../api/settingsApi';
import { useToast } from '../../components/ui';
import type { SystemSetting } from '../../types/setting';
import { IconCog, IconMoney, IconCheck, IconDashboard } from '../../components/icons';

type ActiveTab = 'AI' | 'Payment' | 'General';
type SavedState = 'idle' | 'saving' | 'saved';

// Các keys nhạy cảm cần confirm trước khi lưu
const SENSITIVE_KEYS = ['AI_ApiKey', 'Payment_Vnp_HashSecret'];

const SettingsPage = () => {
    const { success: showSuccess, error: showError } = useToast();

    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedState, setSavedState] = useState<SavedState>('idle');
    const [activeTab, setActiveTab] = useState<ActiveTab>('AI');

    // Fix 1: useMemo để defaultKeys không tái tạo mỗi render (tránh ESLint warning & re-render loop)
    const defaultKeys = useMemo<Record<ActiveTab, SystemSetting[]>>(() => ({
        AI: [
            { key: 'AI_Provider', value: 'OpenAI', group: 'AI', type: 'string', description: 'Nhà cung cấp AI (OpenAI/Gemini)' },
            { key: 'AI_ApiKey', value: '', group: 'AI', type: 'password', description: 'API Key (OpenAI Key)' },
            { key: 'AI_Model', value: 'gpt-4o-mini', group: 'AI', type: 'string', description: 'Model ID (vd: gpt-4o-mini)' },
            { key: 'AI_Prompt_Writing', value: '', group: 'AI', type: 'text', description: 'System Prompt chấm Writing' },
            { key: 'AI_Prompt_Speaking', value: '', group: 'AI', type: 'text', description: 'System Prompt chấm Speaking' },
        ],
        Payment: [
            { key: 'Payment_Vnp_TmnCode', value: '', group: 'Payment', type: 'string', description: 'VNPay TmnCode' },
            { key: 'Payment_Vnp_HashSecret', value: '', group: 'Payment', type: 'password', description: 'VNPay HashSecret' },
            { key: 'Payment_Vnp_BaseUrl', value: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', group: 'Payment', type: 'string', description: 'VNPay Base URL' },
            { key: 'Payment_Vnp_ReturnUrl', value: 'http://localhost:5173/payment/callback', group: 'Payment', type: 'string', description: 'Return URL sau thanh toán' },
        ],
        General: [],
    }), []);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await settingsApi.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
            showError('Lỗi tải cấu hình', 'Không thể tải cấu hình hệ thống. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Fix 1 (tiếp): Merge defaults vào settings một lần sau khi load xong
    useEffect(() => {
        if (loading) return;

        const allDefaults = Object.values(defaultKeys).flat();
        const missingDefaults = allDefaults.filter(def => !settings.find(s => s.key === def.key));

        if (missingDefaults.length > 0) {
            setSettings(prev => [...prev, ...missingDefaults]);
        } else if (settings.length === 0) {
            setSettings(allDefaults);
        }
    }, [loading, defaultKeys]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (key: string, value: string) => {
        setSavedState('idle'); // Reset saved indicator khi user chỉnh sửa
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    // Fix 5: Chỉ lưu settings của tab đang hiện — tránh ghi đè settings của tab khác
    const handleSave = async () => {
        const currentTabSettings = settings.filter(s => s.group === activeTab);

        // Fix 4: Confirm trước khi lưu nếu tab chứa keys nhạy cảm
        const hasSensitiveChanges = currentTabSettings.some(s => SENSITIVE_KEYS.includes(s.key) && s.value !== '');
        if (hasSensitiveChanges) {
            const confirmed = window.confirm(
                `Tab này chứa thông tin nhạy cảm (API Key / HashSecret).\n\nBạn có chắc muốn lưu không?`
            );
            if (!confirmed) return;
        }

        try {
            setSavedState('saving');
            await settingsApi.updateSettings(currentTabSettings);

            // Fix 6: Saved indicator — hiện "Đã lưu ✓" 3 giây rồi về idle
            setSavedState('saved');
            showSuccess('Đã lưu thành công', `Cấu hình ${activeTab} đã được cập nhật.`);
            setTimeout(() => setSavedState('idle'), 3000);
        } catch (error) {
            console.error('Failed to save settings', error);
            setSavedState('idle');
            showError('Lỗi lưu cấu hình', 'Có lỗi xảy ra khi lưu cấu hình. Vui lòng thử lại.');
        }
    };

    // Fix 3: renderField không set key bên trong, để map() bên ngoài set key đúng cách
    const renderField = (setting: SystemSetting) => {
        const commonProps = {
            label: setting.description || setting.key,
            value: setting.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                handleChange(setting.key, e.target.value),
            placeholder: `Nhập ${setting.description || setting.key}...`,
        };

        if (setting.type === 'text') {
            return (
                <div className="space-y-1">
                    <Textarea
                        {...commonProps}
                        rows={setting.key.includes('Prompt') ? 10 : 4}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Hỗ trợ văn bản nhiều dòng (System Prompt).</p>
                </div>
            );
        }

        return (
            <div className="space-y-1">
                <Input
                    {...commonProps}
                    type={setting.type === 'password' ? 'password' : 'text'}
                />
                {SENSITIVE_KEYS.includes(setting.key) && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                        <span>🔒</span> Thông tin nhạy cảm — sẽ được lưu bảo mật.
                    </p>
                )}
            </div>
        );
    };

    // displaySettings: settings của tab hiện tại, merge với defaults
    const displaySettings = useMemo(() => {
        return defaultKeys[activeTab].map(def => {
            const existing = settings.find(s => s.key === def.key);
            return existing || def;
        });
    }, [activeTab, settings, defaultKeys]);

    const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { key: 'AI', label: 'Cấu hình AI', icon: <IconDashboard className="w-4 h-4" /> },
        { key: 'Payment', label: 'Thanh toán (VNPay)', icon: <IconMoney className="w-4 h-4" /> },
        { key: 'General', label: 'Hệ thống chung', icon: <IconCog className="w-4 h-4" /> },
    ];

    // Fix 6: Nút Save có 3 trạng thái rõ ràng
    const getSaveButtonContent = () => {
        if (savedState === 'saving') return (
            <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
            </>
        );
        if (savedState === 'saved') return (
            <>
                <IconCheck className="w-4 h-4" />
                Đã lưu ✓
            </>
        );
        return (
            <>
                <IconCheck className="w-4 h-4" />
                Lưu thay đổi
            </>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Đang tải cấu hình...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cấu hình hệ thống</h1>
                    <p className="text-gray-500 mt-1">Quản lý kết nối AI và cổng thanh toán VNPay</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={savedState === 'saving'}
                    className={`flex items-center gap-2 transition-all ${savedState === 'saved'
                            ? 'bg-green-600 hover:bg-green-600 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                >
                    {getSaveButtonContent()}
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSavedState('idle'); }}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Settings Form */}
            <Card className="p-6">
                {displaySettings.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <IconCog className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Chưa có cấu hình cho mục này.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Fix 3: key đặt đúng chỗ — trên phần tử ngoài cùng của map, không bên trong renderField */}
                        {displaySettings.map(setting => (
                            <div key={setting.key}>
                                {renderField(setting)}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-700">
                <span className="mt-0.5 text-base">💡</span>
                <div className="space-y-1">
                    <p className="font-semibold">Lưu ý quan trọng:</p>
                    <p>Nút <strong>"Lưu thay đổi"</strong> chỉ lưu cấu hình của <strong>tab đang hiển thị</strong>, không ảnh hưởng đến tab khác.</p>
                    <p>Thay đổi <strong>System Prompt</strong> ảnh hưởng trực tiếp đến cách AI chấm bài Writing và Speaking.</p>
                    <p>Thông tin <strong>API Key</strong> và <strong>Hash Secret</strong> sẽ được hỏi xác nhận trước khi lưu.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
