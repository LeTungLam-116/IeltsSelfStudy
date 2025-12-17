import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  evaluateWriting,
  getWritingExerciseById,
  type WritingExerciseDto,
} from "../../api/writingExerciseApi";

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function WritingPracticePage() {
  const { id } = useParams();
  const writingExerciseId = Number(id);

  const [exercise, setExercise] = useState<WritingExerciseDto | null>(null);

  const [essay, setEssay] = useState("");
  const wordCount = useMemo(() => countWords(essay), [essay]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Kết quả evaluate (attempt + score + feedback)
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!writingExerciseId) return;

    setIsLoading(true);
    setError(null);

    getWritingExerciseById(writingExerciseId)
      .then((data) => {
        setExercise(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Không tải được đề Writing.");
      })
      .finally(() => setIsLoading(false));
  }, [writingExerciseId]);

  const handleSubmit = async () => {
    if (!exercise) return;

    setError(null);

    // reset kết quả cũ
    setAttemptId(null);
    setScore(null);
    setMaxScore(null);
    setFeedback(null);

    if (!essay.trim()) {
      setError("Vui lòng viết bài trước khi nộp.");
      return;
    }

    if (wordCount < exercise.minWordCount) {
      setError(
        `Bài viết quá ngắn. Yêu cầu tối thiểu ${exercise.minWordCount} từ, hiện tại ${wordCount} từ.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Gọi API Evaluate (backend sẽ: lưu Attempt + (sau này) gọi AI chấm)
      const result = await evaluateWriting(writingExerciseId, {
        userId: 1, // TODO: sau này lấy từ login/JWT
        essayText: essay,
        targetBand: 4.5, // TODO: có thể lấy từ user profile
      });

      setAttemptId(result.attemptId);
      setScore(result.score ?? null);
      setMaxScore(result.maxScore ?? null);
      setFeedback(result.feedback ?? null);
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi nộp bài / chấm bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Đang tải đề Writing...</p>;
  if (error && !exercise) return <p style={{ color: "red" }}>{error}</p>;
  if (!exercise) return <p>Không tìm thấy đề Writing.</p>;

  const isTooShort = wordCount < exercise.minWordCount;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Writing Practice: {exercise.title}</h2>

      <div style={{ marginBottom: 12 }}>
        <span>
          <strong>Task:</strong> {exercise.taskType}
        </span>
        {" • "}
        <span>
          <strong>Level:</strong> {exercise.level}
        </span>
        {exercise.topic ? (
          <>
            {" • "}
            <span>
              <strong>Topic:</strong> {exercise.topic}
            </span>
          </>
        ) : null}
      </div>

      {exercise.description ? <p>{exercise.description}</p> : null}

      <hr />

      <div style={{ marginBottom: 16 }}>
        <h3>Question</h3>
        <p style={{ whiteSpace: "pre-line" }}>{exercise.question}</p>
        <p>
          <strong>Minimum words:</strong> {exercise.minWordCount}
        </p>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label htmlFor="essay">
          <strong>Your essay</strong>
        </label>
        <textarea
          id="essay"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          rows={14}
          style={{ width: "100%", marginTop: 8 }}
          placeholder="Write your essay here..."
        />
      </div>

      <p>
        Word count:{" "}
        <strong style={{ color: isTooShort ? "red" : "green" }}>
          {wordCount}
        </strong>{" "}
        / {exercise.minWordCount}
      </p>

      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Đang nộp..." : "Nộp bài & chấm"}
      </button>

      {error && (
        <p style={{ marginTop: 12, color: "red" }}>
          {error}
        </p>
      )}

      {/* Kết quả chấm (demo/AI) */}
      {attemptId !== null && (
        <div style={{ marginTop: 24 }}>
          <hr />
          <h3>Kết quả</h3>
          <p>
            <strong>AttemptId:</strong> {attemptId}
          </p>
          <p>
            <strong>Score:</strong>{" "}
            {score !== null ? score.toFixed(1) : "N/A"}{" "}
            {maxScore !== null ? `/ ${maxScore}` : ""}
          </p>
          <div>
            <strong>Feedback:</strong>
            <p style={{ whiteSpace: "pre-line" }}>
              {feedback ?? "Chưa có feedback."}
            </p>
          </div>
        </div>
      )}

      {/* Sample Answer */}
      {exercise.sampleAnswer && (
        <div style={{ marginTop: 28 }}>
          <hr />
          <h3>Sample Answer (optional)</h3>
          <p style={{ whiteSpace: "pre-line" }}>{exercise.sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}

export default WritingPracticePage;
