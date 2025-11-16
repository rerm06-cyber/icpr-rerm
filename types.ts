// FIX: Define GroundingSource locally as it's not exported from @google/genai.
export interface GroundingSource {
  uri: string;
  title?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type ResourceStatus = 'processing' | 'processed' | 'failed';

export type ResourceKind = 'video' | 'audio' | 'pdf' | 'document' | 'image' | 'presentation' | 'youtube_video' | 'link';

export interface Resource {
  id: string; // UUID
  course_code: string;
  lesson_id: string;
  title: string;
  description: string;
  kind: ResourceKind; 
  storage_path?: string;
  public_url: string;
  gemini_file_id?: string;
  gemini_store_id?: string;
  status: ResourceStatus;
  summary?: string;
  transcript?: string;
}

export interface Lesson {
  id:string;
  title: string;
  week: number;
  objective: string;
  keyConcepts: string[];
  tutorAvatar: {
    name: string;
    systemPrompt: string;
  };
  hasLiveConversation?: boolean;
  tasks?: Task[];
  resources?: Resource[];
  // FIX: Add optional preLab property to support pre-lesson materials.
  preLab?: {
    videoUrl?: string;
    audioUrl?: string;
    presentationUrl?: string;
    notebookLMUrl?: string;
  };
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  title: string;
  weeks: string;
  units: Unit[];
}

export interface Course {
  code: string;
  title: string;
  description: string;
  credits: number;
  modules: Module[];
  term: number;
  prerequisites?: string[];
  // New properties for Admin Course Builder
  colorPalette?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  backgroundImageUrl?: string;
}

// Type for the selection in Admin/Professor views
export type SelectedItem = 
  | { type: 'course'; id: string }
  | { type: 'module'; id: string }
  | { type: 'unit'; id: string }
  | { type: 'lesson'; id: string };


export interface RagContext {
    courseCode?: string;
    resourceId?: string;
}

// Corresponds to the chat_sessions table
export interface ChatSession {
  id: string; // UUID
  user_id: string; // For this app, a static ID based on role
  course_code?: string;
  lesson_id?: string;
  resource_id?: string;
  context_type: 'program_assistant' | 'course_tutor' | 'media_assistant';
  created_at: string; // ISO 8601 timestamp
}

// Corresponds to the chat_messages table
export interface ChatMessage {
  id?: string; // UUID, optional before insertion
  session_id: string;
  sender: 'user' | 'model' | 'system';
  content: string;
  sources?: GroundingSource[];
  is_error?: boolean;
  attachment_url?: string;
  attachment_type?: string;
  created_at?: string; // ISO 8601 timestamp
}


// FIX: Define a local LiveSession interface since it's not exported from @google/genai.
export interface LiveSession {
  close: () => void;
  sendRealtimeInput: (request: any) => void;
  sendToolResponse: (request: any) => void;
}

export interface TranscriptionEntry {
  speaker: 'user' | 'model';
  text: string;
}

export interface ProgressData {
  [courseCode: string]: {
    started: boolean;
    viewedLessons: Set<string>;
  };
}

export interface User {
    name: string;
    role: 'student' | 'professor' | 'admin';
}