import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExerciseStore } from "../../stores";
import { ExerciseList } from "../../components/exercises";

function ListeningListPage() {
  const navigate = useNavigate();
  const {
    exercises,
    isLoading,
    error,
    fetchExercises,
    startExercise
  } = useExerciseStore();

  useEffect(() => {
    fetchExercises('Listening');
  }, [fetchExercises]);

  const handleExerciseStart = (exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
      startExercise(exercise);
      navigate(`/listening/${exerciseId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Listening Practice</h1>
        <p className="mt-2 text-gray-600">
          Improve your listening skills with our collection of IELTS listening exercises.
          Practice with different difficulty levels and topics.
        </p>
      </div>

      <ExerciseList
        exercises={exercises}
        isLoading={isLoading}
        error={error}
        onExerciseStart={handleExerciseStart}
        emptyMessage="No listening exercises available at the moment. Please check back later."
      />
    </div>
  );
}

export default ListeningListPage;
