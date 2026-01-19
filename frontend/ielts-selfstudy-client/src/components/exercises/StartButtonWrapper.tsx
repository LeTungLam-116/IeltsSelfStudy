import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';

interface StartButtonWrapperProps {
  children: React.ReactNode;
  exercise: any;
}

export default function StartButtonWrapper({ children, exercise }: StartButtonWrapperProps) {
  const { ensureAuth } = useAuthGuard();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const path = `/${exercise.type.toLowerCase()}/${exercise.id}`;

    ensureAuth({
      type: 'page',
      path,
      payload: { exerciseId: exercise.id, exerciseType: exercise.type }
    });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}


