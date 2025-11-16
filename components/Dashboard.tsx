import React, { useState } from 'react';
import { Chat } from './Chat';
import { ProgramRoadmap } from './ProgramRoadmap';
import { UserProgress } from './UserProgress';
import type { Course, ProgressData, User } from '../types';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './Icons';

interface DashboardProps {
    courses: Course[];
    onSelectCourse: (course: Course) => void;
    progressData: ProgressData;
    totalLessonsByCourse: { [courseCode:string]: number };
    user: User;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { courses, onSelectCourse, progressData, totalLessonsByCourse, user } = props;
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const programAssistantPrompt = `You are the ICPR Junior College AI Program Assistant. Your role is to help students navigate the "Grado Asociado en Inteligencia Artificial aplicada a la Gestión Empresarial (ASIA)" program. You can answer questions about course schedules, program objectives, and general academic queries. Be helpful, friendly, and professional. Use Google Search for up-to-date information when needed. Current courses are: ${courses.map(c => `${c.code}: ${c.title}`).join(', ')}.`;

  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex-1 p-8 overflow-y-auto transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the AI Student Portal</h1>
        <p className="text-gray-500 mb-8">Your academic journey in Artificial Intelligence starts here.</p>

        <UserProgress 
          courses={courses} 
          progressData={progressData} 
          totalLessonsByCourse={totalLessonsByCourse} 
        />
        
        <ProgramRoadmap courses={courses} onSelectCourse={onSelectCourse} progressData={progressData} />

      </div>
      <div className={`relative transition-all duration-300 ${isChatCollapsed ? 'w-0' : 'w-full max-w-md'}`}>
         <button 
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            className="absolute top-1/2 -left-4 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100"
            title={isChatCollapsed ? 'Show Chat' : 'Hide Chat'}
          >
           {isChatCollapsed ? <ChevronDoubleLeftIcon className="w-5 h-5 text-gray-600" /> : <ChevronDoubleRightIcon className="w-5 h-5 text-gray-600" />}
          </button>
        {!isChatCollapsed && (
            <div className="w-full h-full border-l border-gray-200 flex flex-col">
                <Chat 
                  systemPrompt={programAssistantPrompt} 
                  chatTitle="Program Assistant"
                  user={user}
                  ragContext={{}} // No course-specific context
                  contextType="program_assistant"
                />
            </div>
        )}
      </div>
    </div>
  );
};