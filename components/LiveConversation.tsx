import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as geminiService from '../services/geminiService';
import { MicIcon } from './Icons';
// FIX: Import LiveSession from local types definition instead of @google/genai, as it's not an exported member.
import type { TranscriptionEntry, LiveSession } from '../types';

export const LiveConversation: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);

    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const stopConversation = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if(scriptProcessorRef.current){
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
           audioContextRef.current = null;
        }
        setIsActive(false);
        setIsConnecting(false);
        console.log('Conversation stopped and resources released.');
    }, []);

    const startConversation = async () => {
        if (isActive || isConnecting) return;
        
        setIsConnecting(true);
        setError(null);
        setTranscription([]);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser.');
            }
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const { session, audioContext, scriptProcessor } = await geminiService.connectLive({
                onTranscriptionUpdate: (entry) => {
                    setTranscription(prev => [...prev, entry]);
                }
            });

            sessionRef.current = session;
            audioContextRef.current = audioContext;
            scriptProcessorRef.current = scriptProcessor;

            const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            setIsActive(true);
        } catch (err) {
            console.error('Error starting conversation:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            stopConversation();
        } finally {
            setIsConnecting(false);
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return (
        <div className="p-4 h-full flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Conversation Practice</h2>
            <div className="w-full max-w-lg h-64 bg-white rounded-lg p-4 overflow-y-auto mb-4 border border-gray-200 shadow-sm">
                {transcription.map((entry, index) => (
                    <div key={index} className={`mb-2 text-sm ${entry.speaker === 'user' ? 'text-blue-700' : 'text-gray-700'}`}>
                        <span className="font-bold capitalize">{entry.speaker}: </span>
                        {entry.text}
                    </div>
                ))}
                 {transcription.length === 0 && !error && <p className="text-gray-500 text-sm">Transcription will appear here...</p>}
            </div>
            {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>}
            <button
                onClick={isActive ? stopConversation : startConversation}
                disabled={isConnecting}
                className={`flex items-center justify-center w-20 h-20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500
                    ${isConnecting ? 'bg-yellow-500 cursor-wait' : ''}
                    ${isActive ? 'bg-red-600 hover:bg-red-500' : ''}
                    ${!isActive && !isConnecting ? 'bg-blue-600 hover:bg-blue-500' : ''}
                `}
            >
                <MicIcon className="w-8 h-8 text-white" />
            </button>
            <p className="text-sm text-gray-500 mt-4 h-5">
                {isConnecting ? 'Connecting...' : (isActive ? 'Conversation active. Click to stop.' : 'Click to start conversation.')}
            </p>
        </div>
    );
};