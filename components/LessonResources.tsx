import React, { useState, useRef } from 'react';
import type { Lesson, User, Resource, ResourceKind } from '../types';
import * as geminiService from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { YouTubeSearch } from './YouTubeSearch';
import { VideoIcon, AudioIcon, PresentationIcon, DocumentIcon, PlusIcon, TrashIcon, UploadIcon, YouTubeIcon, CheckCircleIcon } from './Icons';

interface LessonResourcesProps {
  courseCode: string;
  lesson: Lesson;
  user: User;
  onAddTask: (lessonId: string) => void;
  onDeleteTask: (lessonId: string, taskId: string) => void;
  onToggleTaskStatus: (lessonId: string, taskId: string) => void;
  onAddResource: (lessonId: string, resource: Resource) => void;
  onDeleteResource: (lessonId: string, resourceId: string) => void;
  onUpdateResource: (lessonId: string, resource: Resource) => void;
  onSelectResource: (resource: Resource) => void;
}

type ResourceTab = 'resources' | 'tasks';
type AddResourceType = 'file' | 'youtube';

export const LessonResources: React.FC<LessonResourcesProps> = (props) => {
  const { courseCode, lesson, user, onAddTask, onDeleteTask, onToggleTaskStatus, onAddResource, onDeleteResource, onUpdateResource, onSelectResource } = props;
  const [activeTab, setActiveTab] = useState<ResourceTab>('resources');
  const [addResourceType, setAddResourceType] = useState<AddResourceType | null>(null);
  const showAdminControls = user.role === 'admin' || user.role === 'professor';

  const handleAddYouTubeResource = async (video: {id: string, title: string, description: string}) => {
    const newResource: Omit<Resource, 'id' | 'status' | 'gemini_file_id' | 'gemini_store_id' | 'summary' | 'transcript'> = {
        course_code: courseCode,
        lesson_id: lesson.id,
        title: video.title,
        description: video.description,
        kind: 'youtube_video',
        public_url: `https://www.youtube.com/watch?v=${video.id}`,
    };

    // In a real app, you'd probably trigger a backend function to get transcript and process.
    // For now, we'll add it directly as 'processed' but without transcript/summary.
    const { data: insertedResource, error } = await supabase.from('lesson_resources').insert({...newResource, status: 'processed'}).select().single();

    if (error) {
        alert('Failed to add YouTube video.');
        console.error(error);
    } else {
        onAddResource(lesson.id, insertedResource as Resource);
        setAddResourceType(null);
    }
  };


  return (
    <div className="p-6 h-full flex flex-col">
      <div className="border-b border-gray-200 mt-4 mb-4">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('resources')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'resources' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Resources</button>
          <button onClick={() => setActiveTab('tasks')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tasks</button>
        </nav>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'resources' && (
           <div>
             {addResourceType === 'file' && (
                <ResourceUploadForm 
                    lessonId={lesson.id}
                    courseCode={courseCode}
                    onAddResource={onAddResource}
                    onUpdateResource={onUpdateResource}
                    onCancel={() => setAddResourceType(null)}
                />
            )}
            {addResourceType === 'youtube' && (
                <YouTubeSearch onAddVideo={handleAddYouTubeResource} onCancel={() => setAddResourceType(null)} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(lesson.resources && lesson.resources.length > 0) ? (
                    lesson.resources.map((resource, index) => (
                        <GenericResourceCard 
                          key={resource.id} 
                          resource={resource}
                          onDelete={async () => {
                            if (resource.storage_path) {
                                await supabase.storage.from('course_resources').remove([resource.storage_path]);
                            }
                            await supabase.from('lesson_resources').delete().eq('id', resource.id);
                            onDeleteResource(lesson.id, resource.id);
                          }}
                          onSelect={() => onSelectResource(resource)}
                          showDelete={showAdminControls}
                          className="animate-fadeInUp"
                           style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                        />
                    ))
                ) : !addResourceType && (
                    <p className="text-sm text-gray-500 text-center py-8 col-span-2">No resources for this lesson yet.</p>
                )}
            </div>
             {showAdminControls && !addResourceType && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => setAddResourceType('file')} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">
                        <UploadIcon className="w-4 h-4"/> Add File
                    </button>
                    <button onClick={() => setAddResourceType('youtube')} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
                        <YouTubeIcon className="w-4 h-4"/> Add from YouTube
                    </button>
                </div>
            )}
           </div>
        )}
        {activeTab === 'tasks' && (
           <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Lesson Tasks</h3>
            {(lesson.tasks && lesson.tasks.length > 0) ? (
                lesson.tasks.map(task => (
                    <div key={task.id} className="group bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-200">
                        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={task.completed} 
                                onChange={() => onToggleTaskStatus(lesson.id, task.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</span>
                        </label>
                        {showAdminControls && (
                            <button onClick={() => onDeleteTask(lesson.id, task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">No tasks for this lesson yet.</p>
            )}

            {showAdminControls && (
                <button 
                    onClick={() => onAddTask(lesson.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
                >
                    <PlusIcon className="w-4 h-4"/> Add New Task
                </button>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

const GenericResourceCard: React.FC<{
  resource: Resource, 
  onDelete: () => void, 
  onSelect: () => void,
  showDelete: boolean,
  style?: React.CSSProperties;
  className?: string;
}> = ({ resource, onDelete, onSelect, showDelete, style, className }) => {
  const getIconForKind = (kind: ResourceKind) => {
    switch(kind) {
      case 'video': return VideoIcon;
      case 'audio': return AudioIcon;
      case 'youtube_video': return YouTubeIcon;
      case 'presentation': return PresentationIcon;
      default: return DocumentIcon;
    }
  }
  const Icon = getIconForKind(resource.kind);

  const statusMap = {
      processing: { text: 'Processing...', color: 'text-yellow-600 bg-yellow-100' },
      processed: { text: 'RAG Ready', color: 'text-green-600 bg-green-100' },
      failed: { text: 'RAG Failed', color: 'text-red-600 bg-red-100' },
  };
  const statusInfo = statusMap[resource.status];

  return (
    <div 
        className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.03] min-h-[200px] relative ${className || ''}`}
        style={style}
    >
      <div>
        <div className="w-16 h-16 bg-blue-100/60 rounded-full flex items-center justify-center mb-3 mx-auto">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <h4 className="font-semibold text-gray-800 text-sm">{resource.title}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
      </div>

       <div className="mt-4 flex flex-col items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
            <button onClick={onSelect} className="font-semibold text-blue-600 hover:text-blue-800 text-sm px-4 py-2 rounded-full transition-colors">
              {resource.kind === 'video' || resource.kind === 'youtube_video' ? 'Play Video' : resource.kind === 'audio' ? 'Listen' : 'View'}
            </button>
      </div>

       {showDelete && (
        <button onClick={onDelete} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
            <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

const ResourceUploadForm: React.FC<{
    lessonId: string,
    courseCode: string,
    onAddResource: (lessonId: string, resource: Resource) => void,
    onUpdateResource: (lessonId: string, resource: Resource) => void;
    onCancel: () => void,
}> = ({ lessonId, courseCode, onAddResource, onUpdateResource, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFile: File | null) => {
        if (!selectedFile || isAnalyzing) return;
        setFile(selectedFile);
        setIsAnalyzing(true);
        setError(null);
        setTitle('');
        setDescription('');
        try {
            const metadata = await geminiService.analyzeFileForMetadata(selectedFile);
            setTitle(metadata.title);
            setDescription(metadata.description);
        } catch (err: any) {
            setError("AI analysis failed. Please enter details manually.");
            setTitle(selectedFile.name); 
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
    };

    const getKindFromFileType = (fileType: string): ResourceKind => {
        if (fileType.startsWith('video/')) return 'video';
        if (fileType.startsWith('audio/')) return 'audio';
        if (fileType === 'application/pdf') return 'pdf';
        if (fileType.startsWith('image/')) return 'image';
        return 'document';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !file) { setError("Title and file are required."); return; }
        
        setIsSubmitting(true);
        setError(null);
        let resourceId = '';
        
        try {
            const { data: newResourceData, error: insertError } = await supabase.from('lesson_resources').insert({
                lesson_id: lessonId, course_code: courseCode, title: title, description: description,
                kind: getKindFromFileType(file.type), status: 'processing', public_url: '#'
            }).select().single();

            if (insertError) throw insertError;
            resourceId = newResourceData.id;
            onAddResource(lessonId, newResourceData as Resource);
            onCancel();

            const storagePath = `${courseCode}/${lessonId}/${resourceId}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('course_resources').upload(storagePath, file);
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage.from('course_resources').getPublicUrl(storagePath);

            const { gemini_file_id, gemini_store_id, summary, transcript, error: processingError } = await geminiService.processResourceForRag(file, courseCode, resourceId);
            
            const finalStatus: Resource['status'] = processingError ? 'failed' : 'processed';
            const finalUpdate = { public_url: urlData.publicUrl, storage_path: storagePath, status: finalStatus, gemini_file_id, gemini_store_id, summary, transcript };

            const { data: updatedResourceData, error: updateError } = await supabase.from('lesson_resources').update(finalUpdate).eq('id', resourceId).select().single();
            if (updateError) throw updateError;
            
            onUpdateResource(lessonId, updatedResourceData as Resource);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            if(resourceId) { // If it failed after creation, mark it as failed
                const { data } = await supabase.from('lesson_resources').update({ status: 'failed' }).eq('id', resourceId).select().single();
                if(data) onUpdateResource(lessonId, data as Resource);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 animate-fadeInUp col-span-1 sm:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-3">Add New Resource File</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div onClick={() => fileInputRef.current?.click()} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${ isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" disabled={isAnalyzing || isSubmitting}/>
                    <UploadIcon className="w-8 h-8 text-gray-400 mb-2"/>
                    <p className="text-sm font-semibold text-gray-700">{isAnalyzing ? 'Analyzing file...' : (file ? file.name : 'Drag & drop a file or click to upload')}</p>
                    {isAnalyzing && (<div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-blue-500 h-1.5 rounded-full animate-pulse"></div></div>)}
                </div>
                <div className="space-y-3">
                    <input type="text" placeholder="Resource Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md text-sm" required disabled={isAnalyzing || isSubmitting} />
                    <textarea placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md text-sm" rows={3} disabled={isAnalyzing || isSubmitting}></textarea>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md text-sm border border-gray-300">Cancel</button>
                    <button type="submit" disabled={isSubmitting || isAnalyzing || !file} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold disabled:bg-gray-400">Save Resource</button>
                </div>
            </form>
        </div>
    );
}