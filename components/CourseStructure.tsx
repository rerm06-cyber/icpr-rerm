import React, { useState } from 'react';
import type { Course, Lesson, Module, Unit, User, SelectedItem } from '../types';
import { ModuleIcon, UnitIcon, LessonIcon, PencilIcon, TrashIcon, PlusIcon, ChevronDownIcon } from './Icons';
import { InlineEditor } from './InlineEditor';

export const CourseHeader: React.FC<{
  course: Course,
  user: User,
  isEditMode: boolean,
  onSelectItem: (item: SelectedItem) => void;
}> = ({ course, user, isEditMode, onSelectItem }) => {
  return (
    <div className="p-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900 flex-grow" onClick={() => onSelectItem({type: 'course', id: course.code})}>
          {course.title}
        </h2>
        {isEditMode && user.role === 'admin' && (
          <button onClick={() => onSelectItem({type: 'course', id: course.code})} title="Edit course title" className="p-1 text-gray-400 hover:text-blue-600">
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">{course.description}</p>
    </div>
  );
};


export const ModuleAccordion: React.FC<{ 
  module: Module, 
  user: User,
  onSelectLesson: (lesson: Lesson) => void, 
  selectedLesson: Lesson | null,
  isEditMode: boolean,
  onSelectItem: (item: SelectedItem) => void,
  onEditItem?: (item: SelectedItem, newName: string) => void,
}> = (props) => {
  const { module, user, onSelectLesson, selectedLesson, isEditMode, onSelectItem, onEditItem } = props;
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newName: string) => {
    onEditItem?.({ type: 'module', id: module.id }, newName);
    setIsEditing(false);
  }

  return (
    <div className="mb-2">
      <div className="group w-full flex items-center justify-between p-3 bg-gray-100/50 rounded-lg text-left">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 flex-grow">
          <ModuleIcon className="w-5 h-5 text-blue-500" />
          {isEditing ? (
              <InlineEditor value={module.title} onSave={handleSave} />
          ) : (
            <div onClick={() => onSelectItem({type: 'module', id: module.id})}>
              <span className="font-bold text-gray-800">{module.title}</span>
              <span className="text-xs text-gray-500 ml-2">Weeks {module.weeks}</span>
            </div>
          )}
        </button>
        <div className="flex items-center gap-2">
          {isEditMode && user.role === 'admin' && (
            <button onClick={() => setIsEditing(!isEditing)} title="Edit module title" className="p-1 text-gray-500 hover:text-gray-800"><PencilIcon className="w-4 h-4"/></button>
          )}
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className="pl-4 pt-2">
          {module.units.map(unit => (
            <UnitAccordion 
              key={unit.id}
              unit={unit}
              user={user}
              onSelectLesson={onSelectLesson}
              selectedLesson={selectedLesson}
              isEditMode={isEditMode}
              onSelectItem={onSelectItem}
              onEditItem={onEditItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const UnitAccordion: React.FC<{ 
  unit: Unit, 
  user: User,
  onSelectLesson: (lesson: Lesson) => void, 
  selectedLesson: Lesson | null,
  isEditMode: boolean,
  onSelectItem: (item: SelectedItem) => void,
  onEditItem?: (item: SelectedItem, newName: string) => void,
}> = ({ unit, user, onSelectLesson, selectedLesson, isEditMode, onSelectItem, onEditItem }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = user.role === 'admin' || user.role === 'professor';

  const handleSave = (newName: string) => {
    onEditItem?.({ type: 'unit', id: unit.id }, newName);
    setIsEditing(false);
  }
  
  return (
    <div className="mb-2">
      <div className="group w-full flex items-center justify-between p-3 rounded-lg text-left">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 flex-grow">
          <UnitIcon className="w-5 h-5 text-gray-400" />
           {isEditing ? (
              <InlineEditor value={unit.title} onSave={handleSave} />
          ) : (
             <span className="font-semibold text-gray-600" onClick={() => onSelectItem({type: 'unit', id: unit.id})}>{unit.title}</span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {isEditMode && canEdit && (
             <button onClick={() => setIsEditing(!isEditing)} title="Edit unit title" className="p-1 text-gray-500 hover:text-gray-800"><PencilIcon className="w-4 h-4"/></button>
          )}
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className="pl-6 border-l-2 border-gray-200 ml-2.5">
          {unit.lessons.map(lesson => (
            <LessonItem 
                key={lesson.id} 
                lesson={lesson} 
                user={user} 
                onSelectLesson={onSelectLesson} 
                selectedLesson={selectedLesson} 
                isEditMode={isEditMode} 
                onSelectItem={onSelectItem}
                onEditItem={onEditItem}
            />
          ))}
        </div>
      )}
    </div>
  )
};

const LessonItem: React.FC<{
    lesson: Lesson,
    user: User,
    onSelectLesson: (lesson: Lesson) => void,
    selectedLesson: Lesson | null,
    isEditMode: boolean,
    onSelectItem: (item: SelectedItem) => void,
    onEditItem?: (item: SelectedItem, newName: string) => void,
}> = ({ lesson, user, onSelectLesson, selectedLesson, isEditMode, onSelectItem, onEditItem }) => {
    const [isEditing, setIsEditing] = useState(false);
    const canEdit = user.role === 'admin' || user.role === 'professor';

    const handleSave = (newName: string) => {
        onEditItem?.({ type: 'lesson', id: lesson.id }, newName);
        setIsEditing(false);
    }
    
    return (
        <div className="group flex items-center justify-between">
              <div 
                onClick={() => onSelectLesson(lesson)} 
                className={`flex-grow text-left p-3 my-1 rounded-lg flex items-center gap-3 transition-colors text-sm cursor-pointer ${selectedLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <LessonIcon className="w-4 h-4" />
                 {isEditing ? (
                    <InlineEditor value={lesson.title} onSave={handleSave} />
                ) : (
                    <span onClick={(e) => { e.stopPropagation(); onSelectItem({type: 'lesson', id: lesson.id})}}>Week {lesson.week}: {lesson.title}</span>
                )}
              </div>
              {isEditMode && canEdit && (
                <div className="flex items-center pr-2">
                    <button onClick={() => setIsEditing(!isEditing)} title="Edit lesson title" className="p-1 text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                </div>
              )}
        </div>
    )
}
