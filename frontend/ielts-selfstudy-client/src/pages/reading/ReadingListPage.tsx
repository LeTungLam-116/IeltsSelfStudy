import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExerciseStore } from "../../stores";
import { ExerciseList } from "../../components/exercises";

function ReadingListPage() {
  const navigate = useNavigate();
  const {
    exercises,
    isLoading,
    error,
    fetchExercises
  } = useExerciseStore();

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleStartExercise = (exerciseId: number) => {
    navigate(`/reading/${exerciseId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reading Exercises</h1>
      <ExerciseList
        exercises={exercises}
        isLoading={isLoading}
        error={error}
        onExerciseStart={handleStartExercise}
      />
    </div>
  );
}

export default ReadingListPage;