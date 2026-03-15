import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAttemptById } from "../../api/attemptApi";
import type { AttemptDto } from "../../api/attemptApi";
import { getQuestionsByExercise } from "../../api/questionsApi";
import { Button } from "../../components/ui";

function safeParseJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Types for Parsed JSON Data
type StandardAnswerJson = {
  essayText?: string;     // Writing
  answerText?: string;    // Speaking
  wordCount?: number;
  question?: string;
  topic?: string;
  taskType?: string;
  part?: string;
  level?: string;
  // Listening/Reading specific
  // For L/R, the answerJson is mostly a Record<questionId, answer>
};

type FeedbackJson = {
  skill?: "Writing" | "Speaking" | string;
  overallBand?: number;
  criteria?: Record<string, number>;
  strengths?: string[];
  improvements?: string[];
  betterVersion?: string;
  betterAnswer?: string;
  corrections?: { original: string; corrected: string; reason?: string }[];
  mistakes?: { from: string; to: string; reason?: string }[]; // Backward compatibility
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AttemptDetailPage() {
  const { id } = useParams();
  const attemptId = Number(id);

  const [attempt, setAttempt] = useState<AttemptDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!attemptId) {
      setError("Invalid Attempt ID");
      setLoading(false);
      return;
    }

    getAttemptById(attemptId)
      .then((data) => setAttempt(data))
      .catch((err) => {
        console.error(err);
        setError("Tải dữ liệu thất bại.");
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    if (!attempt?.exerciseId) return;

    // Fetch questions to decode multiple-choice option IDs into readable text
    getQuestionsByExercise(attempt.exerciseId)
      .then((qs) => setQuestions(qs))
      .catch((err) => console.log("Failed to load questions for option decoding", err));
  }, [attempt?.exerciseId]);

  const optionMap = useMemo(() => {
    const map = new Map<string, string>();
    questions.forEach(q => {
      try {
        if (q.optionsJson) {
          const opts = JSON.parse(q.optionsJson);
          if (Array.isArray(opts)) {
            opts.forEach(o => {
              if (o.id && o.text) {
                map.set(String(o.id), o.text);
              }
            });
          }
        }
      } catch (e) { }
    });
    return map;
  }, [questions]);



  const userAnswer = useMemo(() => {
    // For Writing/Speaking, it's an object. For L/R, it might be an object map of answers.
    // We treat it generically first
    return safeParseJson<StandardAnswerJson | Record<string, string>>(attempt?.userAnswerJson);
  }, [attempt?.userAnswerJson]);

  const feedback = useMemo(() => {
    return safeParseJson<FeedbackJson>(attempt?.aiFeedback);
  }, [attempt?.aiFeedback]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h3 className="text-xl font-bold text-red-600 mb-2">Lỗi</h3>
        <p className="text-gray-600 mb-6">{error || "Không tìm thấy kết quả làm bài"}</p>
        <Link to="/dashboard">
          <Button>Về trang Tổng quan</Button>
        </Link>
      </div>
    );
  }

  // Helper to determine skill color theme
  const getThemeColor = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'writing': return 'blue';
      case 'speaking': return 'orange';
      case 'reading': return 'emerald';
      case 'listening': return 'purple';
      default: return 'gray';
    }
  };

  const renderUserAnswerDict = (answerObj: any) => {
    if (!answerObj) return 'Không có dữ liệu';
    if (typeof answerObj === 'object' && !Array.isArray(answerObj)) {
      return Object.entries(answerObj)
        .map(([key, value]) => {
          const rawVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
          // Try to find the actual option text if this matches an option id
          const decodedVal = optionMap.get(rawVal);
          const displayVal = decodedVal ? `${decodedVal}` : rawVal;
          return `Câu ${key}: ${displayVal}`;
        })
        .join('\n');
    }
    return JSON.stringify(answerObj, null, 2);
  };

  const color = getThemeColor(attempt.skill);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header / Summary Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className={`bg-${color}-600 p-8 text-white`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-1">Kết quả Làm bài</div>
                <h1 className="text-3xl font-bold">{attempt.exerciseTitle || `${attempt.skill} - Luyện tập`}</h1>
                <p className="opacity-90 text-sm mt-1">{formatDate(attempt.createdAt)}</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-xs uppercase font-bold opacity-80 mb-1">Điểm tổng</div>
                <div className="text-4xl font-black">{attempt.score?.toFixed(1) || '-'} <span className="text-lg font-medium opacity-70">/ {attempt.maxScore || 9}</span></div>
              </div>
            </div>
          </div>

          {/* Attempt Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
            {userAnswer && 'taskType' in userAnswer && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Dạng bài</div>
                <div className="font-semibold text-gray-800">{String(userAnswer.taskType)}</div>
              </div>
            )}
            {userAnswer && 'part' in userAnswer && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Phần</div>
                <div className="font-semibold text-gray-800">{String(userAnswer.part)}</div>
              </div>
            )}
            {userAnswer && 'wordCount' in userAnswer && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Số từ</div>
                <div className="font-semibold text-gray-800">{Number(userAnswer.wordCount)}</div>
              </div>
            )}
            {userAnswer && 'level' in userAnswer && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Trình độ</div>
                <div className="font-semibold text-gray-800">{String(userAnswer.level)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Question & Answer Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Question/Prompt */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Đề bài</h3>
            {userAnswer && 'question' in userAnswer ? (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {(userAnswer as any).question}
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-4 lg:pr-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="font-bold text-gray-800 mb-2">Câu {idx + 1}:</div>
                    <div className="text-sm text-gray-700 mb-2 border-b border-gray-200 pb-3" dangerouslySetInnerHTML={{ __html: q.questionText }}></div>
                    {q.optionsJson && (
                      <div className="text-xs text-gray-600 mt-3">
                        <span className="font-semibold block mb-2">Các lựa chọn:</span>
                        <ul className="space-y-1 pl-1">
                          {(() => {
                            try {
                              const opts = JSON.parse(q.optionsJson);
                              if (Array.isArray(opts)) {
                                return opts.map((o: any) => (
                                  <li key={o.id} className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>{o.text}</span>
                                  </li>
                                ));
                              }
                            } catch (e) { return null; }
                          })()}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 italic">Nội dung câu hỏi không khả dụng cho dạng bài này (Reading/Listening).</div>
            )}
          </div>

          {/* Right: User Answer */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Bài làm của bạn</h3>
            {(userAnswer as any)?.essayText || (userAnswer as any)?.answerText ? (
              <div className="bg-slate-50 p-4 rounded-xl text-gray-700 leading-relaxed whitespace-pre-wrap font-serif border border-slate-100 min-h-[200px]">
                {(userAnswer as any)?.essayText || (userAnswer as any)?.answerText}
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <div className="text-sm text-gray-700 bg-slate-50 p-4 rounded-xl leading-loose whitespace-pre-wrap font-mono">
                  {renderUserAnswerDict(userAnswer)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Feedback Section (For Speaking/Writing) */}
        {feedback && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Đánh giá từ AI</h2>

            {/* Score Breakdown */}
            {feedback.criteria && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(feedback.criteria).map(([key, val]) => (
                  <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <div className={`text-3xl font-black text-${color}-600`}>{Number(val).toFixed(1)}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase mt-1">{key}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed Feedback Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Điểm mạnh
                  </h4>
                  <ul className="space-y-3">
                    {feedback.strengths.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements && feedback.improvements.length > 0 && (
                <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Cần cải thiện
                  </h4>
                  <ul className="space-y-3">
                    {feedback.improvements.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Corrections */}
            {(feedback.corrections || feedback.mistakes) && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-800">Chữa lỗi chi tiết</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {(feedback.corrections || feedback.mistakes || []).map((item: any, i: number) => (
                    <div key={i} className="p-6 grid md:grid-cols-2 gap-4 group hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Từ bạn dùng</div>
                        <p className="text-red-700 bg-red-50 p-2 rounded-lg text-sm line-through decoration-red-400/50">{item.original || item.from}</p>
                        <p className="text-xs text-gray-400 mt-2 italic">{item.reason}</p>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1">Nên sửa thành</div>
                        <p className="text-emerald-700 bg-emerald-50 p-2 rounded-lg text-sm font-medium">{item.corrected || item.to}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Answer */}
            {(feedback.betterVersion || feedback.betterAnswer) && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                <h4 className="font-bold text-blue-900 mb-3">Bài mẫu tham khảo (Band 9.0+)</h4>
                <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line italic">
                  "{feedback.betterVersion || feedback.betterAnswer}"
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center pt-8">
          <Link to="/dashboard">
            <Button variant="outline" size="lg">← Trở về Tổng quan</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AttemptDetailPage;
