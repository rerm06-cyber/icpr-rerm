import React from 'react';
import type { Course, ProgressData } from '../types';
import { CheckCircleIcon, CourseIcon, MapIcon } from './Icons';

interface ProgramRoadmapProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  progressData: ProgressData;
}

export const ProgramRoadmap: React.FC<ProgramRoadmapProps> = ({ courses, onSelectCourse, progressData }) => {
  // FIX: The explicit type on the `acc` parameter was redundant and potentially
  // confusing for the TypeScript compiler. By removing it, the accumulator's type
  // is correctly inferred from the typed initial value, resolving the downstream
  // error where `termCourses` was incorrectly typed as `unknown`.
  const coursesByTerm = courses.reduce((acc, course) => {
    const term = course.term;
    if (!acc[term]) {
      acc[term] = [];
    }
    acc[term].push(course);
    return acc;
  }, {} as Record<number, Course[]>);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapIcon className="w-6 h-6 text-blue-600" />
        Program Roadmap
      </h2>
      <div className="space-y-6">
        {Object.entries(coursesByTerm).sort(([a], [b]) => Number(a) - Number(b)).map(([term, termCourses]) => (
          <div key={term}>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Term {term}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(termCourses as Course[]).map(course => {
                const isStarted = progressData[course.code]?.started;
                return (
                  <button
                    key={course.code}
                    onClick={() => onSelectCourse(course)}
                    className="group bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-lg hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                        <CourseIcon className="w-6 h-6 text-blue-500" />
                      </div>
                      {isStarted && (
                        <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          <span>Started</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-800 mt-3">{course.code}</h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{course.title}</p>
                    <p className="text-xs text-gray-400 mt-2">{course.credits} credits</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
