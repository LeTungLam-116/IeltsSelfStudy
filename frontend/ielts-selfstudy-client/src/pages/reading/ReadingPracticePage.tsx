import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExerciseStore, useAuthStore } from "../../stores";
import { getQuestionsByExercise } from "../../api/questionsApi";
import { createAttempt } from "../../api/attemptApi";
import type { QuestionDto } from "../../types/questions";
import { Button } from "../../components/ui";

// Helper to format seconds to MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function ReadingPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exerciseId = Number(id);

  const { fetchExerciseById } = useExerciseStore();
  const { user } = useAuthStore();

  // State
  const [exercise, setExercise] = useState<any | null>(null);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<'intro' | 'active' | 'finished'>('intro');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes default
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Submission Result State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ score: number; maxScore: number; attemptId?: number } | null>(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  // Fetch Data
  useEffect(() => {
    const load = async () => {
      if (!exerciseId) return;
      setLoading(true);
      try {
        const [ex, qs] = await Promise.all([
          fetchExerciseById(exerciseId),
          getQuestionsByExercise(exerciseId)
        ]);
        setExercise(ex);
        setQuestions(qs || []);

        // If exercise has duration, set it
        if (ex.durationSeconds) {
          setTimeLeft(ex.durationSeconds);
        }
      } catch (err: any) {
        console.error('Failed to load exercise data', err);
        setError(err.message || 'Failed to load exercise');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [exerciseId, fetchExerciseById]);

  // Timer Logic
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto submit
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

  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;

    questions.forEach(q => {
      maxScore += q.points || 1;
      const userAnswer = answers[q.id];
      // Simple case-insensitive match
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
        score += q.points || 1;
      }
    });

    return { score, maxScore };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!user) {
      alert("Authentication error. Please login to submit.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { score, maxScore } = calculateScore();

      // Call API
      const attempt = await createAttempt({
        userId: user.id || 1, // Fallback safe, but usually user.id is present
        skill: 'Reading',
        exerciseId: exerciseId,
        score: score,
        maxScore: maxScore,
        userAnswerJson: JSON.stringify(answers)
      });

      // Set Result
      setSubmissionResult({
        score,
        maxScore,
        attemptId: attempt.id
      });

      setStatus('finished');
      setShowResultOverlay(true);

    } catch (err) {
      console.error("Submission failed", err);
      alert("Failed to submit result. Please check your connection.");
      setIsSubmitting(false); // Only reset if failed so usage can try again
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Render a single question
  const renderQuestion = (q: QuestionDto, index: number) => {
    let options: any[] = [];
    if (q.optionsJson) {
      try {
        options = JSON.parse(q.optionsJson).map((o: any) => ({ ...o, id: o.id || o.label }));
      } catch (e) {
        console.error("Failed to parse options", e);
      }
    }

    // In finished mode, show if answer was correct
    const isFinished = status === 'finished';
    const userAnswer = answers[q.id];
    const isCorrect = isFinished && userAnswer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

    return (
      <div key={q.id} className={`mb-8 p-4 rounded-lg border transition-colors ${isFinished
        ? (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
        : 'bg-white border-gray-200 hover:border-blue-300'
        }`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold rounded-full ${isFinished
            ? (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800')
            : 'bg-blue-100 text-blue-700'
            }`}>
            {index + 1}
          </div>
          <div className="flex-grow">
            <div className="mb-3 text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: q.questionText }} />

            {q.questionType === 'MultipleChoice' && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isFinished
                    ? (q.correctAnswer == opt.id?.toString() ? 'bg-green-100 border-green-300' : (answers[q.id] == opt.id?.toString() ? 'bg-red-100 border-red-300' : 'border-transparent'))
                    : 'border-transparent hover:bg-blue-50'
                    }`}>
                    {/* Note: ID comparison might need strings */}
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt.id}
                      checked={answers[q.id] == opt.id?.toString()}
                      onChange={(e) => !isFinished && handleAnswerChange(q.id, e.target.value)}
                      disabled={isFinished}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {(q.questionType === 'TrueFalse' || q.questionType === 'TrueFalseNotGiven') && (
              <div className="flex gap-6 mt-2">
                {(q.questionType === 'TrueFalseNotGiven' ? ['True', 'False', 'Not Given'] : ['True', 'False']).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      checked={answers[q.id]?.toLowerCase() === opt.toLowerCase()}
                      onChange={(e) => !isFinished && handleAnswerChange(q.id, e.target.value)}
                      disabled={isFinished}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-base font-medium text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.questionType === 'FillBlank' && (
              <div>
                <input
                  type="text"
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={isFinished}
                />
                {isFinished && !isCorrect && (
                  <div className="mt-2 text-sm text-green-700 font-medium">
                    Correct Answer: {q.correctAnswer}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
        <p className="text-gray-600 mb-6">{error || 'Exercise not found'}</p>
        <Button onClick={() => navigate('/reading/list')}>Back to List</Button>
      </div>
    );
  }

  // INTRO SCREEN
  if (status === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
            <p className="opacity-90">IELTS Reading Practice</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{questions.length}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Questions</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{Math.floor((exercise.durationSeconds || 3600) / 60)}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Minutes</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{exercise.level || 'N/A'}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Level</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">Passage</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Included</div>
              </div>
            </div>

            <div className="prose text-gray-600 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Instructions:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Read the passage carefully on the left side of the screen.</li>
                <li>Answer all questions on the right side.</li>
                <li>The timer will start as soon as you click "Start Test".</li>
                <li>You can review your answers before submitting.</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button size="lg" className="w-full md:w-auto px-12 py-4 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handleStart}>
                Start Test Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM SCREEN (and REVIEW screen under the overlay)
  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden relative">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
        <h2 className="font-bold text-gray-800 line-clamp-1 max-w-md">{exercise.title}</h2>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {status !== 'finished' && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (window.confirm("Are you sure you want to finish the test?")) {
                  handleSubmit();
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          )}

          {status === 'finished' && (
            <Button variant="outline" onClick={() => navigate('/reading/list')}>
              Exit Review
            </Button>
          )}
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Side: Passage */}
        <div className="w-1/2 h-full overflow-y-auto border-r border-gray-200 bg-white">
          <div className="p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 sticky top-0 bg-white py-4 border-b">Reading Passage</h3>
            <div className="prose prose-lg max-w-none text-gray-800 leading-loose text-justify font-serif">
              {/* Basic handling for line breaks if plain text */}
              {exercise.passageText?.split('\n').map((para: string, i: number) => (
                <p key={i} className="mb-4">{para}</p>
              )) || <p className="italic text-gray-500">No passage content available.</p>}
            </div>
          </div>
        </div>

        {/* Right Side: Questions */}
        <div className="w-1/2 h-full overflow-y-auto bg-slate-50">
          <div className="p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 sticky top-0 bg-slate-50 py-4 border-b z-10 flex justify-between items-center">
              <span>{status === 'finished' ? 'Review Answers' : 'Questions'}</span>
              <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border">
                {Object.keys(answers).length} / {questions.length} Answered
              </span>
            </h3>

            <div className="space-y-6 pb-20">
              {questions.length > 0 ? (
                questions.map((q, idx) => renderQuestion(q, idx))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  No questions available for this exercise.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {status === 'finished' && submissionResult && showResultOverlay && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            {/* Close button to hide overlay and see review */}
            <button
              onClick={() => setShowResultOverlay(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className={`p-6 text-white text-center ${(submissionResult.score / submissionResult.maxScore || 0) >= 0.6 ? 'bg-emerald-600' : 'bg-red-500'}`}>
              <h2 className="text-2xl font-bold mb-1">{(submissionResult.score / submissionResult.maxScore || 0) >= 0.6 ? 'Well Done!' : 'Keep Practicing!'}</h2>
              <p className="opacity-90">Test Completed</p>
            </div>
            <div className="p-8 text-center">
              <div className="text-5xl font-black text-gray-800 mb-2">
                {submissionResult.score} <span className="text-2xl text-gray-400 font-normal">/ {submissionResult.maxScore}</span>
              </div>
              <p className="text-gray-500 mb-6">Your Score</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-800">{questions.length}</div>
                  <div className="text-xs text-gray-500">Total Questions</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-800">{Math.round((submissionResult.score / submissionResult.maxScore) * 100) || 0}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => setShowResultOverlay(false)} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3">
                  Review Answers
                </Button>
                <Button variant="outline" onClick={() => navigate('/reading/list')} className="w-full">
                  Back to List
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReadingPracticePage;