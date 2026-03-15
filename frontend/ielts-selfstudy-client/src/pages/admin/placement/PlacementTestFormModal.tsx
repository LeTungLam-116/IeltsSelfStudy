import { useEffect, useState, useRef } from 'react';
import { Button, Loading, useToast } from '../../../components/ui';
import {
    createPlacementTest,
    updatePlacementTest,
    getPlacementTestById
} from '../../../api/adminPlacementTestApi';
import type { QuestionDto } from '../../../api/adminPlacementTestApi';
import { FileUpload } from '../../../components/common/FileUpload';
import { importQuestions } from '../../../api/filesApi';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    testId: number | null;
};

const DEFAULT_QUESTION: QuestionDto = {
    id: 0,
    text: '',
    type: 'Grammar',
    options: ['', '', '', ''],
    correctAnswer: '',
    audioUrl: ''
};

export default function PlacementTestFormModal({ isOpen, onClose, onSuccess, testId }: Props) {
    const { success, error: showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileImportRef = useRef<HTMLInputElement>(null);
    const idCounter = useRef(1); // Simple counter for question IDs

    // Form State
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(1200); // 20 mins
    const [questions, setQuestions] = useState<QuestionDto[]>([DEFAULT_QUESTION]);

    useEffect(() => {
        if (testId) {
            setInitialLoading(true);
            getPlacementTestById(testId)
                .then(data => {
                    setTitle(data.title);
                    setDuration(data.durationSeconds);
                    setQuestions(data.questions.length > 0 ? data.questions : [DEFAULT_QUESTION]);
                    const maxId = Math.max(...data.questions.map(q => q.id), 0);
                    idCounter.current = maxId + 1;
                })
                .catch(() => showError("Lỗi", "Không thể tải thông tin đề thi"))
                .finally(() => setInitialLoading(false));
        } else {
            // Reset for create mode
            setTitle('');
            setDuration(1200);
            idCounter.current = 1;
            setQuestions([{ ...DEFAULT_QUESTION, id: idCounter.current++ }]);
        }
    }, [testId, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) return showError("Lỗi", "Vui lòng nhập tên đề thi");
        const errorIdx = questions.findIndex(q => {
            const isMultipleChoice = ['Grammar', 'Vocab', 'Listening'].includes(q.type);
            if (!q.text.trim()) return true;
            if (isMultipleChoice) {
                return !q.correctAnswer || q.options.some(o => !o.trim());
            }
            return false;
        });

        if (errorIdx !== -1) {
            return showError("Lỗi", `Câu số ${errorIdx + 1} chưa đầy đủ nội dung hoặc đáp án.`);
        }

        try {
            setLoading(true);
            const data = {
                title,
                durationSeconds: duration,
                questions
            };

            if (testId) {
                await updatePlacementTest(testId, { ...data, isActive: false }); // Keep active status or pass it
                success("Thành công", "Đã cập nhật đề thi");
            } else {
                await createPlacementTest(data);
                success("Thành công", "Đã tạo đề thi mới");
            }
            onSuccess();
        } catch (err) {
            showError("Lỗi", "Lưu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { ...DEFAULT_QUESTION, id: idCounter.current++ }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof QuestionDto, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
        const newQuestions = [...questions];
        const question = { ...newQuestions[qIndex] };
        const oldOptionValue = question.options[optIndex];
        const newOptions = [...question.options];

        newOptions[optIndex] = value;
        question.options = newOptions;

        // Nếu option đang sửa là đáp án đúng hiện tại, cập nhật lại correctAnswer để không bị mất tick chọn
        if (question.correctAnswer === oldOptionValue && oldOptionValue !== '') {
            question.correctAnswer = value;
        }

        newQuestions[qIndex] = question;
        setQuestions(newQuestions);
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const importedQuestions = await importQuestions(file);
            if (importedQuestions && importedQuestions.length > 0) {
                // Map imported questions to have correct local IDs
                const processedQuestions = importedQuestions.map(q => ({
                    ...q,
                    id: idCounter.current++
                }));
                // Append or Replace? Let's append
                setQuestions([...questions.filter(q => q.text), ...processedQuestions]);
                success("Thành công", `Đã import ${processedQuestions.length} câu hỏi`);
            } else {
                showError("Thông báo", "File không có dữ liệu câu hỏi hợp lệ");
            }
        } catch (err) {
            console.error(err);
            showError("Lỗi", "Import thất bại. Kiểm tra định dạng file.");
        } finally {
            setImporting(false);
            if (fileImportRef.current) fileImportRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">
                        {testId ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
                    </h2>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileImportRef}
                            onChange={handleImportExcel}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={importing}
                            onClick={() => fileImportRef.current?.click()}
                        >
                            {importing ? "Đang xử lý..." : "📥 Import Excel"}
                        </Button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 px-2">✕</button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {initialLoading ? (
                        <div className="flex justify-center py-10"><Loading /></div>
                    ) : (
                        <form id="test-form" onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đề thi</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="VD: Đề thi tháng 1/2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (giây)</label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <span className="text-xs text-gray-500 mt-1">= {Math.round(duration / 60)} phút</span>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-800">Danh sách câu hỏi ({questions.length})</h3>
                                    <Button type="button" size="sm" onClick={addQuestion}>+ Thêm câu hỏi</Button>
                                </div>

                                <div className="space-y-6">
                                    {questions.map((q, qIdx) => (
                                        <div key={q.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group">
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIdx)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Xóa câu hỏi"
                                            >
                                                🗑️
                                            </button>

                                            <div className="grid grid-cols-12 gap-4 mb-4">
                                                <div className="col-span-1 flex items-center justify-center">
                                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                                                        {qIdx + 1}
                                                    </span>
                                                </div>
                                                <div className="col-span-8">
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                                                        placeholder="Nội dung câu hỏi..."
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <select
                                                        value={q.type}
                                                        onChange={e => updateQuestion(qIdx, 'type', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
                                                    >
                                                        <option value="Grammar">Grammar</option>
                                                        <option value="Vocab">Vocabulary</option>
                                                        <option value="Listening">Listening</option>
                                                        <option value="Speaking">Speaking</option>
                                                        <option value="Writing">Writing</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Audio Input for Listening */}
                                            {q.type === 'Listening' && (
                                                <div className="mb-4 pl-12 space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Audio File:</label>
                                                    <FileUpload
                                                        currentValue={q.audioUrl}
                                                        folder="listening_audio"
                                                        accept="audio/*"
                                                        onUploadComplete={(url) => updateQuestion(qIdx, 'audioUrl', url)}
                                                        placeholder="Tải lên hoặc dán link Audio"
                                                    />
                                                    {q.audioUrl && (
                                                        <audio src={q.audioUrl.startsWith('http') ? q.audioUrl : `http://localhost:5000${q.audioUrl}`} controls className="w-full h-8 mt-2" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Options for Multiple Choice */}
                                            {['Grammar', 'Vocab', 'Listening'].includes(q.type) ? (
                                                <div className="grid grid-cols-2 gap-4 pl-12">
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${q.id}`}
                                                                checked={q.correctAnswer === opt && opt !== ''}
                                                                onChange={() => updateQuestion(qIdx, 'correctAnswer', opt)}
                                                                className="w-4 h-4 text-blue-600"
                                                                disabled={!opt}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                                placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                                                className={`flex-1 px-3 py-1.5 border rounded-md text-sm outline-none focus:border-blue-500 ${q.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50' : ''}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="pl-12 text-sm text-gray-500 italic">
                                                    * Phần thi này là tự luận/nói, không cần đáp án trắc nghiệm.
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </form>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button form="test-form" type="submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu lại'}
                    </Button>
                </div>
            </div>
        </div >
    );
}
