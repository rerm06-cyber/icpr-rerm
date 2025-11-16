import React, { useState } from 'react';
import type { Course, SelectedItem, User, Module, Unit, Lesson } from '../types';
import { supabase } from '../services/supabaseClient';
import { ModuleAccordion, CourseHeader } from './CourseStructure';
import { InlineEditor } from './InlineEditor';
import { LessonView } from './LessonView'; // To show lesson content

interface ProfessorWorkspaceProps {
  course: Course;
  onCourseUpdate: (updatedCourse: Course) => void;
}

export const ProfessorWorkspace: React.FC<ProfessorWorkspaceProps> = ({ course, onCourseUpdate }) => {
  const [currentCourse, setCurrentCourse] = useState<Course>(course);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(course.modules[0]?.units[0]?.lessons[0] || null);
  const user: User = { name: 'Professor Smith', role: 'professor' };

  const handleUpdate = (updatedCourse: Course) => {
    setCurrentCourse(updatedCourse);
    onCourseUpdate(updatedCourse);
  };
  
  const handleNameSave = async (item: SelectedItem, newName: string) => {
    let updatedModules = JSON.parse(JSON.stringify(currentCourse.modules));
    
    // Professors can only edit Units and Lessons
    switch(item.type) {
        case 'unit':
            updatedModules = updatedModules.map((m: Module) => ({
                ...m,
                units: m.units.map((u: Unit) => u.id === item.id ? { ...u, title: newName } : u)
            }));
            break;
        case 'lesson':
            updatedModules = updatedModules.map((m: Module) => ({
                ...m,
                units: m.units.map((u: Unit) => ({
                    ...u,
                    lessons: u.lessons.map((l: Lesson) => l.id === item.id ? { ...l, title: newName } : l)
                }))
            }));
            break;
        default:
            // Should not happen with the UI controls
            console.warn("Professors cannot edit this item type.");
            return;
    }

    const { error } = await supabase.from('courses').update({ modules: updatedModules }).eq('code', currentCourse.code);
    if (error) { alert("Failed to save changes."); console.error(error); return; }
    handleUpdate({ ...currentCourse, modules: updatedModules });
  };
  
  const findLessonAndApply = (lessonId: string, updateFn: (lesson: Lesson) => Lesson): void => {
    const newModules = currentCourse.modules.map(module => ({
      ...module,
      units: module.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => 
          lesson.id === lessonId ? updateFn(lesson) : lesson
        ),
      })),
    }));
    handleUpdate({ ...currentCourse, modules: newModules });
  };

  const handleUpdateResource = (lessonId: string, updatedResource: any) => {
      findLessonAndApply(lessonId, (lesson) => ({
          ...lesson,
          resources: (lesson.resources || []).map(r => r.id === updatedResource.id ? updatedResource : r)
      }));
  };

  const handleAddResource = (lessonId: string, resource: any) => {
     findLessonAndApply(lessonId, (lesson) => ({
          ...lesson,
          resources: [...(lesson.resources || []), resource],
      }));
  };

  const handleDeleteResource = (lessonId: string, resourceId: string) => {
    findLessonAndApply(lessonId, (lesson) => ({
        ...lesson,
        resources: (lesson.resources || []).filter(res => res.id !== resourceId),
    }));
  };


  return (
    <div className="flex h-full bg-white">
      <div className="w-1/3 max-w-sm h-full bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 flex flex-col">
        <CourseHeader course={currentCourse} onSelectItem={() => {}} user={user} isEditMode={true} />
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {currentCourse.modules.map(module => (
            <ModuleAccordion 
              key={module.id} 
              module={module} 
              user={user}
              onSelectLesson={setSelectedLesson}
              selectedLesson={selectedLesson}
              isEditMode={true}
              onSelectItem={(item) => {/* Not used for direct editing panel in this view */}}
              onEditItem={handleNameSave}
            />
          ))}
        </div>
      </div>
      <div className="flex-1">
        {selectedLesson ? (
            <LessonView
                key={selectedLesson.id}
                courseCode={currentCourse.code}
                lesson={selectedLesson}
                user={user}
                previousLesson={null} // Simplified for this view
                nextLesson={null}
                onSelectLesson={setSelectedLesson}
                onUpdateResource={handleUpdateResource}
                onAddResource={handleAddResource}
                onDeleteResource={handleDeleteResource}
                // Placeholder functions for tasks
                onAddTask={() => alert("Task management from this view is in development.")}
                onDeleteTask={() => {}}
                onToggleTaskStatus={() => {}}
            />
        ) : (
            <div className="p-8">Select a lesson to manage its content.</div>
        )}
      </div>
    </div>
  );
};
