import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Loading } from '../../components/ui';
import { getHistory } from '../../api/placementTestApi';
import type { PlacementTestHistoryDto } from '../../api/placementTestApi';
import { format } from 'date-fns';

export default function PlacementHistoryPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<PlacementTestHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistory();
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loading /></div>;

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Lịch Sử Kiểm Tra Trình Độ</h1>

            <div className="grid gap-4">
                {history.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        Bạn chưa thực hiện bài kiểm tra nào.
                        <div className="mt-4">
                            <Button onClick={() => navigate('/placement-test')}>Làm bài kiểm tra ngay</Button>
                        </div>
                    </Card>
                ) : (
                    history.map((item) => (
                        <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">{item.testTitle || 'Placement Test'}</h3>
                                    <p className="text-sm text-gray-500">
                                        Ngày thi: {format(new Date(item.testedAt), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-2xl font-bold text-blue-600">
                                        Band {item.overallBand.toFixed(1)}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/placement-test/history/${item.id}`)}>
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
