
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlacementTest, submitPlacementTest } from '../../api/placementTestApi';
import { Button, Card, Loading, useToast } from '../../components/ui';
import { IconMicrophone } from '../../components/icons';

type Question = {
    id: number;
    text: string;
    type: string;
    options: string[];
    correctAnswer: string;
    audioUrl?: string;
};

type TestStep = 'intro' | 'grammar-vocab' | 'listening' | 'challenge-intro' | 'speaking' | 'writing' | 'submitting';

// ── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function getFullAudioUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const apiBase = import.meta.env.VITE_API_URL || 'https://localhost:7295';
    const rootUrl = apiBase.endsWith('/api') ? apiBase.replace('/api', '') : apiBase;
    return `${rootUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Progress Bar ─────────────────────────────────────────────────────────────

function StepProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: pct === 100 ? '#22c55e' : '#3b82f6' }}>
                    {current}/{total} câu
                </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '99px',
                    background: pct === 100
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                    transition: 'width 0.4s ease'
                }} />
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PlacementTestPage() {
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<TestStep>('intro');

    const [gvQuestions, setGvQuestions] = useState<Question[]>([]);
    const [listeningQuestions, setListeningQuestions] = useState<Question[]>([]);
    const [speakingQuestion, setSpeakingQuestion] = useState<Question | null>(null);
    const [writingQuestion, setWritingQuestion] = useState<Question | null>(null);

    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [essay, setEssay] = useState('');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        getPlacementTest()
            .then(data => {
                try {
                    let raw: any[] = [];
                    if ((data as any).questions && Array.isArray((data as any).questions)) {
                        raw = (data as any).questions;
                    } else if (data.questionsJson) {
                        raw = JSON.parse(data.questionsJson);
                    }

                    const processed: Question[] = raw.map((q: any) => ({
                        id: q.id || q.Id,
                        text: q.text || q.Text,
                        type: q.type || q.Type || 'Grammar',
                        options: q.options || q.Options || [],
                        correctAnswer: q.correctAnswer || q.CorrectAnswer,
                        audioUrl: q.audioUrl || q.AudioUrl || q.Audio_Url || q.audio_url
                    }));

                    const gv = processed.filter(q =>
                        ['grammar', 'vocab'].includes(q.type.toLowerCase())
                    );
                    const listening = processed.filter(q => q.type.toLowerCase() === 'listening');

                    setGvQuestions(gv);
                    setListeningQuestions(listening);
                    setSpeakingQuestion(processed.find(q => q.type.toLowerCase() === 'speaking') || null);
                    setWritingQuestion(processed.find(q => q.type.toLowerCase() === 'writing') || null);
                } catch {
                    showError('Lỗi', 'Không thể tải dữ liệu bài kiểm tra');
                } finally {
                    setLoading(false);
                }
            })
            .catch(() => {
                showError('Lỗi', 'Không thể tải bài kiểm tra. Vui lòng thử lại.');
                setLoading(false);
            });
    }, []);

    // ── Navigation ──────────────────────────────────────────────────────────

    const handleStart = () => {
        if (gvQuestions.length > 0) setStep('grammar-vocab');
        else if (listeningQuestions.length > 0) setStep('listening');
        else setStep('challenge-intro');
    };

    const handleGvSubmit = () => {
        if (listeningQuestions.length > 0) setStep('listening');
        else setStep('challenge-intro');
    };

    const handleListeningSubmit = () => setStep('challenge-intro');

    const handleSkipChallenge = () => handleSubmitFinal(false);

    const handleStartChallenge = () => {
        if (speakingQuestion) setStep('speaking');
        else if (writingQuestion) setStep('writing');
        else handleSubmitFinal(false);
    };

    const handleSpeakingSubmit = () => {
        if (writingQuestion) setStep('writing');
        else handleSubmitFinal(true);
    };

    // ── Recording ────────────────────────────────────────────────────────────

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioPreviewUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 120) { stopRecording(); return 120; }
                    return prev + 1;
                });
            }, 1000);
        } catch {
            showError('Lỗi', 'Không thể truy cập microphone. Vui lòng cấp quyền trong trình duyệt.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setAudioPreviewUrl(null);
        setRecordingTime(0);
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmitFinal = async (includeChallenge: boolean) => {
        setStep('submitting');
        try {
            const sAudio = (includeChallenge && audioBlob)
                ? new File([audioBlob], 'speaking.webm', { type: 'audio/webm' })
                : undefined;

            if (sAudio) console.log('[PlacementSubmit] Sending audio file:', sAudio.name, sAudio.size, 'bytes');

            const result = await submitPlacementTest({
                answersJson: JSON.stringify(answers),
                writingEssay: includeChallenge ? essay : undefined,
                speakingAudio: sAudio
            });
            navigate('/placement/result', { state: { result } });
        } catch {
            showError('Lỗi', 'Nộp bài thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.');
            if (essay || audioBlob) {
                if (writingQuestion) setStep('writing');
                else if (speakingQuestion) setStep('speaking');
                else setStep('challenge-intro');
            } else {
                setStep('challenge-intro');
            }
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    const countAnswered = (questions: Question[]) =>
        questions.filter(q => answers[q.id] !== undefined).length;

    const isStepComplete = (questions: Question[]) =>
        questions.every(q => answers[q.id] !== undefined);

    const renderQuestionList = (questions: Question[]) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, idx) => (
                <Card key={q.id} className="p-6">
                    <h3 className="font-medium text-lg mb-4 flex gap-3">
                        <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">
                            {idx + 1}
                        </span>
                        <div className="flex-1">
                            <div className="mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 border border-gray-200 px-2 py-0.5 rounded mr-2">
                                    {q.type === 'Grammar' ? 'Ngữ pháp'
                                        : q.type === 'Vocab' ? 'Từ vựng'
                                            : q.type === 'Listening' ? 'Nghe'
                                                : q.type}
                                </span>
                                {q.text}
                            </div>
                            {q.type.toLowerCase() === 'listening' && (
                                <div className="mt-2">
                                    {q.audioUrl ? (
                                        <audio
                                            controls
                                            src={getFullAudioUrl(q.audioUrl)}
                                            className="w-full max-w-md h-12 bg-gray-50 rounded-lg block"
                                            controlsList="nodownload"
                                        />
                                    ) : (
                                        <p className="text-red-500 text-sm font-bold">⚠️ Không tìm thấy file âm thanh cho câu hỏi này.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                        {q.options && q.options.map((opt: string) => (
                            <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${answers[q.id] === opt
                                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-gray-700 font-medium">{opt}</span>
                            </label>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );

    // ── Render ───────────────────────────────────────────────────────────────

    if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

    // ── Intro ────────────────────────────────────────────────────────────────
    if (step === 'intro') {
        const sections = [
            gvQuestions.length > 0 && {
                icon: '🧠', label: 'Phần 1', title: 'Ngữ pháp & Từ vựng',
                desc: `${gvQuestions.length} câu hỏi trắc nghiệm`,
                accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe'
            },
            listeningQuestions.length > 0 && {
                icon: '🎧', label: 'Phần 2', title: 'Kỹ năng Nghe',
                desc: `${listeningQuestions.length} câu hỏi nghe`,
                accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe'
            },
            (speakingQuestion || writingQuestion) && {
                icon: '🤖', label: 'Phần 3', title: 'Nói & Viết (AI)',
                desc: 'Chấm điểm AI — tùy chọn, tăng độ chính xác',
                accent: '#059669', bg: '#f0fdf4', border: '#a7f3d0'
            },
        ].filter(Boolean) as any[];

        return (
            <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 16px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        fontSize: '28px', marginBottom: '16px'
                    }}>📝</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                        Kiểm tra đầu vào IELTS
                    </h1>
                    <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>
                        Đánh giá năng lực hiện tại để nhận lộ trình học cá nhân hoá phù hợp nhất với bạn.
                    </p>
                </div>

                {/* Section list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {sections.map((s, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            backgroundColor: s.bg,
                            border: `1.5px solid ${s.border}`,
                            borderRadius: '16px',
                            padding: '16px 20px'
                        }}>
                            {/* Number badge */}
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                backgroundColor: s.accent, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: 800
                            }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                                    {s.title}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>{s.desc}</div>
                            </div>
                            <span style={{ fontSize: '24px' }}>{s.icon}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleStart}
                    style={{
                        width: '100%', padding: '16px',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: 'white', border: 'none', borderRadius: '14px',
                        fontSize: '17px', fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                        transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseOver={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(37,99,235,0.4)';
                    }}
                    onMouseOut={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(37,99,235,0.35)';
                    }}
                >
                    Bắt đầu kiểm tra →
                </button>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '12px' }}>
                    ⏱ Thời gian ước tính: 10–15 phút
                </p>
            </div>
        );
    }

    // ── Grammar & Vocab ───────────────────────────────────────────────────────
    if (step === 'grammar-vocab') {
        const answered = countAnswered(gvQuestions);
        return (
            <div className="max-w-3xl mx-auto py-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Phần 1: Ngữ pháp &amp; Từ vựng</h2>
                </div>
                <StepProgressBar current={answered} total={gvQuestions.length} label="Tiến độ trả lời" />
                {renderQuestionList(gvQuestions)}
                <div className="mt-8 flex justify-end">
                    <Button size="lg" onClick={handleGvSubmit} disabled={!isStepComplete(gvQuestions)}>
                        {!isStepComplete(gvQuestions)
                            ? `Còn ${gvQuestions.length - answered} câu chưa trả lời`
                            : listeningQuestions.length > 0 ? 'Tiếp tục sang phần Nghe ➝' : 'Tiếp tục ➝'}
                    </Button>
                </div>
            </div>
        );
    }

    // ── Listening ────────────────────────────────────────────────────────────
    if (step === 'listening') {
        const answered = countAnswered(listeningQuestions);
        return (
            <div className="max-w-3xl mx-auto py-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Phần 2: Kỹ năng Nghe</h2>
                </div>
                <StepProgressBar current={answered} total={listeningQuestions.length} label="Tiến độ trả lời" />
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-sm">
                    ⚠️ Lưu ý: Hãy đảm bảo bạn ở nơi yên tĩnh, bật loa/tai nghe đủ nghe trước khi bắt đầu.
                </div>
                {renderQuestionList(listeningQuestions)}
                <div className="mt-8 flex justify-end">
                    <Button size="lg" onClick={handleListeningSubmit} disabled={!isStepComplete(listeningQuestions)}>
                        {!isStepComplete(listeningQuestions)
                            ? `Còn ${listeningQuestions.length - answered} câu chưa trả lời`
                            : 'Hoàn thành phần trắc nghiệm ➝'}
                    </Button>
                </div>
            </div>
        );
    }

    // ── Challenge Intro ───────────────────────────────────────────────────────
    if (step === 'challenge-intro') {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-10 text-center space-y-6 animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg">🚀</div>
                    <h2 className="text-3xl font-bold text-gray-900">Nâng cấp bài test với AI?</h2>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Bạn đã hoàn thành phần trắc nghiệm. Để có lộ trình chính xác nhất, hãy dành thêm{' '}
                        <strong>5 phút</strong> để AI đánh giá kỹ năng Nói &amp; Viết của bạn.
                    </p>
                    <div className="bg-purple-50 rounded-2xl p-4 text-left text-sm text-purple-800 space-y-1">
                        {speakingQuestion && <p>🎤 <strong>Nói:</strong> Trả lời câu hỏi &amp; ghi âm giọng nói</p>}
                        {writingQuestion && <p>✍️ <strong>Viết:</strong> Viết đoạn văn ngắn (tối thiểu 10 từ)</p>}
                    </div>
                    <div className="flex flex-col gap-4 max-w-xs mx-auto pt-2">
                        <Button
                            onClick={handleStartChallenge}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 shadow-purple-200 shadow-lg text-white font-bold"
                        >
                            Chấp nhận thử thách
                        </Button>
                        <Button variant="ghost" onClick={handleSkipChallenge} className="text-gray-500">
                            Bỏ qua, lấy kết quả sơ bộ
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Speaking ─────────────────────────────────────────────────────────────
    if (step === 'speaking' && speakingQuestion) {
        return (
            <div className="max-w-3xl mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
                    🤖 Phần thi Nói — Chấm điểm bởi AI
                </h1>
                <Card className="p-8 border-l-4 border-l-orange-500 text-left">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <IconMicrophone className="w-6 h-6" />
                        </span>
                        <h3 className="font-bold text-lg">Đề bài Nói</h3>
                    </div>
                    <p className="text-gray-700 text-lg mb-8 bg-slate-50 p-6 rounded-2xl border border-dashed border-gray-300 leading-relaxed font-medium">
                        {speakingQuestion.text}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 py-6 border-t border-gray-100">
                        {/* Chưa ghi âm */}
                        {!isRecording && !audioBlob && (
                            <div className="text-center">
                                <button
                                    onClick={startRecording}
                                    className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200 flex items-center justify-center transition-all hover:scale-110 mb-3 mx-auto"
                                >
                                    <IconMicrophone className="w-8 h-8" />
                                </button>
                                <p className="text-gray-500 text-sm">Nhấn để bắt đầu ghi âm (tối đa 2 phút)</p>
                            </div>
                        )}

                        {/* Đang ghi âm */}
                        {isRecording && (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center animate-pulse mb-3 mx-auto border-4 border-red-100">
                                    <span className="font-mono font-bold text-xl">{recordingTime}s</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">🔴 Đang ghi âm... ({120 - recordingTime}s còn lại)</p>
                                <Button variant="outline" onClick={stopRecording} className="border-red-200 text-red-600 hover:bg-red-50 px-6">
                                    Dừng ghi âm
                                </Button>
                            </div>
                        )}

                        {/* Đã ghi âm xong */}
                        {audioBlob && audioPreviewUrl && (
                            <div className="w-full max-w-md">
                                <div className="flex items-center gap-4 bg-green-50 p-4 rounded-xl border border-green-200 mb-4">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">✓</div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-green-800">Đã ghi âm thành công</p>
                                        <p className="text-xs text-green-600">Thời lượng: {recordingTime} giây</p>
                                    </div>
                                    <button
                                        onClick={resetRecording}
                                        className="text-sm font-medium text-red-500 hover:underline px-2"
                                    >
                                        Ghi lại
                                    </button>
                                </div>
                                {/* Nghe lại */}
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500 mb-1">🎧 Nghe lại bản ghi âm của bạn:</p>
                                    <audio controls src={audioPreviewUrl} className="w-full h-10" />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="mt-8 flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleSpeakingSubmit}
                        disabled={!audioBlob}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-xl text-lg shadow-lg shadow-orange-200"
                    >
                        {writingQuestion ? 'Tiếp tục sang phần Viết ➝' : 'Hoàn thành bài thi 🚀'}
                    </Button>
                </div>
            </div>
        );
    }

    // ── Writing ───────────────────────────────────────────────────────────────
    if (step === 'writing' && writingQuestion) {
        const wordCount = countWords(essay);
        const charCount = essay.length;
        const MIN_WORDS = 10;
        const canSubmit = wordCount >= MIN_WORDS;

        return (
            <div className="max-w-4xl mx-auto py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
                    🤖 Phần thi Viết — Chấm điểm bởi AI
                </h1>
                <Card className="p-8 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-3 bg-blue-100 text-blue-600 rounded-xl text-2xl">✍️</span>
                        <h3 className="font-bold text-lg">Đề bài Viết</h3>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-gray-300 mb-6">
                        <p className="text-gray-700 text-lg leading-relaxed font-medium">
                            {writingQuestion.text}
                        </p>
                    </div>

                    <textarea
                        className="w-full h-64 p-5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none text-base leading-relaxed transition-all shadow-sm"
                        placeholder="Viết bài của bạn tại đây..."
                        value={essay}
                        onChange={(e) => setEssay(e.target.value)}
                        autoFocus
                    />

                    {/* Word & char count */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-sm">
                            <span style={{
                                fontWeight: 700,
                                color: canSubmit ? '#22c55e' : wordCount > 30 ? '#f59e0b' : '#ef4444'
                            }}>
                                {wordCount} từ
                            </span>
                            <span className="text-gray-400 ml-2">/ {charCount} ký tự</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            {canSubmit
                                ? <span className="text-green-600 font-semibold">✓ Đủ yêu cầu tối thiểu</span>
                                : <span>Tối thiểu <strong>{MIN_WORDS}</strong> từ (còn thiếu {MIN_WORDS - wordCount} từ)</span>}
                        </div>
                    </div>

                    {/* Mini progress bar for word count */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div style={{
                            height: '100%',
                            width: `${Math.min((wordCount / MIN_WORDS) * 100, 100)}%`,
                            borderRadius: '99px',
                            background: canSubmit ? '#22c55e' : wordCount > 30 ? '#f59e0b' : '#ef4444',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </Card>

                <div className="mt-8 flex justify-center">
                    <Button
                        size="lg"
                        onClick={() => handleSubmitFinal(true)}
                        disabled={!canSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl text-lg shadow-lg shadow-blue-200"
                    >
                        Nộp bài &amp; Xem kết quả 🚀
                    </Button>
                </div>
            </div>
        );
    }

    // ── Submitting ────────────────────────────────────────────────────────────
    if (step === 'submitting') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <Loading />
                <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-4">Đang phân tích kết quả...</h2>
                <p className="text-gray-500">AI đang chấm điểm và xây dựng lộ trình học cho bạn. Vui lòng không tắt trang.</p>
            </div>
        );
    }

    return null;
}
