import { useState, useEffect } from 'react';
import {
  getQuestionsByExercise,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionDto,
  type CreateQuestionRequest,
  type UpdateQuestionRequest
} from '../../api/questionsApi';
import QuestionForm from './QuestionForm';

interface QuestionsListProps {
  exerciseId: number;
  skill: string;
}

export default function QuestionsList({ exerciseId, skill }: QuestionsListProps) {
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [exerciseId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestionsByExercise(exerciseId);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEdit = (question: QuestionDto) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (question: QuestionDto) => {
    if (!confirm(`Are you sure you want to delete question #${question.questionNumber}?`)) {
      return;
    }

    try {
      await deleteQuestion(question.id);
      await loadQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingQuestion) {
        // Update
        await updateQuestion(editingQuestion.id, data as UpdateQuestionRequest);
      } else {
        // Create
        await createQuestion(data as CreateQuestionRequest);
      }

      setShowForm(false);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question');
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'multiplechoice': return 'Multiple Choice';
      case 'truefalse': return 'True/False';
      case 'shortanswer': return 'Short Answer';
      case 'essay': return 'Essay';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage questions for this {skill} exercise
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
          >
            Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="divide-y divide-gray-200">
        {questions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">
              Add questions to complete this exercise.
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Add First Question
            </button>
          </div>
        ) : (
          questions
            .sort((a, b) => a.questionNumber - b.questionNumber)
            .map((question) => (
              <div key={question.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{question.questionNumber}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getQuestionTypeLabel(question.questionType)}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {question.questionText.length > 100
                        ? `${question.questionText.substring(0, 100)}...`
                        : question.questionText
                      }
                    </h3>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Points: {question.points}</span>
                      {question.correctAnswer && (
                        <span>Answer: {question.correctAnswer.length > 50
                          ? `${question.correctAnswer.substring(0, 50)}...`
                          : question.correctAnswer
                        }</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Question Form Modal */}
      {showForm && (
        <QuestionForm
          question={editingQuestion}
          exerciseId={exerciseId}
          skill={skill}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}
