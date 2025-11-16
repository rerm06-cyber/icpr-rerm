import React, { useState } from 'react';
import type { Lesson, User, Resource } from '../types';
import { Chat } from './Chat';
import { CreativeLab } from './CreativeLab';
import { LiveConversation } from './LiveConversation';
import { LessonResources } from './LessonResources';
import { MediaInteractionView } from './MediaInteractionView';
import { BotIcon, LabIcon, MicIcon } from './Icons';

interface LessonViewProps {
  courseCode: string;
  lesson: Lesson;
  user: User;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  onAddTask: (lessonId: string) => void;
  onDeleteTask: (lessonId: string, taskId: string) => void;
  onToggleTaskStatus: (lessonId: string, taskId: string) => void;
  onAddResource: (lessonId: string, resource: Resource) => void;
  onDeleteResource: (lessonId: string, resourceId: string) => void;
  onUpdateResource: (lessonId: string, resource: Resource) => void;
}

type ActiveTab = 'tutor' | 'lab' | 'live';

export const LessonView: React.FC<LessonViewProps> = (props) => {
  const { 
    lesson, 
    user, 
    previousLesson, 
    nextLesson, 
    onSelectLesson, 
    courseCode, 
    onAddTask, 
    onDeleteTask, 
    onToggleTaskStatus, 
    onAddResource, 
    onDeleteResource,
    onUpdateResource
  } = props;
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutor');
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  
  const tutorSystemPrompt = [
    `You are an AI Tutor role-playing as ${lesson.tutorAvatar.name}.`,
    `Your core instructions are: "${lesson.tutorAvatar.systemPrompt}".`,
    `You are assisting a student in the lesson titled "${lesson.title}" from the course "${courseCode}".`,
    `The primary objective of this lesson is: "${lesson.objective}".`,
    `The key concepts to focus on are: ${lesson.keyConcepts.join(', ')}.`,
    'Keep your conversation and explanations strictly within the context of this lesson and the overall course.',
    `When providing information, use the persona of ${lesson.tutorAvatar.name} as described in your core instructions.`
  ].join('\n');

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{className: string}> }[] = [
    { id: 'tutor', label: 'Tutor Avatar', icon: BotIcon },
    { id: 'lab', label: 'AI Creative Lab', icon: LabIcon },
  ];

  if (lesson.hasLiveConversation) {
    tabs.push({ id: 'live', label: 'Live Practice', icon: MicIcon });
  }

  const handleSelectResource = (resource: Resource) => {
    // FIX: Changed resource.fileType to resource.kind for correct property access.
    // Only video and audio can be "played" in the interaction view
    if (resource.kind === 'video' || resource.kind === 'youtube_video' || resource.kind === 'audio') {
       setActiveResource(resource);
    } else {
       // For other file types, open them in a new tab
       window.open(resource.public_url, '_blank');
    }
  };

  const handleCloseMedia = () => {
    setActiveResource(null);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
           {/* FIX: Removed onSelectLesson prop as it is not used in LessonResources */}
           <LessonResources 
            courseCode={courseCode}
            lesson={lesson} 
            user={user} 
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onToggleTaskStatus={onToggleTaskStatus}
            onAddResource={onAddResource}
            onDeleteResource={onDeleteResource}
            onUpdateResource={onUpdateResource}
            onSelectResource={handleSelectResource}
           />
        </div>
        <div className="w-full md:w-1/2 border-l border-gray-200 flex flex-col">
            {activeResource ? (
              <MediaInteractionView 
                resource={activeResource}
                onClose={handleCloseMedia}
                user={user}
                courseCode={courseCode}
                lessonId={lesson.id}
              />
            ) : (
              <>
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-2 p-2">
                    {tabs.map((tab) => (
                        <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                            activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        </button>
                    ))}
                    </nav>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'tutor' && 
                      <Chat 
                        systemPrompt={tutorSystemPrompt} 
                        chatTitle={lesson.tutorAvatar.name} 
                        user={user}
                        ragContext={{ courseCode: courseCode }}
                        contextType='course_tutor'
                        courseCode={courseCode}
                        lessonId={lesson.id}
                      />}
                    {activeTab === 'lab' && <CreativeLab />}
                    {activeTab === 'live' && lesson.hasLiveConversation && <LiveConversation />}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
};
