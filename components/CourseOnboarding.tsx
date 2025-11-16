import React from 'react';
import type { Course } from '../types';
import { XIcon, CourseIcon } from './Icons';

interface CourseOnboardingProps {
  course: Course;
  onStartCourse: () => void;
  onClose: () => void;
}

export const CourseOnboarding: React.FC<CourseOnboardingProps> = ({ course, onStartCourse, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100/80 border border-blue-200 rounded-full flex items-center justify-center mb-4">
                <CourseIcon className="w-8 h-8 text-blue-600"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to {course.code}</h1>
            <h2 className="text-lg text-blue-600 font-semibold mt-1 mb-4">{course.title}</h2>
            <p className="text-gray-500 text-sm mb-8">{course.description}</p>
            <button
                onClick={onStartCourse}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
                Start Course
            </button>
        </div>
      </div>
    </div>
  );
};