import type { Attempt } from '../types';

const STORAGE_KEY = 'mockAttempts_v1';

function seedIfEmpty() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const now = new Date().toISOString();
    const seed: Attempt[] = [
      {
        id: 1,
        userId: 101,
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        skill: 'Writing',
        exerciseId: 1,
        exerciseTitle: 'Sample Writing Task 1',
        courseId: 1,
        courseTitle: 'IELTS Writing Course',
        score: undefined,
        maxScore: undefined,
        userAnswerJson: JSON.stringify({ content: 'This is a sample submitted essay ...' }),
        aiFeedback: undefined,
        isGraded: false,
        isPassed: false,
        isActive: true,
        createdAt: now,
        startedAt: now,
        completedAt: undefined,
        timeSpentSeconds: 1800,
      },
      {
        id: 2,
        userId: 102,
        userName: 'Jane Smith',
        userEmail: 'jane.smith@example.com',
        skill: 'Writing',
        exerciseId: 2,
        exerciseTitle: 'Sample Writing Task 2',
        courseId: 1,
        courseTitle: 'IELTS Writing Course',
        score: 7.0,
        maxScore: 9.0,
        userAnswerJson: JSON.stringify({ content: 'Another sample essay ...' }),
        aiFeedback: JSON.stringify({
          overallBand: 7,
          criteria: [
            { name: 'Task Response', score: 7, comment: 'Good response' },
            { name: 'Coherence', score: 7, comment: 'Well structured' },
          ],
          strengths: ['Clear organization', 'Good vocabulary'],
          weaknesses: ['Minor grammar errors'],
          suggestions: ['Work on sentence variety'],
        }),
        isGraded: true,
        isPassed: true,
        isActive: true,
        createdAt: now,
        startedAt: now,
        completedAt: new Date(Date.now() + 2400000).toISOString(),
        timeSpentSeconds: 2400,
      },
      {
        id: 3,
        userId: 103,
        userName: 'Bob Johnson',
        userEmail: 'bob.johnson@example.com',
        skill: 'Reading',
        exerciseId: 3,
        exerciseTitle: 'Sample Reading Exercise',
        courseId: 3,
        courseTitle: 'IELTS Reading Course',
        score: undefined,
        maxScore: undefined,
        userAnswerJson: undefined,
        aiFeedback: undefined,
        isGraded: false,
        isPassed: false,
        isActive: true,
        createdAt: now,
        startedAt: now,
        completedAt: undefined,
        timeSpentSeconds: undefined,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
}

export async function getAllAttempts(): Promise<Attempt[]> {
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  return JSON.parse(raw) as Attempt[];
}

export async function getAttemptById(id: number): Promise<Attempt | undefined> {
  const list = await getAllAttempts();
  return list.find((a) => a.id === id);
}

export async function updateAttemptFeedback(id: number, feedback: string, score?: number, maxScore?: number): Promise<Attempt | undefined> {
  const list = await getAllAttempts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const updated: Attempt = {
    ...list[idx],
    aiFeedback: feedback,
    score: score ?? list[idx].score,
    maxScore: maxScore ?? list[idx].maxScore,
  };
  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

export async function deleteAttempt(id: number): Promise<void> {
  const list = await getAllAttempts();
  const filtered = list.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}


