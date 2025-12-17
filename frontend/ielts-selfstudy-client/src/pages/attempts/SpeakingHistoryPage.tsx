import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type AttemptDto, getAttemptsByUser } from "../../api/attemptApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function SpeakingHistoryPage() {
  const userId = 1;

  const [items, setItems] = useState<AttemptDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttemptsByUser(userId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const speakingAttempts = useMemo(() => {
    return items
      .filter((x) => x.skill?.toLowerCase() === "speaking")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items]);

  if (loading) return <p>Đang tải lịch sử Speaking...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Speaking History</h2>

      {speakingAttempts.length === 0 ? (
        <p>Bạn chưa nộp bài Speaking nào.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Time</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>ExerciseId</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Score</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {speakingAttempts.map((a) => (
              <tr key={a.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{formatDate(a.createdAt)}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{a.exerciseId}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {a.score != null ? a.score.toFixed(1) : "N/A"}
                  {a.maxScore != null ? ` / ${a.maxScore}` : ""}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  <Link to={`/attempts/${a.id}`}>Xem chi tiết</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16 }}>
        <Link to="/speaking">← Quay lại Speaking</Link>
      </div>
    </div>
  );
}

export default SpeakingHistoryPage;
