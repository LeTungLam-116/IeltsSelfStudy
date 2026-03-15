import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui";
import { useEffect, useState } from "react";
import { getUserLevel, type UserLevelDto } from "../../api/placementTestApi";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [userLevel, setUserLevel] = useState<UserLevelDto | null>(null);

    useEffect(() => {
        if (user) {
            getUserLevel().then(setUserLevel).catch(console.error);
        }
    }, [user]);

    if (!user) return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-5xl font-bold text-blue-600 shadow-md uppercase">
                                {user.fullName.charAt(0)}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* Name & Actions */}
                        <div className="flex-1 pt-2">
                            <h2 className="text-3xl font-bold text-gray-900">{user.fullName}</h2>
                            <p className="text-gray-500 font-medium">{user.email}</p>
                        </div>

                        <div className="flex gap-3 mt-4 md:mt-0">
                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                Đổi mật khẩu
                            </Button>
                            <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) logout();
                            }}>
                                Đăng xuất
                            </Button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-6 border-t border-gray-100">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Thông tin cơ bản
                            </h3>

                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò hệ thống</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tham gia</label>
                                    <div className="text-gray-900 font-medium">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Học tập & Lộ trình
                            </h3>

                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Mục tiêu (Target)</label>
                                        <div className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
                                            {user.targetBand || '?'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Trình độ hiện tại</label>
                                        <div className={`w-full p-3 rounded-xl border flex items-center justify-center text-xl font-bold ${userLevel ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}>
                                            {userLevel ? userLevel.overallBand : '?'}
                                        </div>
                                    </div>
                                </div>

                                {userLevel ? (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-800 mb-2">Bạn đã có lộ trình học cá nhân hóa.</p>
                                        <Button
                                            size="sm"
                                            className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                            onClick={() => navigate('/placement/result', { state: { result: userLevel } })}
                                        >
                                            Xem chi tiết lộ trình ➝
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <p className="text-sm text-orange-800 mb-2">Bạn chưa kiểm tra trình độ đầu vào.</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full border-orange-200 text-orange-700 hover:bg-orange-100"
                                            onClick={() => navigate('/placement-test')}
                                        >
                                            Làm bài test ngay
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
