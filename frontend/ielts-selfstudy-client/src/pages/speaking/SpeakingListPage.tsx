import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSpeakingExercises, type SpeakingExerciseDto } from "../../api/speakingExerciseApi";

function SpeakingListPage() {
  const [items, setItems] = useState<SpeakingExerciseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpeakingExercises()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải Speaking...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Speaking Exercises</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/speaking/history">Xem lịch sử Speaking</Link>
      </div>

      {items.length === 0 ? (
        <p>Chưa có bài Speaking.</p>
      ) : (
        <ul>
          {items.map((s) => (
            <li key={s.id} style={{ marginBottom: 10 }}>
              <strong>{s.title}</strong> — {s.part} — {s.level}{" "}
              <Link to={`/speaking/${s.id}`}>Luyện</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SpeakingListPage;
