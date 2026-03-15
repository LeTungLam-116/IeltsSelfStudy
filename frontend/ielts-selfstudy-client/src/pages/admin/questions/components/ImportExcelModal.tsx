import React, { useState, useEffect } from 'react';
import { Modal, Button, useToast, Loading, Badge } from '../../../../components/ui';
import { previewImportExcel, confirmImportExcel } from '../../../../api/questionsApi';
import { useExerciseStore } from '../../../../stores';
import type { QuestionImportPreviewDto } from '../../../../types/questions';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
    const { exercises, fetchExercises } = useExerciseStore();
    const [selectedExerciseId, setSelectedExerciseId] = useState<number>(0);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [previewData, setPreviewData] = useState<QuestionImportPreviewDto[]>([]);
    const { success, error } = useToast();

    useEffect(() => {
        if (isOpen && exercises.length === 0) {
            fetchExercises({ pageNumber: 1, pageSize: 100 });
        }
        if (isOpen) {
            resetState();
        }
    }, [isOpen, exercises.length, fetchExercises]);

    const resetState = () => {
        setSelectedExerciseId(0);
        setFile(null);
        setStep(1);
        setPreviewData([]);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExerciseId) {
            error('Lỗi', 'Vui lòng chọn bài tập');
            return;
        }
        if (!file) {
            error('Lỗi', 'Vui lòng chọn file Excel');
            return;
        }

        try {
            setIsSubmitting(true);
            const data = await previewImportExcel(selectedExerciseId, file);
            if (!data || data.length === 0) {
                error('Lỗi', 'Không tìm thấy dữ liệu hợp lệ trong file Excel');
                return;
            }
            setPreviewData(data);
            setStep(2);
        } catch (err: any) {
            console.error(err);
            error('Lỗi', err.response?.data?.message || 'Không thể đọc file Excel');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            const request = {
                exerciseId: selectedExerciseId,
                questions: previewData
            };
            const res = await confirmImportExcel(request);
            success('Thành công', res.message || 'Đã nhập câu hỏi thành công');
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error(err);
            error('Lỗi', err.response?.data?.message || 'Lỗi khi lưu dữ liệu vào hệ thống');
        } finally {
            setIsSubmitting(false);
        }
    };

    const readingListeningExercises = exercises.filter(
        (e) => e.type === 'Reading' || e.type === 'Listening'
    );

    const validCount = previewData.filter(x => x.isValid).length;
    const invalidCount = previewData.length - validCount;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nhập câu hỏi từ Excel" size={step === 2 ? 'xl' : 'md'}>
            {step === 1 ? (
                <form onSubmit={handlePreview} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn bài tập <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedExerciseId}
                            onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                            disabled={isSubmitting}
                        >
                            <option value={0}>-- Chọn bài tập (Reading/Listening) --</option>
                            {readingListeningExercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                    {ex.title} ({ex.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn file Excel (.xlsx) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md mt-4 text-sm text-blue-800">
                        <p className="font-semibold mb-2">Cấu trúc file Excel mẫu:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Cột A (STT): Số thứ tự câu hỏi (ví dụ: 1)</li>
                            <li>Cột B (Đề bài): Nội dung câu hỏi (bắt buộc)</li>
                            <li>Cột C (Loại): MultipleChoice, FillBlank, TrueFalse</li>
                            <li>Cột D-G (A, B, C, D): Nội dung các tùy chọn đáp án</li>
                            <li>Cột H (Đáp án): Đáp án đúng (vd: A, B, True, option_1...)</li>
                            <li>Cột I (Điểm): (vd: 1.0)</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex items-center">
                            {isSubmitting ? (
                                <div className="mr-2"><Loading /></div>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                            Xem trước
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">
                            Vui lòng kiểm tra lại dữ liệu trước khi lưu.
                            Có <span className="font-bold text-green-600">{validCount} câu hợp lệ</span> và <span className="font-bold text-red-600">{invalidCount} câu lỗi</span>.
                            (Các câu bị lỗi sẽ không được lưu)
                        </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">STT</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Đề bài</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Loại</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Đáp án</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewData.map((item, idx) => (
                                    <tr key={idx} className={item.isValid ? '' : 'bg-red-50'}>
                                        <td className="px-4 py-2">{item.questionNumber}</td>
                                        <td className="px-4 py-2 max-w-xs truncate" title={item.questionText}>{item.questionText}</td>
                                        <td className="px-4 py-2">{item.questionType}</td>
                                        <td className="px-4 py-2">{item.correctAnswer}</td>
                                        <td className="px-4 py-2">
                                            {item.isValid ? (
                                                <Badge variant="success">Hợp lệ</Badge>
                                            ) : (
                                                <div className="text-red-600 text-xs mt-1" title={item.errorMessage}>
                                                    <span className="font-semibold text-red-700">Lỗi: </span>{item.errorMessage}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between pt-4 border-t mt-4">
                        <Button variant="secondary" onClick={() => setStep(1)} disabled={isSubmitting}>
                            Quay lại
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={isSubmitting || validCount === 0}
                                className="flex items-center"
                            >
                                {isSubmitting ? (
                                    <div className="mr-2"><Loading /></div>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                )}
                                Xác nhận {validCount > 0 ? `& Lưu (${validCount})` : ''}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
