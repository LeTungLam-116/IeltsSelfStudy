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
        exerciseId: 1,
        score: null,
        maxScore: null,
        userAnswerJson: JSON.stringify({ content: 'This is a sample submitted essay ...' }),
        aiFeedback: null,
        isActive: true,
        createdAt: now,
      },
      {
        id: 2,
        userId: 102,
        exerciseId: 2,
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
        isActive: true,
        createdAt: now,
      },
      {
        id: 3,
        userId: 103,
        exerciseId: 3,
        score: null,
        maxScore: null,
        userAnswerJson: null,
        aiFeedback: null,
        isActive: true,
        createdAt: now,
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


