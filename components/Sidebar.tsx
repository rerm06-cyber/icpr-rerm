import React from 'react';
import type { Course, User } from '../types';
import { DashboardIcon, CourseIcon, ICPRIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './Icons';

interface SidebarProps {
  courses: Course[];
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
  onGoToDashboard: () => void;
  user: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ courses, selectedCourse, onSelectCourse, onGoToDashboard, user, isCollapsed, onToggleCollapse }) => {
  return (
    <aside className={`fixed top-0 left-0 h-full bg-white flex flex-col border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`p-4 border-b border-gray-200 flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <ICPRIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
        {!isCollapsed && <span className="font-bold text-lg text-gray-900">ICPR AI Portal</span>}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button 
          onClick={onGoToDashboard} 
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${isCollapsed ? 'justify-center' : ''} ${!selectedCourse ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <DashboardIcon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Dashboard</span>}
        </button>
        
        <div className="pt-4">
          <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'C' : 'Courses'}
          </h3>
          {courses.map(course => (
            <button 
              key={course.code} 
              onClick={() => onSelectCourse(course)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${isCollapsed ? 'justify-center' : ''} ${selectedCourse?.code === course.code ? 'bg-blue-600/90 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              title={isCollapsed ? `${course.code} - ${course.title}` : ''}
            >
              <CourseIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              {!isCollapsed && <span>{course.code} - {course.title}</span>}
            </button>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button onClick={onToggleCollapse} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          {isCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};