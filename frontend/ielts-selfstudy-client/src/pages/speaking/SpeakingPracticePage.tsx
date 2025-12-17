import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  evaluateSpeaking,
  getSpeakingExerciseById,
  type SpeakingExerciseDto,
} from "../../api/speakingExerciseApi";

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function SpeakingPracticePage() {
  const { id } = useParams();
  const speakingExerciseId = Number(id);

  const [exercise, setExercise] = useState<SpeakingExerciseDto | null>(null);
  const [answerText, setAnswerText] = useState("");
  const wordCount = useMemo(() => countWords(answerText), [answerText]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!speakingExerciseId) return;

    setLoading(true);
    setError(null);

    getSpeakingExerciseById(speakingExerciseId)
      .then(setExercise)
      .catch((e) => {
        console.error(e);
        setError("Không tải được bài Speaking.");
      })
      .finally(() => setLoading(false));
  }, [speakingExerciseId]);

  const handleSubmit = async () => {
    if (!exercise) return;

    setError(null);
    setAttemptId(null);
    setScore(null);
    setMaxScore(null);
    setFeedback(null);

    if (!answerText.trim()) {
      setError("Bạn chưa nhập câu trả lời.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await evaluateSpeaking(speakingExerciseId, {
        userId: 1,         // TODO: lấy từ auth
        answerText: answerText,
        targetBand: 4.5,
      });

      setAttemptId(result.attemptId);
      setScore(result.score ?? null);
      setMaxScore(result.maxScore ?? null);
      setFeedback(result.feedback ?? null);
    } catch (e) {
      console.error(e);
      setError("Có lỗi khi nộp bài Speaking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Đang tải bài Speaking...</p>;
  if (error && !exercise) return <p style={{ color: "red" }}>{error}</p>;
  if (!exercise) return <p>Không tìm thấy bài Speaking.</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Speaking Practice: {exercise.title}</h2>
      <p>
        <strong>Part:</strong> {exercise.part} • <strong>Level:</strong> {exercise.level}
      </p>
      {exercise.topic && <p><strong>Topic:</strong> {exercise.topic}</p>}
      {exercise.description && <p>{exercise.description}</p>}

      <hr />

      <h3>Question</h3>
      <p style={{ whiteSpace: "pre-line" }}>{exercise.question}</p>

      {exercise.tips && (
        <>
          <h4>Tips</h4>
          <p style={{ whiteSpace: "pre-line" }}>{exercise.tips}</p>
        </>
      )}

      <hr />

      <h3>Your answer (text)</h3>
      <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        rows={10}
        style={{ width: "100%" }}
        placeholder="Nhập câu trả lời của bạn ở đây (coi như transcript)..."
      />
      <p>Word count: <strong>{wordCount}</strong></p>

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Đang nộp..." : "Nộp & chấm"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      {attemptId !== null && (
        <div style={{ marginTop: 20 }}>
          <hr />
          <h3>Kết quả</h3>
          <p><strong>AttemptId:</strong> {attemptId}</p>
          <p>
            <strong>Score:</strong> {score !== null ? score.toFixed(1) : "N/A"}
            {maxScore !== null ? ` / ${maxScore}` : ""}
          </p>
          <h4>Feedback</h4>
          <p style={{ whiteSpace: "pre-line" }}>{feedback ?? "Chưa có feedback."}</p>

          <div style={{ marginTop: 10 }}>
            <Link to={`/attempts/${attemptId}`}>Xem Attempt vừa nộp</Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Link to="/speaking">← Quay lại danh sách Speaking</Link>
      </div>
    </div>
  );
}

export default SpeakingPracticePage;
