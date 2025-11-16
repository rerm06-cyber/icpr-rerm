import React, { useState } from 'react';
import { Chat } from './Chat';
import { ChevronLeftIcon } from './Icons';
import type { User, Resource } from '../types';

interface MediaInteractionViewProps {
  resource: Resource;
  onClose: () => void;
  user: User;
  courseCode: string;
  lessonId: string;
}

type MediaTab = 'player' | 'summary' | 'transcript';

export const MediaInteractionView: React.FC<MediaInteractionViewProps> = ({ resource, onClose, user, courseCode, lessonId }) => {
  
  const [activeTab, setActiveTab] = useState<MediaTab>('player');
  
  const mediaSystemPrompt = `You are an AI assistant specialized in analyzing the content of the media titled "${resource.title}". Your task is to answer user questions based on information retrieved from this specific file. If the answer isn't in the provided context, state that the information is not available in this resource. Be helpful and stay on topic.`;
  
  const renderPlayer = () => {
    // FIX: Use `resource.kind` instead of `resource.fileType` and add support for YouTube videos.
    if (resource.kind === 'youtube_video') {
      try {
        const videoId = new URL(resource.public_url).searchParams.get('v');
        if (!videoId) return <div className="text-white p-4">Invalid YouTube URL</div>;
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
          <iframe
            key={resource.id}
            className="w-full aspect-video"
            src={embedUrl}
            title={resource.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      } catch (e) {
        return <div className="text-white p-4">Invalid YouTube URL</div>;
      }
    }

    if (resource.kind === 'video') {
      return (
        <video key={resource.id} controls src={resource.public_url} className="w-full h-full object-contain">
            Your browser does not support the video tag.
        </video>
      );
    }
    if (resource.kind === 'audio') {
       return (
         <div className="p-8">
            <audio key={resource.id} controls src={resource.public_url} className="w-full">
              Your browser does not support the audio element.
            </audio>
         </div>
       );
    }
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-3">
            <ChevronLeftIcon className="w-5 h-5"/>
            Back to Lesson
        </button>
        <h2 className="font-bold text-gray-800">{resource.title}</h2>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex-shrink-0 bg-black flex items-center justify-center min-h-[200px] xl:h-1/2">
                {renderPlayer()}
            </div>
            <div className="flex-shrink-0 border-b border-gray-200">
                <nav className="flex space-x-2 p-2">
                    <button onClick={() => setActiveTab('summary')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'summary' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>AI Summary</button>
                    <button onClick={() => setActiveTab('transcript')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'transcript' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Transcript</button>
                </nav>
            </div>
             <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'summary' && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">AI-Generated Summary</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{resource.summary || "No summary available for this resource."}</p>
                    </div>
                )}
                 {activeTab === 'transcript' && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Transcript</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{resource.transcript || "No transcript available for this resource."}</p>
                    </div>
                )}
            </div>
        </div>
        <div className="w-full xl:w-2/5 xl:border-l border-t xl:border-t-0 border-gray-200 flex flex-col h-full">
             <Chat 
                chatTitle={`AI Assistant for: ${resource.title}`} 
                systemPrompt={mediaSystemPrompt} 
                user={user}
                ragContext={{ courseCode, resourceId: resource.id }}
                contextType='media_assistant'
                courseCode={courseCode}
                lessonId={lessonId}
                resourceId={resource.id}
            />
        </div>
      </div>
    </div>
  );
};