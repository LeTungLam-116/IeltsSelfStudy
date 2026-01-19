import React, { useState, useEffect } from 'react';
import { ExerciseCard } from '../exercises';
import { Button } from '../ui';
// demo does not require strict Exercise type here

// Demo data for featured exercises
const featuredExercises: any[] = [
  {
    id: 1,
    title: 'Academic Writing Task 1: Process Diagrams',
    description: 'Master the art of describing processes with clear, concise language and accurate terminology.',
    type: 'Writing',
    skill: 'Writing',
    level: 'Intermediate',
    durationSeconds: 1800, // 30 minutes
    questionCount: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Listening Section 1: Everyday Conversations',
    description: 'Practice understanding common everyday conversations in various contexts.',
    type: 'Listening',
    skill: 'Listening',
    level: 'Beginner',
    durationSeconds: 900, // 15 minutes
    questionCount: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Reading Passage: Climate Change',
    description: 'Analyze a complex academic text about environmental issues and answer comprehension questions.',
    type: 'Reading',
    skill: 'Reading',
    level: 'Advanced',
    durationSeconds: 2400, // 40 minutes
    questionCount: 13,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Speaking Part 2: Describe a Place',
    description: 'Practice speaking fluently about a memorable place for 1-2 minutes.',
    type: 'Speaking',
    skill: 'Speaking',
    level: 'Intermediate',
    durationSeconds: 120, // 2 minutes
    questionCount: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Academic Writing Task 2: Opinion Essay',
    description: 'Develop and support your argument with relevant examples and clear structure.',
    type: 'Writing',
    skill: 'Writing',
    level: 'Advanced',
    durationSeconds: 2400, // 40 minutes
    questionCount: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const FeaturedCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === featuredExercises.length - 3 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredExercises.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredExercises.length - 3 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // visibleExercises intentionally unused in this simplified carousel

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bài Tập Nổi Bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bắt đầu với những bài tập phổ biến nhất, được chọn lọc kỹ lưỡng để giúp bạn
            xây dựng sự tự tin và cải thiện kỹ năng của mình.
          </p>
        </div>

        <div className="relative">
          {/* Carousel container */}
          <div
            className="overflow-hidden focus:outline-none"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Featured exercises carousel"
          >
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
              aria-live="polite"
              aria-atomic="true"
            >
              {featuredExercises.map((exercise) => (
                <div key={exercise.id} className="w-full md:w-1/3 flex-shrink-0">
                  <ExerciseCard
                    exercise={exercise}
                    showStartButton={true}
                    onStart={() => {
                      // This will be handled by the auth guard in StartButtonWrapper
                      console.log('Starting exercise:', exercise.id);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors z-10"
            aria-label="Previous exercises"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors z-10"
            aria-label="Next exercises"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 gap-2" role="tablist" aria-label="Carousel navigation">
            {Array.from({ length: featuredExercises.length - 2 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  index === currentIndex ? 'bg-teal-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1} of ${featuredExercises.length - 2}`}
              />
            ))}
          </div>

          {/* Pause/Play button */}
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isAutoPlaying ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Play
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
