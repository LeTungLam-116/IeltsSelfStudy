import type { Exercise, ExerciseFormData, ExerciseType } from '../types';
import { getListeningExercises, getListeningExerciseById } from '../api/listeningExerciseApi';
import { getWritingExercises, getWritingExerciseById } from '../api/writingExerciseApi';
import { getSpeakingExercises, getSpeakingExerciseById } from '../api/speakingExerciseApi';

const STORAGE_KEY = 'mockExercises_v1';

// API adapter functions - try real API first, fallback to localStorage
async function fetchExercisesFromAPI(type?: ExerciseType): Promise<Exercise[]> {
  try {
    let exercises: any[] = [];

    if (type === 'Listening') {
      exercises = await getListeningExercises();
    } else if (type === 'Writing') {
      exercises = await getWritingExercises();
    } else if (type === 'Speaking') {
      exercises = await getSpeakingExercises();
    } else if (type === 'Reading') {
      // Reading exercises not implemented yet - fallback to localStorage
      return fetchExercisesFromLocalStorage(type);
    } else {
      // No type specified - fetch all types from APIs
      const [listening, writing, speaking] = await Promise.allSettled([
        getListeningExercises(),
        getWritingExercises(),
        getSpeakingExercises(),
      ]);

      if (listening.status === 'fulfilled') exercises.push(...listening.value);
      if (writing.status === 'fulfilled') exercises.push(...writing.value);
      if (speaking.status === 'fulfilled') exercises.push(...speaking.value);
    }

    // Convert API DTOs to Exercise format
    return exercises.map(dto => convertDtoToExercise(dto, type));
  } catch (error) {
    console.warn('API call failed, falling back to localStorage:', error);
    return fetchExercisesFromLocalStorage(type);
  }
}

async function fetchExerciseByIdFromAPI(type: ExerciseType, id: number): Promise<Exercise | undefined> {
  try {
    let dto: any;

    if (type === 'Listening') {
      dto = await getListeningExerciseById(id);
    } else if (type === 'Writing') {
      dto = await getWritingExerciseById(id);
    } else if (type === 'Speaking') {
      dto = await getSpeakingExerciseById(id);
    } else {
      // Reading or unknown type - fallback to localStorage
      return fetchExerciseByIdFromLocalStorage(id);
    }

    return convertDtoToExercise(dto, type);
  } catch (error) {
    console.warn('API call failed, falling back to localStorage:', error);
    return fetchExerciseByIdFromLocalStorage(id);
  }
}

function convertDtoToExercise(dto: any, type?: ExerciseType): Exercise {
  // Determine exercise type based on DTO structure or passed type
  let exerciseType: ExerciseType = type || 'Listening';
  if (dto.audioUrl) exerciseType = 'Listening';
  else if (dto.taskType) exerciseType = 'Writing';
  else if (dto.part) exerciseType = 'Speaking';
  else if (dto.passageText) exerciseType = 'Reading';

  // Common fields
  const exercise: Exercise = {
    id: dto.id,
    type: exerciseType,
    title: dto.title,
    description: dto.description || null,
    level: dto.level,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    questionCount: dto.questionCount || 1,
  };

  // Type-specific fields
  if (type === 'Listening' || dto.audioUrl) {
    exercise.type = 'Listening';
    exercise.audioUrl = dto.audioUrl;
    exercise.transcript = dto.transcript;
    exercise.durationSeconds = dto.durationSeconds;
  } else if (type === 'Writing' || dto.taskType) {
    exercise.type = 'Writing';
    exercise.taskType = dto.taskType;
    exercise.question = dto.question;
    exercise.topic = dto.topic;
    exercise.minWordCount = dto.minWordCount;
    exercise.sampleAnswer = dto.sampleAnswer;
  } else if (type === 'Speaking' || dto.part) {
    exercise.type = 'Speaking';
    exercise.part = dto.part;
    exercise.question = dto.question;
    exercise.topic = dto.topic;
    exercise.tips = dto.tips;
  } else if (type === 'Reading') {
    exercise.type = 'Reading';
    exercise.passageText = dto.passageText;
  }

  return exercise;
}

// LocalStorage fallback functions (existing logic)
function fetchExercisesFromLocalStorage(type?: ExerciseType): Exercise[] {
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  const exercises: Exercise[] = JSON.parse(raw);

  if (type) {
    return exercises.filter(e => e.type === type);
  }
  return exercises;
}

function fetchExerciseByIdFromLocalStorage(id: number): Exercise | undefined {
  const exercises = fetchExercisesFromLocalStorage();
  return exercises.find(e => e.id === id);
}

function seedIfEmpty() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const now = new Date().toISOString();
    const seed: Exercise[] = [
      {
        id: 1,
        type: 'Writing',
        title: 'Opinion Essay - Environmental Issues',
        description: 'Write an essay about environmental problems.',
        level: 'Intermediate',
        questionCount: 1,
        isActive: true,
        createdAt: now,
        taskType: 'Opinion Essay',
        topic: 'Environmental Issues',
        minWordCount: 250,
      },
      {
        id: 2,
        type: 'Reading',
        title: 'Academic Reading Passage 1',
        description: 'Answer questions on the passage.',
        level: 'Intermediate',
        questionCount: 5,
        isActive: true,
        createdAt: now,
        passageText: 'Sample reading passage text...',
      },
      {
        id: 3,
        type: 'Listening',
        title: 'Listening - Short Conversations',
        description: 'Listen and answer multiple choice.',
        level: 'Beginner',
        questionCount: 3,
        isActive: false,
        createdAt: now,
        audioUrl: 'sample-audio-url.mp3',
        transcript: 'Sample transcript...',
        durationSeconds: 180,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
}

export async function getAllExercises(type?: ExerciseType): Promise<Exercise[]> {
  return fetchExercisesFromAPI(type);
}

export async function getExerciseById(type: ExerciseType, id: number): Promise<Exercise | undefined> {
  return fetchExerciseByIdFromAPI(type, id);
}

export async function createExercise(payload: ExerciseFormData): Promise<Exercise> {
  // For now, since we don't have CREATE endpoints implemented in the backend,
  // we'll always fall back to localStorage. In a real implementation, we'd try
  // the API first and fall back to localStorage on failure.
  const list = await fetchExercisesFromLocalStorage();
  const id = list.length ? Math.max(...list.map((e) => e.id)) + 1 : 1;
  const item: Exercise = {
    id,
    type: payload.type,
    title: payload.title,
    description: payload.description || null,
    level: payload.level || 'Beginner',
    questionCount: payload.questionCount,
    isActive: payload.isActive,
    createdAt: new Date().toISOString(),
    // Add type-specific fields
    ...(payload.audioUrl && { audioUrl: payload.audioUrl }),
    ...(payload.transcript && { transcript: payload.transcript }),
    ...(payload.durationSeconds && { durationSeconds: payload.durationSeconds }),
    ...(payload.passageText && { passageText: payload.passageText }),
    ...(payload.taskType && { taskType: payload.taskType }),
    ...(payload.topic && { topic: payload.topic }),
    ...(payload.minWordCount && { minWordCount: payload.minWordCount }),
    ...(payload.sampleAnswer && { sampleAnswer: payload.sampleAnswer }),
    ...(payload.part && { part: payload.part }),
    ...(payload.question && { question: payload.question }),
    ...(payload.tips && { tips: payload.tips }),
  };
  list.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return item;
}

export async function updateExercise(id: number, payload: ExerciseFormData): Promise<Exercise | undefined> {
  const list = await getAllExercises();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;

  const updated: Exercise = {
    ...list[idx],
    type: payload.type,
    title: payload.title,
    description: payload.description || null,
    level: payload.level || 'Beginner',
    questionCount: payload.questionCount,
    isActive: payload.isActive,
    // Update type-specific fields
    ...(payload.audioUrl !== undefined && { audioUrl: payload.audioUrl }),
    ...(payload.transcript !== undefined && { transcript: payload.transcript }),
    ...(payload.durationSeconds !== undefined && { durationSeconds: payload.durationSeconds }),
    ...(payload.passageText !== undefined && { passageText: payload.passageText }),
    ...(payload.taskType !== undefined && { taskType: payload.taskType }),
    ...(payload.topic !== undefined && { topic: payload.topic }),
    ...(payload.minWordCount !== undefined && { minWordCount: payload.minWordCount }),
    ...(payload.sampleAnswer !== undefined && { sampleAnswer: payload.sampleAnswer }),
    ...(payload.part !== undefined && { part: payload.part }),
    ...(payload.question !== undefined && { question: payload.question }),
    ...(payload.tips !== undefined && { tips: payload.tips }),
  };

  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

export async function deleteExercise(id: number): Promise<void> {
  const list = await getAllExercises();
  const filtered = list.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}


