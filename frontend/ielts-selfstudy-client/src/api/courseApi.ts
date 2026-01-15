import httpClient from "./httpClient";

export interface CourseDto {
  id: number;
  name: string;
  shortDescription?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
  createdAt: string;
}

export async function getCourses(): Promise<CourseDto[]> {
  const res = await httpClient.get<CourseDto[]>("/courses");
  return res.data;
}
