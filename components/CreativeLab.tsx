import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { DocumentIcon } from './Icons';

export const CreativeLab: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfPrompt, setPdfPrompt] = useState('');
    const [pdfAnalysisResult, setPdfAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setPdfFile(event.target.files[0]);
        }
    };

    const handleAnalyzePdf = async () => {
        if (!pdfFile || !pdfPrompt.trim()) {
            setPdfAnalysisResult('Please upload a PDF and enter a question.');
            return;
        }
        setIsAnalyzing(true);
        setPdfAnalysisResult('');
        try {
            const result = await geminiService.analyzePdf(pdfFile, pdfPrompt);
            setPdfAnalysisResult(result.text);
        } catch (error) {
            setPdfAnalysisResult('An error occurred during analysis.');
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <div className="p-4 bg-white text-gray-800 h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">AI Creative Lab</h2>
            <div className="space-y-6">
                 {/* Document Analysis */}
                <div>
                    <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                        <DocumentIcon className="w-5 h-5" />
                        Document Analysis (PDF)
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <div className="mb-4">
                             <label className="text-sm text-gray-500 block mb-2">Upload a PDF file:</label>
                             <input 
                                type="file" 
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <textarea 
                            className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm" 
                            rows={3} 
                            placeholder="Ask a question about the PDF content..."
                            value={pdfPrompt}
                            onChange={(e) => setPdfPrompt(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-2">
                            <button 
                                onClick={handleAnalyzePdf}
                                disabled={isAnalyzing}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-semibold"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze PDF'}
                            </button>
                        </div>
                        {pdfAnalysisResult && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                <h4 className="font-semibold text-gray-900 mb-2">Analysis Result:</h4>
                                <p className="whitespace-pre-wrap">{pdfAnalysisResult}</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Image Generation */}
                <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Image Generation (imagen-4.0)</h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <textarea className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm" rows={2} placeholder="Enter a prompt, e.g., 'A robot holding a red skateboard'"></textarea>
                        <div className="flex justify-between items-center mt-2">
                             <select className="bg-white border border-gray-300 rounded-md p-2 text-sm">
                                <option>1:1</option>
                                <option>16:9</option>
                                <option>9:16</option>
                             </select>
                             <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold">Generate Image</button>
                        </div>
                    </div>
                </div>

                {/* Video Generation */}
                 <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Video Generation (Veo)</h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-4">
                        <textarea className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm" rows={2} placeholder="Enter a prompt for video generation..."></textarea>
                         <div>
                            <label className="text-sm text-gray-500 block mb-2">Or upload an image to start:</label>
                            <input type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                             <select className="bg-white border border-gray-300 rounded-md p-2 text-sm">
                                <option>16:9 (Landscape)</option>
                                <option>9:16 (Portrait)</option>
                             </select>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold">Generate Video</button>
                        </div>
                    </div>
                </div>

                {/* Content Analysis */}
                <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Content Analyzer (Image/Video)</h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <input type="file" className="text-sm w-full mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        <textarea className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm" rows={2} placeholder="Ask a question about the uploaded content..."></textarea>
                        <div className="flex justify-end mt-2">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold">Analyze</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};