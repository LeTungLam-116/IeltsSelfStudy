import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResultDetail } from '../../api/placementTestApi';
import type { PlacementTestResultDetailDto, QuestionDto } from '../../api/placementTestApi';
import { Card, Button, Loading } from '../../components/ui';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function PlacementTestReviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<PlacementTestResultDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            try {
                const data = await getResultDetail(parseInt(id));
                setDetail(data);
            } catch (error) {
                console.error("Failed to fetch detail", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loading /></div>;
    if (!detail) return <div className="p-8 text-center">Không tìm thấy kết quả.</div>;

    const chartData = [
        { subject: 'Grammar', A: detail.grammarScore, fullMark: 9 },
        { subject: 'Listening', A: detail.listeningScore, fullMark: 9 },
        { subject: 'Speaking', A: detail.speakingScore, fullMark: 9 },
        { subject: 'Writing', A: detail.writingScore, fullMark: 9 },
    ];

    // Parse extra JSONs
    let aiFeedback: any = {};
    try { aiFeedback = JSON.parse(detail.aiFeedbackJson || '{}'); } catch { }

    let answers: Record<string, string> = {};
    try { answers = JSON.parse(detail.answersJson || '{}'); } catch { }

    const tabs = [
        { id: 'overview', label: 'Tổng quan & Roadmap' },
        { id: 'mc', label: 'Grammar & Listening' },
        { id: 'writing', label: 'Writing' },
        { id: 'speaking', label: 'Speaking' },
    ];

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600">Kết Quả Chi Tiết</h1>
                <Button variant="outline" onClick={() => navigate('/placement-test/history')}>
                    Quay lại lịch sử
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Overall Band</h3>
                    <div className="text-6xl font-bold text-blue-600">{detail.overallBand}</div>
                </Card>
                <Card className="col-span-2 p-6">
                    <h3 className="text-lg font-semibold mb-2">Biểu đồ kỹ năng</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 9]} />
                                <Radar name="Band Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Custom Tabs */}
            <div className="border-b mb-4">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Lộ trình học tập đề xuất</h3>

                    {(() => {
                        let roadmap = { analysis: '', roadmap: [], recommendations: [], encouragement: '', suggestedCourses: [] };
                        try {
                            roadmap = JSON.parse(detail.roadmapJson || '{}');
                        } catch (e) {
                            return <p className="text-red-500">Lỗi hiển thị dữ liệu lộ trình.</p>;
                        }

                        return (
                            <div className="space-y-8">
                                {/* AI Analysis */}
                                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">🤖 Phân tích tổng quan</h4>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {roadmap.analysis || "Chưa có phân tích."}
                                    </p>
                                    {roadmap.encouragement && (
                                        <p className="mt-4 text-sm font-medium text-green-700 italic border-t border-green-100 pt-3">
                                            "{roadmap.encouragement}"
                                        </p>
                                    )}
                                </div>

                                {/* Roadmap Timeline */}
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-4 text-lg">📅 Kế hoạch hành động</h4>
                                    <div className="relative border-l-2 border-blue-200 ml-3 space-y-8 pb-2">
                                        {roadmap.roadmap && Array.isArray(roadmap.roadmap) && roadmap.roadmap.map((phase: any, i: number) => (
                                            <div key={i} className="relative pl-8">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                                <h5 className="font-bold text-blue-700 text-lg mb-1">{phase.phase}</h5>
                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-gray-700">
                                                    {phase.focus}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                                    <h4 className="font-bold text-indigo-800 mb-3">⭐ Lời khuyên chi tiết</h4>
                                    <ul className="space-y-3">
                                        {roadmap.recommendations && Array.isArray(roadmap.recommendations) && roadmap.recommendations.map((rec: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-gray-700 text-sm">
                                                <span className="text-indigo-500 font-bold">•</span>
                                                <span className="flex-1">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Suggested Courses */}
                                {roadmap.suggestedCourses && Array.isArray(roadmap.suggestedCourses) && roadmap.suggestedCourses.length > 0 && (
                                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                        <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">🎓 Khóa học đề xuất</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {roadmap.suggestedCourses.map((course: any, i: number) => (
                                                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
                                                    <h5 className="font-bold text-gray-900 mb-2">{course.courseName}</h5>
                                                    <p className="text-sm text-gray-600 mb-3">{course.reason}</p>
                                                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate('/courses')}>
                                                        Xem chi tiết
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </Card>
            )}

            {activeTab === 'mc' && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Chi tiết câu hỏi trắc nghiệm</h3>
                    <div className="space-y-4">
                        {detail.questions && detail.questions.length > 0 ? (
                            detail.questions.map((q: QuestionDto, idx: number) => {
                                const userAns = answers[q.id.toString()];
                                const isCorrect = userAns === q.correctAnswer;
                                return (
                                    <div key={q.id} className={`p-4 border rounded-lg ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex gap-2">
                                            <span className="font-bold">{idx + 1}.</span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{q.text}</p>
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium mr-2">Đáp án của bạn:</span>
                                                    <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{userAns || '(Chưa chọn)'}</span>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="text-sm mt-1">
                                                        <span className="font-medium mr-2">Đáp án đúng:</span>
                                                        <span className="text-green-600 font-bold">{q.correctAnswer}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-2xl">
                                                {isCorrect ? '✓' : '✗'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>Không có dữ liệu câu hỏi chi tiết.</p>
                        )}
                    </div>
                </Card>
            )}

            {activeTab === 'writing' && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Writing Evaluation</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Bài làm của bạn:</h4>
                            <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap border">
                                {detail.writingEssay || '(Không có bài viết)'}
                            </div>
                        </div>

                        {aiFeedback.Writing && (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                                    <h4 className="font-bold text-blue-700">AI Feedback (Band {aiFeedback.Writing.OverallBand})</h4>
                                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                        <div>TR: {aiFeedback.Writing.Criteria?.TR}</div>
                                        <div>CC: {aiFeedback.Writing.Criteria?.CC}</div>
                                        <div>LR: {aiFeedback.Writing.Criteria?.LR}</div>
                                        <div>GRA: {aiFeedback.Writing.Criteria?.GRA}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border p-4 rounded-md bg-green-50">
                                        <h4 className="font-bold text-green-700 mb-2">Điểm mạnh</h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {aiFeedback.Writing.Strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="border p-4 rounded-md bg-yellow-50">
                                        <h4 className="font-bold text-yellow-700 mb-2">Cần cải thiện</h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {aiFeedback.Writing.Improvements?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                {aiFeedback.Writing.BetterVersion && (
                                    <div className="border p-4 rounded-md bg-blue-50">
                                        <h4 className="font-bold text-blue-700 mb-2">Phiên bản tham khảo (Better Version)</h4>
                                        <p className="text-sm whitespace-pre-wrap">{aiFeedback.Writing.BetterVersion}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {activeTab === 'speaking' && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Speaking Evaluation</h3>
                    <div className="space-y-6">
                        {detail.speakingAudioUrl && (
                            <div>
                                <h4 className="font-semibold mb-2">File ghi âm:</h4>
                                <audio controls className="w-full" src={`http://localhost:5000${detail.speakingAudioUrl}`}>
                                    Your browser does not support the audio element.
                                </audio>
                                <p className="text-xs text-gray-500 mt-1">URL: {detail.speakingAudioUrl}</p>
                            </div>
                        )}

                        {aiFeedback.Speaking && (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                                    <h4 className="font-bold text-blue-700">AI Feedback (Band {aiFeedback.Speaking.OverallBand})</h4>
                                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                        <div>Fluency: {aiFeedback.Speaking.Criteria?.Fluency}</div>
                                        <div>Lexical: {aiFeedback.Speaking.Criteria?.Lexical}</div>
                                        <div>Grammar: {aiFeedback.Speaking.Criteria?.Grammar}</div>
                                        <div>Pronunciation: {aiFeedback.Speaking.Criteria?.Pronunciation}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border p-4 rounded-md bg-green-50">
                                        <h4 className="font-bold text-green-700 mb-2">Điểm mạnh</h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {aiFeedback.Speaking.Strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="border p-4 rounded-md bg-yellow-50">
                                        <h4 className="font-bold text-yellow-700 mb-2">Cần cải thiện</h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {aiFeedback.Speaking.Improvements?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                {aiFeedback.Speaking.BetterAnswer && (
                                    <div className="border p-4 rounded-md bg-blue-50">
                                        <h4 className="font-bold text-blue-700 mb-2">Câu trả lời mẫu (Better Answer)</h4>
                                        <p className="text-sm whitespace-pre-wrap">{aiFeedback.Speaking.BetterAnswer}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
