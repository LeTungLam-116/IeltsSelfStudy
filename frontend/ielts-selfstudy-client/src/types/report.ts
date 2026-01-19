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
}
