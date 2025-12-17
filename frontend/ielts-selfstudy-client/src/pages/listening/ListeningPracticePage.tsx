import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getListeningExerciseById, // bạn sẽ tạo trong listeningExerciseApi.ts
  type ListeningExerciseDto,
} from "../../api/listeningExerciseApi";
import { createAttempt } from "../../api/attemptApi";

type AnswerState = {
  [questionId: string]: string; // ví dụ: { "q1": "A", "q2": "B" }
};

const dummyQuestions = [
  { id: "q1", text: "Question 1: What number did you hear?", options: ["A", "B", "C"], correct: "A" },
  { id: "q2", text: "Question 2: Where is the man?", options: ["Home", "Office", "School"], correct: "B" },
  { id: "q3", text: "Question 3: What time is the meeting?", options: ["9:00", "10:00", "11:00"], correct: "C" },
];

function ListeningPracticePage() {
  const { id } = useParams(); // /listening/:id
  const exerciseId = Number(id);

  const [exercise, setExercise] = useState<ListeningExerciseDto | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) return;

    getListeningExerciseById(exerciseId)
      .then(setExercise)
      .catch((err) => {
        console.error(err);
        setMessage("Không tải được bài nghe.");
      });
  }, [exerciseId]);

  const handleChangeAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!exerciseId) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Tính điểm đơn giản trên frontend
      const total = dummyQuestions.length;
      let correctCount = 0;

      dummyQuestions.forEach((q) => {
        if (answers[q.id] && answers[q.id] === q.correct) {
          correctCount++;
        }
      });

      const score = (correctCount / total) * 9; // scale thang 9.0 (ví dụ)
      const maxScore = 9.0;

      // 2. Chuẩn bị payload cho /attempts
      const payload = {
        userId: 1, // TODO: sau này lấy từ user login
        skill: "Listening",
        exerciseId: exerciseId,
        score,
        maxScore,
        userAnswerJson: JSON.stringify(answers),
        // aiFeedback: null, // sau này gọi API AI xong rồi gán text feedback vào đây
      };

      const result = await createAttempt(payload);

      setMessage(
        `Đã lưu kết quả! Điểm của bạn: ${score.toFixed(
          1
        )}/${maxScore}. Attempt Id: ${result.id}`
      );
    } catch (err) {
      console.error(err);
      setMessage("Có lỗi khi lưu kết quả. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exercise) {
    return <p>Đang tải bài nghe...</p>;
  }

  return (
    <div>
      <h2>Listening Practice: {exercise.title}</h2>
      <p>Level: {exercise.level}</p>
      <p>{exercise.description}</p>

      {/* Audio */}
      <audio controls src={exercise.audioUrl} style={{ margin: "16px 0" }}>
        Your browser does not support the audio element.
      </audio>

      {/* Dummy questions */}
      <div>
        {dummyQuestions.map((q) => (
          <div key={q.id} style={{ marginBottom: 16 }}>
            <p>
              <strong>{q.text}</strong>
            </p>
            {q.options.map((op) => (
              <label key={op} style={{ marginRight: 12 }}>
                <input
                  type="radio"
                  name={q.id}
                  value={op}
                  checked={answers[q.id] === op}
                  onChange={() => handleChangeAnswer(q.id, op)}
                />
                {" "}{op}
              </label>
            ))}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Đang nộp..." : "Nộp bài"}
      </button>

      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}

export default ListeningPracticePage;
