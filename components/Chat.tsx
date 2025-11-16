import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, RagContext, User, ChatSession } from '../types';
import * as geminiService from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { SendIcon, BotIcon, UserIcon, LinkIcon } from './Icons';

interface ChatProps {
  systemPrompt: string;
  chatTitle: string;
  user: User;
  ragContext: RagContext;
  contextType: ChatSession['context_type'];
  courseCode?: string;
  lessonId?: string;
  resourceId?: string;
}

export const Chat: React.FC<ChatProps> = (props) => {
  const { systemPrompt, chatTitle, user, ragContext, contextType, courseCode, lessonId, resourceId } = props;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      setMessages([]); // Clear previous messages
      
      const { data: sessionData, error: sessionError } = await supabase.rpc('get_or_create_chat_session', {
          p_user_id: user.role, // Using role as a stable user ID in this demo
          p_context_type: contextType,
          p_course_code: courseCode,
          p_lesson_id: lessonId,
          p_resource_id: resourceId,
      });

      if (sessionError || !sessionData) {
          console.error("Error getting or creating chat session:", sessionError);
          const errorMessage: ChatMessage = {
              session_id: 'error-session',
              sender: 'system',
              content: "Could not load chat session. Please try again later.",
              is_error: true,
          };
          setMessages([errorMessage]);
          setIsLoading(false);
          return;
      }
      
      const currentSession = sessionData as ChatSession;
      setSession(currentSession);

      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', currentSession.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        const errorMessage: ChatMessage = {
            session_id: currentSession.id,
            sender: 'system',
            content: "Could not load chat history.",
            is_error: true,
        };
        setMessages([errorMessage]);
      } else {
        setMessages(messagesData || []);
      }
      setIsLoading(false);
    };

    initializeChat();
  // We want this effect to re-run whenever the chat context changes.
  }, [user.role, contextType, courseCode, lessonId, resourceId]);


  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !session) return;

    const userMessage: ChatMessage = { 
        session_id: session.id,
        sender: 'user', 
        content: input,
    };
    
    // Optimistic UI update
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // Persist user message
        const { error: insertError } = await supabase.from('chat_messages').insert(userMessage);
        if (insertError) throw insertError;

        const modelResponse = await geminiService.generateContent(input, systemPrompt, ragContext);
      
        const modelMessage: ChatMessage = { 
            session_id: session.id,
            sender: 'model', 
            content: modelResponse.text,
            sources: modelResponse.sources,
            is_error: false,
        };
        setMessages(prev => [...prev, modelMessage]);
        await supabase.from('chat_messages').insert(modelMessage);

    } catch (error: any) {
        console.error("Error during message sending:", error);
        const errorMessage: ChatMessage = { 
            session_id: session.id,
            sender: 'model',
            content: error.message || "Sorry, I encountered an error. Please try again.",
            is_error: true
        };
        setMessages(prev => [...prev, errorMessage]);
        // Persist the error message so the user knows something went wrong
        await supabase.from('chat_messages').insert(errorMessage);

    } finally {
        setIsLoading(false);
    }
  }, [input, isLoading, systemPrompt, session, ragContext]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{chatTitle}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'model' && <BotIcon className="w-6 h-6 flex-shrink-0 text-blue-500 mt-1" />}
            <div className={`p-3 rounded-lg max-w-lg ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' 
                : msg.is_error ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'}`
            }>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></p>
              {msg.sources && msg.sources.length > 0 && (
                 <div className="mt-3 border-t border-gray-200 pt-2">
                    <h4 className="text-xs font-bold text-gray-500 mb-1">Sources:</h4>
                    <div className="space-y-1">
                        {msg.sources.map((source, i) => (
                           <div key={i} className="flex items-center gap-2 text-xs text-blue-600">
                                <LinkIcon className="w-3 h-3"/>
                                <span>{source.title}</span>
                            </div>
                        ))}
                    </div>
                 </div>
              )}
            </div>
            {msg.sender === 'user' && <UserIcon className="w-6 h-6 flex-shrink-0 bg-gray-200 text-gray-600 rounded-full p-1 mt-1" />}
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
            <div className="flex items-start gap-3">
                <BotIcon className="w-6 h-6 flex-shrink-0 text-blue-500 mt-1" />
                <div className="p-3 rounded-lg bg-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent p-3 text-sm focus:outline-none"
            disabled={isLoading || !session}
          />
          <button onClick={handleSendMessage} disabled={isLoading || !session || !input.trim()} className="p-3 text-gray-400 hover:text-blue-600 disabled:text-gray-300 disabled:hover:text-gray-300">
            <SendIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};
