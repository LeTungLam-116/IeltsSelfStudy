import { useEffect, useState } from 'react';
import { Button, Card, useToast, Loading } from '../../../components/ui';
import {
    getAllPlacementTests,
    deletePlacementTest,
    activatePlacementTest
} from '../../../api/adminPlacementTestApi';
import type { PlacementTestListDto } from '../../../api/adminPlacementTestApi';
import PlacementTestFormModal from './PlacementTestFormModal';
import { format } from 'date-fns';

export default function AdminPlacementTestsPage() {
    const { success, error: showError } = useToast();
    const [tests, setTests] = useState<PlacementTestListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const data = await getAllPlacementTests();
            setTests(data);
        } catch (err) {
            showError("Lỗi", "Không thể tải danh sách đề thi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;
        try {
            await deletePlacementTest(id);
            success("Thành công", "Đã xóa đề thi");
            setTests(prev => prev.filter(test => test.id !== id));
        } catch (err) {
            showError("Lỗi", "Xóa thất bại");
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await activatePlacementTest(id);
            success("Thành công", "Đã kích hoạt đề thi");
            setTests(prev => prev.map(test => ({
                ...test,
                isActive: test.id === id
            })));
        } catch (err) {
            showError("Lỗi", "Kích hoạt thất bại");
        }
    };

    const handleEdit = (id: number) => {
        setSelectedTestId(id);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedTestId(null);
        setIsModalOpen(true);
    };

    const handleModalClose = (refresh: boolean) => {
        setIsModalOpen(false);
        if (refresh) fetchTests();
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loading /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đề thi Đầu vào</h1>
                    <p className="text-gray-500">Quản lý các bộ đề trắc nghiệm cho Placement Test</p>
                </div>
                <Button onClick={handleCreate}>+ Tạo đề thi mới</Button>
            </div>

            <div className="grid gap-6">
                {tests.map(test => (
                    <Card key={test.id} className={`p-6 flex items-center justify-between ${test.isActive ? 'border-l-4 border-l-green-500 shadow-md' : 'opacity-75'}`}>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-800">{test.title}</h3>
                                {test.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Active</span>}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                <span>🕒 {Math.round(test.durationSeconds / 60)} phút</span>
                                <span>📝 {test.questionCount} câu hỏi</span>
                                <span>📅 {format(new Date(test.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!test.isActive && (
                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleActivate(test.id)}>
                                    Kích hoạt
                                </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(test.id)}>Sửa</Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(test.id)}>Xóa</Button>
                        </div>
                    </Card>
                ))}

                {tests.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                        <p className="text-gray-500">Chưa có đề thi nào. Hãy tạo mới!</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PlacementTestFormModal
                    isOpen={isModalOpen}
                    onClose={() => handleModalClose(false)}
                    onSuccess={() => handleModalClose(true)}
                    testId={selectedTestId}
                />
            )}
        </div>
    );
}
