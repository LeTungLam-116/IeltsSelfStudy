import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores";
import {
  evaluateWriting,
  getWritingExerciseById,
  type WritingExerciseDto,
} from "../../api/writingExerciseApi";
import { Button } from "../../components/ui";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function WritingPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const writingExerciseId = Number(id);
  const { user } = useAuthStore();

  // Data State
  const [exercise, setExercise] = useState<WritingExerciseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exam State
  const [status, setStatus] = useState<'intro' | 'active' | 'finished'>('intro');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // Default 60 mins
  const [essay, setEssay] = useState("");
  const wordCount = useMemo(() => countWords(essay), [essay]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score?: number | null; feedback?: string | null } | null>(null);

  useEffect(() => {
    if (!writingExerciseId) return;
    setIsLoading(true);
    getWritingExerciseById(writingExerciseId)
      .then((data) => {
        setExercise(data);
        // Adjust time based on Task Type if needed, for now default 60 mins or utilize a future duration field
        if (data.taskType === 'Task 1') setTimeLeft(20 * 60);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load writing exercise.");
      })
      .finally(() => setIsLoading(false));
  }, [writingExerciseId]);

  // Timer Logic
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleStart = () => {
    setStatus('active');
  };

  const handleSubmit = async () => {
    if (!exercise) return;

    if (wordCount < exercise.minWordCount && !window.confirm(`Your word count (${wordCount}) is below the minimum (${exercise.minWordCount}). Are you sure you want to submit?`)) {
      return;
    }

    if (!user) {
      alert("Authentication error. Please login.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await evaluateWriting(writingExerciseId, {
        userId: user.id || 1,
        essayText: essay,
        targetBand: user.targetBand || 6.5,
      });
      setResult(res);
      setStatus('finished');
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
        <p className="text-gray-600 mb-6">{error || 'Exercise not found'}</p>
        <Button onClick={() => navigate('/writing/list')}>Back to List</Button>
      </div>
    );
  }

  // INTRO SCREEN
  if (status === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.15 19H4.85L12 5.45z" /></svg>
            </div>
            <h1 className="font-outfit text-4xl font-black mb-3">{exercise.title}</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Hệ thống luyện viết IELTS thông minh</p>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                <div className="font-outfit text-2xl font-black text-slate-800 mb-1">{exercise.taskType}</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Loại bài</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                <div className="font-outfit text-2xl font-black text-slate-800 mb-1">{Math.floor(timeLeft / 60)}</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Thời gian</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                <div className="font-outfit text-2xl font-black text-slate-800 mb-1">{exercise.minWordCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Số từ min</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                <div className="font-outfit text-2xl font-black text-slate-800 mb-1">{exercise.level}</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Mức độ</div>
              </div>
            </div>

            <div className="prose text-slate-600 mb-12 max-w-none">
              <h3 className="font-outfit text-xl font-bold text-slate-800 mb-6 border-l-4 border-purple-500 pl-4">Quy trình làm bài:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {[
                  "Phân tích kỹ lưỡng yêu cầu đề bài được cung cấp.",
                  "Sử dụng công cụ soạn thảo thông minh để trình bày bài viết.",
                  "Quản lý thời gian hiệu quả thông qua bộ đếm ngược.",
                  "Nhấn 'Nộp bài' để nhận đánh giá chi tiết từ trí tuệ nhân tạo."
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-xs text-purple-600 border border-slate-100">{i + 1}</span>
                    <p className="font-semibold">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                size="xl"
                className="w-full md:w-auto px-16 h-20 text-lg rounded-full font-outfit font-black bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-300 transition-all active:scale-95"
                onClick={handleStart}
              >
                Bắt đầu làm bài ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FINISHED / RESULT SCREEN
  if (status === 'finished') {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-10 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.15 19H4.85L12 5.45z" /></svg>
              </div>
              <h1 className="font-outfit text-4xl font-black mb-3 text-white">Phân tích kết quả</h1>
              <p className="text-emerald-50 font-medium text-lg opacity-95">Hệ thống AI đã hoàn tất chấm điểm bài viết của bạn.</p>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: The Essay (Paper Like) */}
              <div className="lg:col-span-7">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-outfit text-2xl font-extrabold text-slate-800 tracking-tight">Bài viết của bạn</h3>
                  <div className="px-5 py-2 bg-slate-100 rounded-2xl text-slate-500 font-black text-xs tracking-widest uppercase">
                    {wordCount} TỪ
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-12 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] min-h-[600px] relative">
                  <div className="text-slate-700 text-xl leading-[2.2] font-medium whitespace-pre-wrap selection:bg-emerald-100">
                    {essay}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Feedback */}
              <div className="lg:col-span-5 space-y-8">
                <h3 className="font-outfit text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">Đánh giá chi tiết</h3>

                {result ? (
                  <div className="space-y-8 animate-fade-in text-xs">
                    {/* Score Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/40">
                      <div className="flex items-center gap-8 mb-10">
                        <div className="bg-emerald-600 w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-emerald-200 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                          <span className="text-[10px] uppercase font-black text-emerald-100 tracking-widest mb-1 relative z-10">BAND</span>
                          <div className="text-5xl font-black text-white relative z-10">{result.score?.toFixed(1) || 'N/A'}</div>
                        </div>

                        <div className="flex-grow grid grid-cols-2 gap-3">
                          {(() => {
                            try {
                              const fb = result.feedback ? JSON.parse(result.feedback) : {};
                              const criteria = fb.criteria || {};
                              const labels: Record<string, string> = { TR: 'Task', CC: 'Coh', LR: 'Lex', GRA: 'Gram' };
                              return Object.entries(criteria).map(([key, val]: [string, any]) => (
                                <div key={key} className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl text-center">
                                  <div className="text-lg font-black text-slate-800">{Number(val).toFixed(1)}</div>
                                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{labels[key] || key}</div>
                                </div>
                              ));
                            } catch (e) { return null; }
                          })()}
                        </div>
                      </div>

                      {/* AI Summary/Feedback Parsing */}
                      {(() => {
                        try {
                          const fb = result.feedback ? JSON.parse(result.feedback) : null;
                          if (!fb) return null;

                          return (
                            <div className="space-y-8">
                              {/* Strengths & Weaknesses Grid */}
                              <div className="grid grid-cols-1 gap-5 text-sm">
                                <div className="bg-emerald-50/40 border border-emerald-100 p-6 rounded-[2rem]">
                                  <h4 className="font-outfit font-black text-emerald-800 mb-4 text-sm flex items-center gap-2 uppercase tracking-wider">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    Điểm mạnh
                                  </h4>
                                  <ul className="space-y-3 font-semibold italic">
                                    {fb.strengths?.map((item: string, i: number) => (
                                      <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-orange-50/40 border border-orange-100 p-6 rounded-[2rem]">
                                  <h4 className="font-outfit font-black text-orange-800 mb-4 text-sm flex items-center gap-2 uppercase tracking-wider">
                                    <svg className="w-5 h-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Cần cải thiện
                                  </h4>
                                  <ul className="space-y-3 font-semibold italic">
                                    {fb.improvements?.map((item: string, i: number) => (
                                      <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-2.5"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Corrections List */}
                              {fb.corrections && fb.corrections.length > 0 && (
                                <div className="mt-10">
                                  <h4 className="font-outfit font-black text-slate-800 mb-6 text-xl tracking-tight">Phân tích lỗi sai</h4>
                                  <div className="space-y-5 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                                    {fb.corrections.map((item: any, i: number) => (
                                      <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                        <div className="space-y-4">
                                          <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-2xl text-xs font-black italic shadow-sm">!</div>
                                            <p className="text-red-500/80 line-through text-sm font-medium pt-1 italic">{item.original}</p>
                                          </div>
                                          <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-emerald-100">OK</div>
                                            <p className="text-slate-800 text-base font-bold pt-1">{item.corrected}</p>
                                          </div>
                                          <div className="mt-4 pt-4 border-t border-slate-200/50">
                                            <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                              <span className="text-slate-400 mr-1 opacity-50 font-black tracking-widest uppercase text-[10px]">Giải thích:</span>
                                              {item.reason}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Better Version Suggestion */}
                              {fb.betterVersion && (
                                <div className="mt-10 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                                  <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.15 19H4.85L12 5.45z" /></svg>
                                  </div>
                                  <h4 className="font-outfit font-black text-2xl mb-6 tracking-tight">Bài mẫu tiêu chuẩn</h4>
                                  <div className="bg-white/5 backdrop-blur-md p-7 rounded-[1.5rem] border border-white/10">
                                    <p className="text-blue-50/95 text-lg leading-relaxed italic font-medium">
                                      "{fb.betterVersion}"
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        } catch (err) {
                          return <div className="text-red-500 font-bold p-10 text-center text-xs">Lỗi xử lý dữ liệu đánh giá.</div>;
                        }
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"></div>
                    <p className="text-slate-400 font-black font-outfit uppercase tracking-widest text-[10px]">Đang xử lý kết quả...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-50/80 p-12 border-t border-slate-100 flex flex-col md:flex-row justify-center gap-8">
              <Button
                variant="outline"
                size="xl"
                className="rounded-full px-12 h-20 font-outfit font-black text-lg border-2 hover:bg-white hover:shadow-xl transition-all active:scale-95"
                onClick={() => navigate('/writing/list')}
              >
                Quay lại danh sách
              </Button>
              <Button
                size="xl"
                className="bg-slate-800 hover:bg-black text-white rounded-full px-16 h-20 font-outfit font-black text-lg shadow-2xl shadow-slate-200 transition-all active:scale-95"
                onClick={() => window.location.reload()}
              >
                Làm lại bài khác
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM SCREEN
  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-outfit font-black text-xl">W</div>
          <h2 className="font-outfit font-bold text-slate-800 line-clamp-1 max-w-xs md:max-w-md text-xl tracking-tight">{exercise.title}</h2>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shadow-inner">
            <svg className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-outfit text-xl font-black tabular-nums tracking-tighter ${timeLeft < 300 ? 'text-red-600' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 font-outfit font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ĐANG NỘP...' : 'NỘP BÀI'}
          </Button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Side: Prompt */}
        <div className="w-2/5 h-full overflow-y-auto border-r border-slate-200 bg-white shadow-2xl z-0 relative">
          <div className="p-10">
            <h3 className="font-outfit text-2xl font-black text-slate-800 mb-8 sticky top-0 bg-white py-4 border-b border-slate-50 z-10">Yêu cầu đề bài</h3>

            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-2">
                {exercise.taskType}
              </span>
              <p className="text-gray-800 font-medium text-lg leading-relaxed">
                {exercise.question}
              </p>
            </div>

            {/* Task 1 Image (Chart/Graph/Map) */}
            {exercise.imageUrl && (
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Visual Data:</h4>
                <img
                  src={exercise.imageUrl}
                  alt="Task 1 Visual"
                  className="w-full h-auto rounded-lg border border-gray-100"
                />
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-gray-600">
              <h4 className="font-bold text-gray-800 mb-2">Yêu cầu:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Viết ít nhất {exercise.minWordCount} từ.</li>
                <li>Trả lời đầy đủ các phần của nhiệm vụ.</li>
                <li>Sử dụng phong cách viết trang trọng.</li>
              </ul>
            </div>

            {exercise.description && (
              <div className="mt-6 text-gray-600 text-sm">
                <h4 className="font-bold text-gray-800 mb-2">Description:</h4>
                <p>{exercise.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Input */}
        <div className="w-2/3 h-full bg-slate-50 flex flex-col">
          <div className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Bài làm của bạn</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${wordCount < exercise.minWordCount
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                {wordCount} từ
              </span>
            </div>

            <textarea
              className="flex-grow w-full p-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-sans text-lg leading-relaxed"
              placeholder="Bắt đầu viết bài luận của bạn tại đây..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WritingPracticePage;
