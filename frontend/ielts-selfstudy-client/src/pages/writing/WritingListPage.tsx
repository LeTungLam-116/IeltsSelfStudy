import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getWritingExercises,
  type WritingExerciseDto,
} from "../../api/writingExerciseApi";

function WritingListPage() {
  const [items, setItems] = useState<WritingExerciseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWritingExercises()
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Không tải được danh sách đề Writing.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải danh sách đề Writing...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Writing Exercises</h2>
      {items.length === 0 ? (
        <p>Chưa có đề Writing nào.</p>
      ) : (
        <ul>
          {items.map((w) => (
            <li key={w.id} style={{ marginBottom: 12 }}>
              <strong>{w.title}</strong> – {w.level}{" "}
              {w.topic && <>({w.topic})</>}
              {" "}
              <Link to={`/writing/${w.id}`}>Luyện bài này</Link>
              <Link to="/writing/history">Xem lịch sử Writing</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WritingListPage;
