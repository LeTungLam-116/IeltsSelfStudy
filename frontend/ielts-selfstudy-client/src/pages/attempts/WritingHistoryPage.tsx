import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type AttemptDto, getAttemptsByUser } from "../../api/attemptApi";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

type PageState = {
  items: AttemptDto[];
  loading: boolean;
  error: string | null;
};

function WritingHistoryPage() {
  // TODO: sau này lấy userId từ auth/token
  const userId = 1;

  const [state, setState] = useState<PageState>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // ✅ tránh setState đồng bộ trong effect (dev overlay warn)
    Promise.resolve().then(() => {
      if (cancelled) return;
      setState((s) => ({ ...s, loading: true, error: null }));
    });

    (async () => {
      try {
        const data = await getAttemptsByUser(userId);
        if (cancelled) return;
        setState({ items: data, loading: false, error: null });
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setState({ items: [], loading: false, error: "Không tải được lịch sử làm bài." });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const writingAttempts = useMemo(() => {
    return state.items
      .filter((x) => x.skill?.toLowerCase() === "writing")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.items]);

  if (state.loading) return <p>Đang tải lịch sử Writing...</p>;
  if (state.error) return <p style={{ color: "red" }}>{state.error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Writing History</h2>

      {writingAttempts.length === 0 ? (
        <p>Bạn chưa nộp bài Writing nào.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>
                Time
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>
                ExerciseId
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>
                Score
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {writingAttempts.map((a) => (
              <tr key={a.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {formatDate(a.createdAt)}
                </td>
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
        <Link to="/writing">← Quay lại danh sách đề Writing</Link>
      </div>
    </div>
  );
}

export default WritingHistoryPage;
