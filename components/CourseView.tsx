import React, { useState, useMemo, useEffect } from 'react';
import type { Course, Lesson, ProgressData, User, Resource } from '../types';
import { LessonView } from './LessonView';
import { ModuleAccordion } from './CourseStructure';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, LessonIcon } from './Icons';

interface CourseViewProps {
  course: Course;
  onCourseUpdate: (course: Course) => void; // Keep for student-side updates like task completion
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  progressData: ProgressData[string];
  totalLessons: number;
  user: User;
}

// This component is now primarily for the STUDENT experience.
// Admin and Professor views are handled by AdminCourseBuilder and ProfessorWorkspace.
export const CourseView: React.FC<CourseViewProps> = (props) => {
  const { course, onCourseUpdate, selectedLesson, onSelectLesson, progressData, totalLessons, user } = props;
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course>(course);

  useEffect(() => {
    setCurrentCourse(course);
  }, [course]);
  
  const findLessonAndApply = (
    courseState: Course,
    lessonId: string,
    updateFn: (lesson: Lesson) => Lesson
  ): Course => {
    const newModules = courseState.modules.map(module => ({
      ...module,
      units: module.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => 
          lesson.id === lessonId ? updateFn(lesson) : lesson
        ),
      })),
    }));
    return { ...courseState, modules: newModules };
  };

  const handleToggleTaskStatus = (lessonId: string, taskId: string) => {
    const updatedCourse = findLessonAndApply(currentCourse, lessonId, (lesson) => ({
        ...lesson,
        tasks: (lesson.tasks || []).map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
    }));
    onCourseUpdate(updatedCourse); // Notify parent for any potential persistence
  };
  
  // These handlers are now simplified for student-only interactions.
  // Resource adding/deleting is handled in admin/prof views.
  const handleUpdateResource = (lessonId: string, updatedResource: Resource) => {
      const updatedCourse = findLessonAndApply(currentCourse, lessonId, (lesson) => ({
          ...lesson,
          resources: (lesson.resources || []).map(r => r.id === updatedResource.id ? updatedResource : r)
      }));
      onCourseUpdate(updatedCourse);
  };

  const progressPercentage = useMemo(() => {
    if (!progressData || !totalLessons) return 0;
    return Math.round((progressData.viewedLessons.size / totalLessons) * 100);
  }, [progressData, totalLessons]);

  const { previousLesson, nextLesson } = useMemo(() => {
    if (!selectedLesson) {
      return { previousLesson: null, nextLesson: null };
    }
    const allLessons: Lesson[] = currentCourse.modules.flatMap(m => m.units.flatMap(u => u.lessons));
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    return { previousLesson: prev, nextLesson: next };
  }, [currentCourse, selectedLesson]);

  const lessonForView = selectedLesson 
    ? currentCourse.modules
        .flatMap(m => m.units)
        .flatMap(u => u.lessons)
        .find(l => l.id === selectedLesson.id) 
    : null;

  return (
    <div className="flex h-full bg-white">
       <div className={`relative transition-all duration-300 ${isNavCollapsed ? 'w-0' : 'w-1/3 max-w-sm'}`}>
        <div className={`h-full bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col ${isNavCollapsed ? 'invisible' : 'visible'}`}>
            <div className="p-2">
                <h2 className="text-lg font-bold text-gray-900">{currentCourse.title}</h2>
                <p className="text-sm text-gray-500 mb-4">{currentCourse.description}</p>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
                {currentCourse.modules.map(module => (
                <ModuleAccordion 
                    key={module.id} 
                    module={module} 
                    user={user}
                    onSelectLesson={onSelectLesson} 
                    selectedLesson={selectedLesson}
                    isEditMode={false} // Always false for students
                    // FIX: Pass a no-op function for onSelectItem as it's not used in student view.
                    onSelectItem={() => {}}
                />
                ))}
            </div>
        </div>
      </div>
      <div className="flex-1 relative">
         <button 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            className="absolute top-1/2 -left-4 z-20 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100"
            title={isNavCollapsed ? 'Show Navigation' : 'Hide Navigation'}
          >
           {isNavCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5 text-gray-600" /> : <ChevronDoubleLeftIcon className="w-5 h-5 text-gray-600" />}
        </button>
        {lessonForView ? (
          <LessonView 
            key={lessonForView.id}
            courseCode={currentCourse.code}
            lesson={lessonForView} 
            user={user}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onSelectLesson={onSelectLesson}
            onToggleTaskStatus={handleToggleTaskStatus}
            onUpdateResource={handleUpdateResource}
            // Stubs for non-student actions
            onAddTask={() => {}}
            onDeleteTask={() => {}}
            onAddResource={() => {}}
            onDeleteResource={() => {}}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="bg-gray-100 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4">
                <LessonIcon className="w-12 h-12" />
              </div>
              <p>Select a lesson from the left to begin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};