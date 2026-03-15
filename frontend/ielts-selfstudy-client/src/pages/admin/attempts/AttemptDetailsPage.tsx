import { useState, useEffect, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconBook, IconCheckCircle, IconXCircle } from '../../../components/icons';
import { Button, Loading, Card } from '../../../components/ui';
import { getAttemptById } from '../../../api/attemptsApi';
import { getQuestionsByExercise } from '../../../api/questionsApi';
import type { AttemptDto } from '../../../types/attempts';

const AttemptDetailsPage = memo(function AttemptDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AttemptDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getAttemptById(parseInt(id));
        setAttempt(data);
      } catch (err) {
        console.error('Failed to fetch attempt:', err);
        setError('Không thể tải chi tiết lượt làm bài. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempt();
  }, [id]);

  const [questions, setQuestions] = useState<any[]>([]);
  useEffect(() => {
    if (!attempt?.exerciseId) return;
    getQuestionsByExercise(attempt.exerciseId)
      .then(setQuestions)
      .catch(console.error);
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

  const handleBack = () => {
    navigate('/admin/attempts');
  };

  const handleGrade = () => {
    if (attempt) {
      navigate(`/admin/attempts/${attempt.id}/grade`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUserAnswer = (answerJson?: string) => {
    if (!answerJson) {
      return <p className="text-gray-500 italic">Không có câu trả lời</p>;
    }

    try {
      const answer = JSON.parse(answerJson);

      // Handle different answer formats based on exercise type
      if (typeof answer === 'string') {
        return <p className="whitespace-pre-wrap">{answer}</p>;
      }

      if (Array.isArray(answer)) {
        return (
          <ul className="list-disc list-inside space-y-1">
            {answer.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      }

      if (typeof answer === 'object') {
        return (
          <div className="space-y-3">
            {Object.entries(answer).map(([key, value]) => {
              const rawVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
              const decodedVal = optionMap.get(rawVal);
              const displayVal = decodedVal ? `${decodedVal}` : rawVal;
              return (
                <div key={key} className="p-3 bg-white rounded border border-gray-100 shadow-sm">
                  <strong className="text-gray-700 block mb-1">Câu {key}:</strong>
                  <span className="text-gray-900">{displayVal}</span>
                </div>
              );
            })}
          </div>
        );
      }

      return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(answer, null, 2)}</pre>;
    } catch (e) {
      return <p className="whitespace-pre-wrap">{answerJson}</p>;
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-8">
        <Loading text="Đang tải chi tiết lượt làm bài..." />
      </main>
    );
  }

  if (error || !attempt) {
    return (
      <main className="space-y-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chi tiết lượt làm bài</h1>
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy lượt làm bài'}</p>
          <Button onClick={handleBack}>Quay lại danh sách</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết lượt làm bài</h1>
            <p className="text-gray-600">Mã lượt làm: {attempt.id}</p>
          </div>
        </div>

        {!attempt.isGraded && (
          <Button onClick={handleGrade} className="bg-green-600 hover:bg-green-700">
            Chấm điểm bài làm
          </Button>
        )}
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${attempt.isGraded
        ? attempt.isPassed
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
        : 'bg-yellow-50 border border-yellow-200'
        }`}>
        <div className="flex items-center">
          {attempt.isGraded ? (
            attempt.isPassed ? (
              <IconCheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <IconXCircle className="w-5 h-5 text-red-600 mr-2" />
            )
          ) : (
            <div className="w-5 h-5 bg-yellow-500 rounded-full mr-2"></div>
          )}
          <div>
            <p className={`font-medium ${attempt.isGraded
              ? attempt.isPassed
                ? 'text-green-800'
                : 'text-red-800'
              : 'text-yellow-800'
              }`}>
              {attempt.isGraded
                ? attempt.isPassed
                  ? 'Đạt (Passed)'
                  : 'Không đạt (Failed)'
                : 'Đang chờ chấm điểm'
              }
            </p>
            {attempt.isGraded && attempt.score !== undefined && attempt.maxScore !== undefined && (
              <p className="text-sm text-gray-600">
                Điểm số: {attempt.score}/{attempt.maxScore}
                {attempt.maxScore > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({Math.round((attempt.score / attempt.maxScore) * 100)}%)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attempt Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chung</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Người làm bài</label>
                <div className="flex items-center mt-1">
                  <IconUser className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attempt.userName}</p>
                    <p className="text-sm text-gray-500">{attempt.userEmail}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Bài tập</label>
                <div className="flex items-center mt-1">
                  <IconBook className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attempt.exerciseTitle}</p>
                    <p className="text-sm text-gray-500">{attempt.skill === 'Listening' ? 'Listening (Nghe)' : attempt.skill === 'Reading' ? 'Reading (Đọc)' : attempt.skill === 'Writing' ? 'Writing (Viết)' : 'Speaking (Nói)'}</p>
                  </div>
                </div>
              </div>

              {attempt.courseTitle && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Khóa học</label>
                  <p className="text-sm text-gray-900 mt-1">{attempt.courseTitle}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Ngày nộp bài</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(attempt.createdAt)}</p>
              </div>

              {attempt.gradedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Đã chấm lúc</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(attempt.gradedAt)}</p>
                  {attempt.gradedBy && (
                    <p className="text-sm text-gray-500">bởi {attempt.gradedBy}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Exercise Details / Questions List */}
          {questions.length > 0 && (
            <Card className="p-6 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Đề bài ({questions.length} câu)</h2>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">Câu {idx + 1}:</div>
                    <div className="text-sm text-gray-700 mb-2 border-b border-gray-200 pb-2" dangerouslySetInnerHTML={{ __html: q.questionText }}></div>
                    {q.optionsJson && (
                      <div className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold block mb-1">Các lựa chọn:</span>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          {(() => {
                            try {
                              const opts = JSON.parse(q.optionsJson);
                              return opts.map((o: any) => <li key={o.id}>{o.text}</li>);
                            } catch (e) { return null; }
                          })()}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* User Answer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Câu trả lời của người dùng</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderUserAnswer(attempt.userAnswerJson)}
            </div>
          </Card>

          {/* AI Feedback (if available) */}
          {attempt.aiFeedback && (
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Phản hồi từ AI</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 whitespace-pre-wrap">{attempt.aiFeedback}</p>
              </div>
            </Card>
          )}

          {/* Grading Notes (if available) */}
          {attempt.gradingNotes && (
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ghi chú của giáo viên</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 whitespace-pre-wrap">{attempt.gradingNotes}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
});

AttemptDetailsPage.displayName = 'AttemptDetailsPage';

export default AttemptDetailsPage;
