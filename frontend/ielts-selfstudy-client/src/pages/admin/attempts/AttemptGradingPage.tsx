import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttemptById } from '../../../api/attemptsApi';
import { Loading } from '../../../components/ui';
import AttemptDetailsPage from './AttemptDetailsPage';
import GradeModal from './components/GradeModal';
import type { AttemptDto } from '../../../types/attempts';

const AttemptGradingPage = memo(function AttemptGradingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AttemptDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getAttemptById(parseInt(id));
        setAttempt(data);
      } catch (err) {
        console.error('Failed to fetch attempt:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempt();
  }, [id]);

  const handleGraded = (updatedAttempt: AttemptDto) => {
    setAttempt(updatedAttempt);
    setShowGradeModal(false);
    // Optionally navigate back or show success message
    navigate(`/admin/attempts/${updatedAttempt.id}`, { replace: true });
  };

  const handleCloseModal = () => {
    setShowGradeModal(false);
    if (attempt) {
      navigate(`/admin/attempts/${attempt.id}`, { replace: true });
    } else {
      navigate('/admin/attempts');
    }
  };

  if (isLoading) {
    return <Loading text="Loading attempt for grading..." />;
  }

  return (
    <>
      <AttemptDetailsPage />
      <GradeModal
        attempt={attempt}
        isOpen={showGradeModal}
        onClose={handleCloseModal}
        onGraded={handleGraded}
      />
    </>
  );
});

AttemptGradingPage.displayName = 'AttemptGradingPage';

export default AttemptGradingPage;
