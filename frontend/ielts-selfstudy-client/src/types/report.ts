export interface OverviewReportDto {
  totalUsers: number;
  activeUsers: number;
  userGrowthPercentage: number;
  newUsersThisMonth: number;

  totalCourses: number;
  totalExercises: number;
  totalAttempts: number;

  averageSessionTimeMinutes: number;
  courseCompletionRatePercentage: number;

  monthlyRecurringRevenue: number;
  revenueGrowthPercentage: number;
  recentTransactions: RecentTransactionDto[];
  averageScoresBySkill: Record<string, number>;
  topStudents: TopStudentDto[];
  difficultExercises: DifficultExerciseDto[];
}

export interface TopStudentDto {
  userId: number;
  fullName: string;
  completedAttempts: number;
  averageScore: number;
}

export interface DifficultExerciseDto {
  exerciseId: number;
  title: string;
  type: string;
  totalAttempts: number;
  averageScore: number;
}

export interface RecentTransactionDto {
  id: number;
  transactionRef: string;
  userName: string;
  courseName: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
}
