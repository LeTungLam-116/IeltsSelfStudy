import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExerciseStore } from "../../stores";
import { Card, Button } from "../../components/ui";

function ReadingPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exerciseId = Number(id);

  const {
    fetchExerciseById,
    error,
  } = useExerciseStore();

  const [currentExercise, setCurrentExercise] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!exerciseId) return;
      setLoading(true);
      try {
        const ex = await fetchExerciseById(exerciseId);
        setCurrentExercise(ex);
      } catch (err) {
        console.error('Failed to load exercise', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [exerciseId, fetchExerciseById]);

  const handleBackToList = () => {
    navigate('/reading');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exercise...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !currentExercise) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Exercise</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleBackToList}>
              Back to Exercises
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-600">Exercise not found.</p>
            <div className="mt-4">
              <Button onClick={handleBackToList}>
                Back to Exercises
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentExercise.passageText && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Passage</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
                {currentExercise.passageText}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Button onClick={handleBackToList}>Back to exercises</Button>
      </div>
    </div>
  );
}

export default ReadingPracticePage;