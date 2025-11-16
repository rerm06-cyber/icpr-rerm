import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Modality, LiveServerMessage, Blob } from "@google/genai";
import type { GroundingSource, TranscriptionEntry, LiveSession, RagContext, Resource } from '../types';

// Initialize the Gemini client. It will automatically use the API_KEY from the environment
// as per the platform's requirements.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const fileToGenerativePart = async (file: File) => {
  const base64encodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: base64encodedData, mimeType: file.type },
  };
};


async function getOrCreateFileSearchStore(courseCode: string): Promise<string> {
    const storeName = `fileSearchStores/course-${courseCode.toLowerCase()}-store`;
    try {
        // Attempt to get the store.
        await ai.fileSearchStores.get({ name: storeName });
        console.log(`[File Search] Found existing store: ${storeName}`);
        return storeName;
    } catch (error: any) {
        if (error.message.includes('not found')) {
            // If not found, create it.
            console.log(`[File Search] Store not found, creating new store: ${storeName}`);
            const newStore = await ai.fileSearchStores.create({
                config: { displayName: `Course Store for ${courseCode}` }
            });
            return newStore.name;
        }
        // Re-throw other errors.
        throw new Error(`[File Search] Failed to get or create store: ${error.message}`);
    }
}


export async function processResourceForRag(file: File, courseCode: string, resourceId: string): Promise<Partial<Resource> & { error?: string }> {
  try {
    console.log(`[RAG Pipeline] Starting processing for resource ${resourceId}`);
    
    // Step 1: Get or create the course-specific File Search Store.
    const storeName = await getOrCreateFileSearchStore(courseCode);
    
    // Step 2: Upload the file directly to the store.
    console.log(`[RAG Pipeline] Uploading '${file.name}' to store '${storeName}'...`);
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
        file: file, // Using the File object directly
        fileSearchStoreName: storeName,
        config: {
            displayName: file.name,
            // You can add chunking config here if needed.
            customMetadata: [
                { key: "course_code", stringValue: courseCode },
                { key: "resource_id", stringValue: resourceId }
            ]
        }
    });

    // Step 3: Wait for the import operation to complete by polling.
    console.log(`[RAG Pipeline] Waiting for operation to complete...`);
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        operation = await ai.operations.get({ operation });
    }

    if (operation.error) {
        throw new Error(`[RAG Pipeline] File import failed: ${operation.error.message}`);
    }
    
    // FIX: The response from a completed upload operation contains an 'importedFiles'
    // array. Each object in the array has a 'file' property holding the resource name.
    // Cast to `any` to fix a potential type issue with the SDK where `importedFiles` is not recognized on the response.
    const importedFile = (operation.response as any)?.importedFiles?.[0];
    if (!importedFile?.file) {
        throw new Error('[RAG Pipeline] File import succeeded but did not return a file name.');
    }
    const gemini_file_id = importedFile.file; // The name of the created File resource.
    
    // Step 4: Generate Summary and Transcript with Gemini.
    const model = ai.models.generateContent;
    const content = await file.text(); // Get text for analysis.
    
    const summaryPrompt = `Generate a concise, one-paragraph summary of the following content:\n\n---\n${content.substring(0, 8000)}\n---`;
    const transcriptPrompt = `Provide a clean transcript of the following content. If it's a document, return the text as is. If it's audio/video, assume this is a transcript and clean it up:\n\n---\n${content.substring(0, 8000)}\n---`;
    
    const [summaryResponse, transcriptResponse] = await Promise.all([
      model({ model: 'gemini-2.5-flash', contents: summaryPrompt }),
      model({ model: 'gemini-2.5-flash', contents: transcriptPrompt }),
    ]);

    console.log(`[RAG Pipeline] Processing complete for resource ${resourceId}`);
    
    return {
        gemini_file_id: gemini_file_id,
        gemini_store_id: storeName,
        summary: summaryResponse.text,
        transcript: transcriptResponse.text,
    };
  } catch (error: any) {
      console.error("[RAG Pipeline] Error processing resource:", error);
      return {
          error: `Failed to process the resource for AI analysis. Reason: ${error.message}`
      }
  }
}

export async function generateContent(prompt: string, systemInstruction: string, ragContext?: RagContext): Promise<{ text: string, sources?: GroundingSource[] }> {
  try {
    let augmentedPrompt = `${systemInstruction}\n\nUser question: "${prompt}"`;
    const config: any = { tools: [] };
    
    if (ragContext?.courseCode) {
        const storeName = `fileSearchStores/course-${ragContext.courseCode.toLowerCase()}-store`;
        const fileSearchTool: any = {
            fileSearch: {
                fileSearchStoreNames: [storeName],
            }
        };

        // If a specific resource is targeted, use metadata filtering.
        if (ragContext.resourceId) {
            fileSearchTool.fileSearch.metadataFilter = `resource_id="${ragContext.resourceId}"`;
             augmentedPrompt = `
                ${systemInstruction}
                
                You MUST answer the user's question based ONLY on the context from the specific file they are viewing.
                
                User question: "${prompt}"
             `;
        } else {
             augmentedPrompt = `
                ${systemInstruction}
                
                You MUST answer the user's question based ONLY on the context retrieved from the course materials. If the information is not in the provided context, you MUST explicitly say that the answer is not found in the course materials.
                
                User question: "${prompt}"
             `;
        }

        config.tools.push(fileSearchTool);
    } else {
        // Only add Google Search tool if not in a specific course context.
        config.tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: augmentedPrompt,
        config: config,
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    // Adapt to the actual structure of grounding chunks from File Search vs. Web Search.
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.file) {
            return {
                title: chunk.file.displayName || `Resource: ${chunk.file.name}`,
                uri: `#`, // Internal resource, no external URI.
            };
        }
        if (chunk.web) {
            return {
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri || '#',
            };
        }
        return null;
    }).filter(Boolean) as GroundingSource[] || [];
    
    return { text: response.text, sources };
  } catch (error: any) {
      console.error("Error in generateContent:", error);
      if (error.message.includes('SAFETY')) {
          throw new Error("The response was blocked due to safety settings. Please modify your prompt.");
      }
      throw new Error("The AI is currently unavailable. Please try again later.");
  }
}

export async function analyzeFileForMetadata(file: File): Promise<{ title: string; description: string }> {
  try {
    const prompt = `Analyze the following file content and generate a suitable title and a brief, one-sentence description for it as a course resource.
    
    Filename: ${file.name}
    Content (first 2000 characters):
    ---
    ${await file.text().then(t => t.substring(0, 2000))}
    ---
    
    Return your response as a JSON object with two keys: "title" and "description".`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    
    const jsonString = response.text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonString);
    
    return {
        title: result.title || `Title for ${file.name}`,
        description: result.description || 'A new course resource.'
    };
  } catch(error: any) {
      console.error("Error in analyzeFileForMetadata:", error);
      throw new Error("AI analysis failed. Please provide details manually.");
  }
}

export async function analyzePdf(file: File, prompt: string): Promise<{ text: string }> {
  try {
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // A model that supports multimodal input
        contents: { parts: [imagePart, {text: prompt}] }
    });
    return { text: response.text };
  } catch (error: any) {
      console.error("Error analyzing PDF:", error);
      throw new Error("Failed to analyze the PDF. Please ensure it's a valid file.");
  }
}

// --- Live Conversation Helpers ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


export async function connectLive({ onTranscriptionUpdate }: { onTranscriptionUpdate: (entry: TranscriptionEntry) => void }): Promise<{ session: LiveSession; audioContext: AudioContext, scriptProcessor: ScriptProcessorNode }> {
  let nextStartTime = 0;
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);
  const sources = new Set<AudioBufferSourceNode>();
  
  const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        console.log('Live session opened.');
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription?.text) {
          onTranscriptionUpdate({ speaker: 'model', text: message.serverContent.outputTranscription.text });
        }
        if (message.serverContent?.inputTranscription?.text) {
           onTranscriptionUpdate({ speaker: 'user', text: message.serverContent.inputTranscription.text });
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.addEventListener('ended', () => { sources.delete(source); });
            source.start(nextStartTime);
            nextStartTime = nextStartTime + audioBuffer.duration;
            sources.add(source);
        }

        if (message.serverContent?.interrupted) {
            for (const source of sources.values()) {
                source.stop();
                sources.delete(source);
            }
            nextStartTime = 0;
        }
      },
      onerror: (e: ErrorEvent) => {
        console.error('Live session error:', e);
      },
      onclose: (e: CloseEvent) => {
        console.log('Live session closed.');
      },
    },
    config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
    },
  });

  const session = await sessionPromise;
  return { session, audioContext: inputAudioContext, scriptProcessor };
}
