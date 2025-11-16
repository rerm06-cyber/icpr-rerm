import React, { useMemo } from 'react';
import type { Course, ProgressData } from '../types';
import { CourseIcon } from './Icons';

interface UserProgressProps {
  courses: Course[];
  progressData: ProgressData;
  totalLessonsByCourse: { [courseCode: string]: number };
}

export const UserProgress: React.FC<UserProgressProps> = ({ courses, progressData, totalLessonsByCourse }) => {
  const startedCourses = useMemo(() => {
    return courses.filter(course => progressData[course.code]?.started);
  }, [courses, progressData]);

  const totalCourses = courses.length;
  const totalStarted = startedCourses.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-blue-600">{totalCourses}</p>
          <p className="text-sm text-gray-500">Total Courses</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">{totalStarted}</p>
          <p className="text-sm text-gray-500">Courses Started</p>
        </div>
      </div>
      {totalStarted > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">Started Courses</h3>
          <div className="space-y-4">
            {startedCourses.map(course => {
              const totalLessons = totalLessonsByCourse[course.code] || 1;
              const viewedLessons = progressData[course.code]?.viewedLessons.size || 0;
              const percentage = Math.round((viewedLessons / totalLessons) * 100);
              return (
                <div key={course.code}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-700">{course.code} - {course.title}</p>
                    <p className="text-sm font-medium text-blue-600">{percentage}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};