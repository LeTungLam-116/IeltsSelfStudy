import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExerciseStore, useAuthStore } from "../../stores";
import { ExercisePlayer } from "../../components/exercises";
import { Card, Button } from "../../components/ui";

function ListeningPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exerciseId = Number(id);

  const { user } = useAuthStore();
  const {
    currentExercise,
    currentQuestions,
    answers,
    timeRemaining,
    isLoading,
    error,
    fetchExerciseById,
    updateAnswer,
    submitExercise,
    setTimeRemaining
  } = useExerciseStore();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (exerciseId) {
      fetchExerciseById('Listening', exerciseId);
    }
  }, [exerciseId, fetchExerciseById]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted, setTimeRemaining]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    updateAnswer(questionId, answer);
  };

  const handleSubmit = async () => {
    if (!currentExercise || !user) return;

    setIsSubmitted(true);
    setSubmitMessage(null);

    try {
      await submitExercise(currentExercise.id, answers);
      setSubmitMessage("Exercise submitted successfully! Your results have been saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit exercise";
      setSubmitMessage(message);
      setIsSubmitted(false);
    }
  };

  const handleTimeUp = () => {
    if (!isSubmitted) {
      handleSubmit();
    }
  };

  const handleBackToList = () => {
    navigate('/listening');
  };

  // Show loading state
  if (isLoading && !currentExercise) {
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

  // Show error state
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

  // Show exercise player
  if (currentExercise && currentQuestions.length > 0) {
    return (
      <div className="space-y-6">
        {/* Audio Player Section */}
        {currentExercise.audioUrl && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <audio
                  controls
                  className="w-full"
                  src={currentExercise.audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
                {currentExercise.transcript && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Toggle transcript visibility - could be enhanced with state
                        const transcriptEl = document.getElementById('transcript');
                        if (transcriptEl) {
                          transcriptEl.classList.toggle('hidden');
                        }
                      }}
                    >
                      Show/Hide Transcript
                    </Button>
                    <div id="transcript" className="mt-2 p-3 bg-white rounded border text-sm text-gray-700 hidden">
                      {currentExercise.transcript}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Exercise Player */}
        <ExercisePlayer
          exercise={currentExercise}
          questions={currentQuestions}
          answers={answers}
          timeRemaining={timeRemaining}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
          onTimeUp={handleTimeUp}
        />

        {/* Submit Message */}
        {submitMessage && (
          <Card>
            <div className="p-6">
              <div className={`p-4 rounded-md ${submitMessage.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-medium">{submitMessage}</p>
                <div className="mt-3">
                  <Button onClick={handleBackToList}>
                    Back to Exercise List
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Fallback
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

export default ListeningPracticePage;
