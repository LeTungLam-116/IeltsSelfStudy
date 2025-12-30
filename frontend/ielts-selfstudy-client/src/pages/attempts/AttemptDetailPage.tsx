import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAttemptById } from "../../api/attemptApi";
import type { AttemptDto } from "../../api/attemptApi";

function safeParseJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type WritingAnswerJson = {
  essayText?: string;
  wordCount?: number;
  question?: string;
  topic?: string;
  taskType?: string;
  // bạn có thể bổ sung thêm field nếu payload của bạn có
};

type SpeakingAnswerJson = {
  answerText?: string;
  wordCount?: number;
  question?: string;
  part?: string;
  topic?: string;
  level?: string;
  // bạn có thể bổ sung thêm field nếu payload của bạn có
};

type FeedbackJson = {
  skill?: "Writing" | "Speaking" | string;
  overallBand?: number;
  criteria?: Record<string, number>;
  strengths?: string[];
  improvements?: string[];
  betterVersion?: string;
  betterAnswer?: string;
  mistakes?: { from: string; to: string; reason?: string }[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

type PageState = {
  attempt: AttemptDto | null;
  loading: boolean;
  error: string | null;
};

function AttemptDetailPage() {
  const { id } = useParams();

  const attemptId = Number(id);
  const isValidAttemptId = Number.isFinite(attemptId) && attemptId > 0;

  const [state, setState] = useState<PageState>(() => ({
    attempt: null,
    loading: isValidAttemptId,
    error: isValidAttemptId ? null : "AttemptId không hợp lệ.",
  }));

  useEffect(() => {
    if (!isValidAttemptId) return;

    let cancelled = false;

    // Tránh setState đồng bộ ngay trong effect (đôi khi dev overlay cảnh báo)
    Promise.resolve().then(() => {
      if (cancelled) return;
      setState((s) => ({ ...s, loading: true, error: null }));
    });

    (async () => {
      try {
        const data = await getAttemptById(attemptId);
        if (cancelled) return;
        setState({ attempt: data, loading: false, error: null });
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setState({
          attempt: null,
          loading: false,
          error: "Không tải được chi tiết attempt.",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId, isValidAttemptId]);

  const attempt = state.attempt;
  const skillLower = (attempt?.skill ?? "").toLowerCase();

  const writingAnswer = useMemo(() => {
    return safeParseJson<WritingAnswerJson>(attempt?.userAnswerJson);
  }, [attempt?.userAnswerJson]);

  const speakingAnswer = useMemo(() => {
    return safeParseJson<SpeakingAnswerJson>(attempt?.userAnswerJson);
  }, [attempt?.userAnswerJson]);

  // ✅ Parse aiFeedback JSON (nếu attempt mới lưu JSON)
  const feedbackJson = useMemo(() => {
    return safeParseJson<FeedbackJson>(attempt?.aiFeedback);
  }, [attempt?.aiFeedback]);

  if (state.loading) return <p>Đang tải attempt...</p>;
  if (state.error) return <p style={{ color: "red" }}>{state.error}</p>;
  if (!attempt) return <p>Không tìm thấy attempt.</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Attempt Detail</h2>

      <div style={{ marginBottom: 12 }}>
        <p>
          <strong>AttemptId:</strong> {attempt.id}
        </p>
        <p>
          <strong>UserId:</strong> {attempt.userId}
        </p>
        <p>
          <strong>Skill:</strong> {attempt.skill}
        </p>
        <p>
          <strong>ExerciseId:</strong> {attempt.exerciseId}
        </p>
        <p>
          <strong>CreatedAt:</strong> {formatDate(attempt.createdAt)}
        </p>

        <p>
          <strong>Score:</strong>{" "}
          {attempt.score != null ? attempt.score.toFixed(1) : "N/A"}
          {attempt.maxScore != null ? ` / ${attempt.maxScore}` : ""}
        </p>
      </div>

      <hr />

      {/* ===== Writing content ===== */}
      {skillLower === "writing" && (
        <div style={{ marginTop: 16 }}>
          <h3>Your Writing</h3>

          {writingAnswer?.taskType && (
            <p>
              <strong>Task type:</strong> {writingAnswer.taskType}
            </p>
          )}

          {writingAnswer?.topic && (
            <p>
              <strong>Topic:</strong> {writingAnswer.topic}
            </p>
          )}

          {writingAnswer?.wordCount != null && (
            <p>
              <strong>Word count:</strong> {writingAnswer.wordCount}
            </p>
          )}

          {writingAnswer?.question && (
            <>
              <h4>Question</h4>
              <p style={{ whiteSpace: "pre-line" }}>{writingAnswer.question}</p>
            </>
          )}

          <h4>Essay</h4>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              whiteSpace: "pre-line",
              minHeight: 120,
            }}
          >
            {writingAnswer?.essayText ??
              "(Không đọc được essayText từ userAnswerJson)"}
          </div>
        </div>
      )}

      {/* ===== Speaking content ===== */}
      {skillLower === "speaking" && (
        <div style={{ marginTop: 16 }}>
          <h3>Your Speaking (text)</h3>

          {speakingAnswer?.part && (
            <p>
              <strong>Part:</strong> {speakingAnswer.part}
            </p>
          )}

          {speakingAnswer?.topic && (
            <p>
              <strong>Topic:</strong> {speakingAnswer.topic}
            </p>
          )}

          {speakingAnswer?.level && (
            <p>
              <strong>Level:</strong> {speakingAnswer.level}
            </p>
          )}

          {speakingAnswer?.wordCount != null && (
            <p>
              <strong>Word count:</strong> {speakingAnswer.wordCount}
            </p>
          )}

          {speakingAnswer?.question && (
            <>
              <h4>Question</h4>
              <p style={{ whiteSpace: "pre-line" }}>{speakingAnswer.question}</p>
            </>
          )}

          <h4>Answer</h4>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              whiteSpace: "pre-line",
              minHeight: 120,
            }}
          >
            {speakingAnswer?.answerText ??
              "(Không đọc được answerText từ userAnswerJson)"}
          </div>
        </div>
      )}

      {/* ===== Listening/Reading (nếu bạn muốn hiển thị raw answers) ===== */}
      {(skillLower === "listening" || skillLower === "reading") && (
        <div style={{ marginTop: 16 }}>
          <h3>Your Answers (raw JSON)</h3>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              whiteSpace: "pre-wrap",
              minHeight: 80,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
            }}
          >
            {attempt.userAnswerJson ?? "Chưa có userAnswerJson."}
          </div>
        </div>
      )}

      {/* ===== Feedback (JSON render + fallback text) ===== */}
      <div style={{ marginTop: 24 }}>
        <hr />
        <h3>Feedback</h3>

        {feedbackJson && (feedbackJson.overallBand != null || feedbackJson.criteria) ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <p>
              <strong>Skill:</strong> {feedbackJson.skill ?? attempt.skill}
            </p>
            <p>
              <strong>Overall band:</strong>{" "}
              {feedbackJson.overallBand != null ? feedbackJson.overallBand : "N/A"}
            </p>

            {feedbackJson.criteria && (
              <>
                <h4>Criteria</h4>
                <ul>
                  {Object.entries(feedbackJson.criteria).map(([k, v]) => (
                    <li key={k}>
                      <strong>{k}:</strong> {v}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {feedbackJson.strengths?.length ? (
              <>
                <h4>Strengths</h4>
                <ul>
                  {feedbackJson.strengths.map((x, idx) => (
                    <li key={idx}>{x}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {feedbackJson.improvements?.length ? (
              <>
                <h4>Improvements</h4>
                <ul>
                  {feedbackJson.improvements.map((x, idx) => (
                    <li key={idx}>{x}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {(feedbackJson.betterVersion || feedbackJson.betterAnswer) && (
              <>
                <h4>Better version / answer</h4>
                <div style={{ whiteSpace: "pre-line", border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
                  {feedbackJson.betterVersion ?? feedbackJson.betterAnswer}
                </div>
              </>
            )}

            {feedbackJson.mistakes?.length ? (
              <>
                <h4>Mistakes</h4>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>From</th>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>To</th>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackJson.mistakes.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{m.from}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{m.to}</td>
                        <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>{m.reason ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : null}
          </div>
        ) : (
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, whiteSpace: "pre-line" }}>
            {attempt.aiFeedback ?? "Chưa có feedback."}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        {skillLower === "writing" ? (
          <Link to="/writing/history">← Back to Writing History</Link>
        ) : skillLower === "speaking" ? (
          <Link to="/speaking/history">← Back to Speaking History</Link>
        ) : (
          <Link to="/">← Back</Link>
        )}
      </div>
    </div>
  );
}

export default AttemptDetailPage;
