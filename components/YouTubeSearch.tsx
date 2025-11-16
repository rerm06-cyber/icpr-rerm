import React, { useState } from 'react';
import { YouTubeIcon } from './Icons';

interface YouTubeSearchProps {
    onAddVideo: (video: { id: string, title: string, description: string }) => void;
    onCancel: () => void;
}

const mockYouTubeResults = [
    { id: 'dQw4w9WgXcQ', title: 'Henri Fayol\'s 14 Principles of Management', description: 'A classic explanation of Fayol\'s contributions to management theory.', duration: '10:32' },
    { id: 'OqVsxegRh_M', title: 'Scientific Management - Frederick Taylor', description: 'Understanding the core ideas of Taylorism and efficiency.', duration: '8:15' },
    { id: 'p3nsoZlA44g', title: 'Management Theory Mashup', description: 'Comparing Fayol, Taylor, and Mayo in one comprehensive video.', duration: '15:01' },
];


export const YouTubeSearch: React.FC<YouTubeSearchProps> = ({ onAddVideo, onCancel }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoading(true);
        // In a real app, this would be a call to the YouTube Data API v3
        setTimeout(() => {
            setResults(mockYouTubeResults);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 animate-fadeInUp col-span-1 sm:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <YouTubeIcon className="w-5 h-5 text-red-600"/>
                Add Resource from YouTube
            </h4>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a video..."
                    className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold">
                    {isLoading ? '...' : 'Search'}
                </button>
            </form>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map(video => (
                    <div key={video.id} className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200">
                        <img src={`https://i.ytimg.com/vi/${video.id}/default.jpg`} alt={video.title} className="w-16 h-12 object-cover rounded"/>
                        <div className="flex-1">
                            <p className="text-sm font-semibold line-clamp-1">{video.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{video.description}</p>
                        </div>
                        <button onClick={() => onAddVideo(video)} className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            Add
                        </button>
                    </div>
                ))}
            </div>
             <div className="flex justify-end mt-4">
                <button type="button" onClick={onCancel} className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md text-sm border border-gray-300">
                    Close
                </button>
            </div>
        </div>
    );
};
