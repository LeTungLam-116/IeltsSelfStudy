import { useEffect, useState } from "react";
import { getListeningExercises, type ListeningExerciseDto } from "../../api/listeningExerciseApi";
import { Link } from "react-router-dom";

function ListeningListPage() {
  const [items, setItems] = useState<ListeningExerciseDto[]>([]);

  useEffect(() => {
    getListeningExercises().then(setItems).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Listening Exercises</h2>
      {items.length === 0 ? (
        <p>Chưa có bài nghe nào.</p>
      ) : (
        <ul>
          {items.map((e) => (
            <li key={e.id}>
              <strong>{e.title}</strong> – {e.level} – {e.questionCount} câu
              {" "}
              <Link to={`/listening/${e.id}`}>Làm bài</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeningListPage;
