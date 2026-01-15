import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ExerciseCard } from '../ExerciseCard'
import type { Exercise } from '../../../types'

// Wrapper component for Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

const mockExercise: Exercise = {
  id: 1,
  type: 'Listening',
  title: 'Test Listening Exercise',
  description: 'A test exercise for listening practice',
  level: 'Intermediate',
  questionCount: 5,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  audioUrl: 'test-audio.mp3',
  durationSeconds: 180,
}

describe('ExerciseCard', () => {
  it('renders exercise information correctly', () => {
    render(
      <RouterWrapper>
        <ExerciseCard exercise={mockExercise} />
      </RouterWrapper>
    )

    expect(screen.getByText('Test Listening Exercise')).toBeInTheDocument()
    expect(screen.getByText('A test exercise for listening practice')).toBeInTheDocument()
    expect(screen.getByText('🎧')).toBeInTheDocument()
    expect(screen.getByText('Listening')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('5 questions')).toBeInTheDocument()
    expect(screen.getByText('3 min')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders different icons for different exercise types', () => {
    const readingExercise: Exercise = { ...mockExercise, type: 'Reading' }
    const writingExercise: Exercise = { ...mockExercise, type: 'Writing' }
    const speakingExercise: Exercise = { ...mockExercise, type: 'Speaking' }

    const { rerender } = render(
      <RouterWrapper>
        <ExerciseCard exercise={readingExercise} />
      </RouterWrapper>
    )
    expect(screen.getByText('📖')).toBeInTheDocument()

    rerender(
      <RouterWrapper>
        <ExerciseCard exercise={writingExercise} />
      </RouterWrapper>
    )
    expect(screen.getByText('✍️')).toBeInTheDocument()

    rerender(
      <RouterWrapper>
        <ExerciseCard exercise={speakingExercise} />
      </RouterWrapper>
    )
    expect(screen.getByText('🎤')).toBeInTheDocument()
  })

  it('shows inactive status for inactive exercises', () => {
    const inactiveExercise: Exercise = { ...mockExercise, isActive: false }
    render(
      <RouterWrapper>
        <ExerciseCard exercise={inactiveExercise} />
      </RouterWrapper>
    )

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('calls onStart when start button is clicked', () => {
    const mockOnStart = vi.fn()
    render(
      <RouterWrapper>
        <ExerciseCard exercise={mockExercise} onStart={mockOnStart} />
      </RouterWrapper>
    )

    const startButton = screen.getByText('Start Exercise')
    fireEvent.click(startButton)

    expect(mockOnStart).toHaveBeenCalledWith(1)
  })

  it('renders Link when no onStart prop is provided', () => {
    render(
      <RouterWrapper>
        <ExerciseCard exercise={mockExercise} />
      </RouterWrapper>
    )

    const link = screen.getByRole('link', { name: /start exercise/i })
    expect(link).toHaveAttribute('href', '/listening/1')
  })

  it('applies hover styles correctly', () => {
    render(
      <RouterWrapper>
        <ExerciseCard exercise={mockExercise} />
      </RouterWrapper>
    )

    const card = screen.getByText('Test Listening Exercise').closest('div')
    expect(card).toHaveClass('hover:shadow-md')
  })
})
