import React, { useState, useCallback } from 'react';
import type { Course, SelectedItem, User, Module, Unit, Lesson } from '../types';
import { supabase } from '../services/supabaseClient';
import { ModuleAccordion, CourseHeader } from './CourseStructure';
import { InlineEditor } from './InlineEditor';

interface AdminCourseBuilderProps {
  course: Course;
  onCourseUpdate: (updatedCourse: Course) => void;
}

export const AdminCourseBuilder: React.FC<AdminCourseBuilderProps> = ({ course, onCourseUpdate }) => {
  const [currentCourse, setCurrentCourse] = useState<Course>(course);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: 'course', id: course.code });
  const user: User = { name: 'Admin User', role: 'admin' };

  const handleUpdate = (updatedCourse: Course) => {
    setCurrentCourse(updatedCourse);
    onCourseUpdate(updatedCourse);
  };

  const handleNameSave = async (newName: string) => {
    // This is a generic handler for all name edits
    // In a real app, you might have separate tables. Here we update the JSONB field.
    let updatedModules = JSON.parse(JSON.stringify(currentCourse.modules)); // Deep copy

    switch(selectedItem.type) {
        case 'course':
            const { error: courseError } = await supabase.from('courses').update({ title: newName }).eq('code', currentCourse.code);
            if (courseError) { alert("Failed to update course title."); console.error(courseError); return; }
            handleUpdate({ ...currentCourse, title: newName });
            break;
        case 'module':
            updatedModules = updatedModules.map((m: Module) => m.id === selectedItem.id ? { ...m, title: newName } : m);
            break;
        case 'unit':
            updatedModules = updatedModules.map((m: Module) => ({
                ...m,
                units: m.units.map((u: Unit) => u.id === selectedItem.id ? { ...u, title: newName } : u)
            }));
            break;
        case 'lesson':
            updatedModules = updatedModules.map((m: Module) => ({
                ...m,
                units: m.units.map((u: Unit) => ({
                    ...u,
                    lessons: u.lessons.map((l: Lesson) => l.id === selectedItem.id ? { ...l, title: newName } : l)
                }))
            }));
            break;
    }

    if (selectedItem.type !== 'course') {
        const { error: moduleError } = await supabase.from('courses').update({ modules: updatedModules }).eq('code', currentCourse.code);
        if (moduleError) { alert("Failed to save changes."); console.error(moduleError); return; }
        handleUpdate({ ...currentCourse, modules: updatedModules });
    }
  };

  const renderEditorPanel = () => {
    let item: any;
    switch(selectedItem.type) {
        case 'course':
            item = currentCourse;
            break;
        case 'module':
            item = currentCourse.modules.find(m => m.id === selectedItem.id);
            break;
        case 'unit':
            item = currentCourse.modules.flatMap(m => m.units).find(u => u.id === selectedItem.id);
            break;
        case 'lesson':
             item = currentCourse.modules.flatMap(m => m.units.flatMap(u => u.lessons)).find(l => l.id === selectedItem.id);
             break;
    }
    if (!item) return <div className="p-8">Select an item from the left to edit.</div>;

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 capitalize mb-4">{selectedItem.type} Editor</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <InlineEditor
                        value={item.title}
                        onSave={handleNameSave}
                    />
                </div>
                {selectedItem.type === 'lesson' && <LessonEditor lesson={item} />}
                 {selectedItem.type === 'course' && <CourseSettingsEditor course={item} />}
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-full bg-white">
      <div className="w-1/3 max-w-sm h-full bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 flex flex-col">
        <CourseHeader course={currentCourse} onSelectItem={setSelectedItem} user={user} isEditMode={true} />
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {currentCourse.modules.map(module => (
            <ModuleAccordion 
              key={module.id} 
              module={module} 
              user={user}
              onSelectLesson={(lesson) => setSelectedItem({ type: 'lesson', id: lesson.id })}
              selectedLesson={selectedItem.type === 'lesson' ? {id: selectedItem.id} as Lesson : null}
              isEditMode={true}
              onSelectItem={setSelectedItem}
            />
          ))}
        </div>
      </div>
      <div className="flex-1">
        {renderEditorPanel()}
      </div>
    </div>
  );
};

const LessonEditor = ({ lesson }: { lesson: Lesson }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mt-6 mb-2">Lesson Details</h3>
            <p className="text-sm text-gray-500">Objective: {lesson.objective}</p>
            <div className="mt-2">
                <h4 className="font-medium text-gray-700">Key Concepts:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                    {lesson.keyConcepts.map(c => <li key={c}>{c}</li>)}
                </ul>
            </div>
             <div className="mt-4">
                 <h4 className="font-medium text-gray-700">Resources:</h4>
                 <div className="text-sm text-gray-600">Resource management for this lesson would appear here.</div>
             </div>
        </div>
    );
};

const CourseSettingsEditor = ({ course }: { course: Course }) => {
     return (
        <div>
            <h3 className="text-lg font-semibold mt-6 mb-2">Course Settings</h3>
             <p className="text-sm text-gray-500">Course Code: {course.code}</p>
             <p className="text-sm text-gray-500">Description: {course.description}</p>
             <p className="text-sm text-gray-500">Credits: {course.credits}</p>
            <div className="mt-4">
                <h4 className="font-medium text-gray-700">Student View Customization</h4>
                <p className="text-sm text-gray-400">Color palette and background image settings would go here.</p>
            </div>
             <div className="mt-4">
                <h4 className="font-medium text-gray-700">Student Management</h4>
                <p className="text-sm text-gray-400">A list of enrolled students and access to their chat logs would appear here.</p>
            </div>
        </div>
    );
}
