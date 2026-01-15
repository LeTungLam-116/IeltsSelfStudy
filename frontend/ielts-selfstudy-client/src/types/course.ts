export interface Course {
  id: number;
  title: string;
  description?: string | null;
  skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  level?: string | null; // or TargetBand
  targetBand?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CourseFormData {
  title: string;
  description?: string;
  skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  level?: string;
  targetBand?: number | null;
  isActive: boolean;
}


