import React, { useState, useRef } from 'react';
import { analyzeContent, deepThinkQuery, mapsQuery } from '../services/geminiService';

interface AIToolsProps {
  onBack: () => void;
}

type ToolType = 'ANALYSIS' | 'THINKING' | 'MAPS';

const AITools: React.FC<AIToolsProps> = ({ onBack }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('ANALYSIS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetState = () => {
      setResult(null);
      setPrompt('');
      setFile(null);
      setLoading(false);
  };

  const handleToolChange = (tool: ToolType) => {
      setActiveTool(tool);
      resetState();
  };

  const executeTool = async () => {
    setLoading(true);
    setResult(null);
    try {
        let res;
        switch (activeTool) {
            case 'ANALYSIS':
                if (file) {
                    res = await analyzeContent(file, prompt || "Analyze this content");
                    setResult({ type: 'text', data: res });
                }
                break;
            case 'THINKING':
                if (prompt) {
                    res = await deepThinkQuery(prompt);
                    setResult({ type: 'text', data: res });
                }
                break;
            case 'MAPS':
                if (prompt) {
                    // Try to get location
                    let loc = undefined;
                    if (navigator.geolocation) {
                        try {
                            const pos: any = await new Promise((resolve, reject) => 
                                navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000}));
                            loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        } catch (e) {
                            console.log("Loc unavailable");
                        }
                    }
                    res = await mapsQuery(prompt, loc);
                    setResult({ type: 'maps', data: res });
                }
                break;
        }
    } catch (e: any) {
        alert("Error: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-indigo-600 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Travel Toolkit</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
              {[
                  { id: 'ANALYSIS', label: 'Visual Scout', icon: '👁️', desc: 'Analyze landmarks/videos' },
                  { id: 'THINKING', label: 'Deep Planner', icon: '🧠', desc: 'Complex reasoning' },
                  { id: 'MAPS', label: 'Local Guide', icon: '🗺️', desc: 'Real-time places info' },
              ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolChange(tool.id as ToolType)}
                    className={`w-full text-left p-4 rounded-xl transition flex items-center ${activeTool === tool.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                      <span className="text-2xl mr-3">{tool.icon}</span>
                      <div>
                          <div className="font-bold">{tool.label}</div>
                          <div className={`text-xs ${activeTool === tool.id ? 'text-indigo-200' : 'text-gray-400'}`}>{tool.desc}</div>
                      </div>
                  </button>
              ))}
          </div>

          {/* Main Area */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[500px]">
              
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {activeTool === 'ANALYSIS' && "Visual Intelligence (Gemini 3 Pro)"}
                  {activeTool === 'THINKING' && "Deep Reasoning Engine (Gemini 3 Pro)"}
                  {activeTool === 'MAPS' && "Live Maps Grounding (Gemini 2.5 Flash)"}
              </h2>

              <div className="space-y-6">
                  {/* File Upload Section */}
                  {activeTool === 'ANALYSIS' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*,video/*" 
                            className="hidden" 
                          />
                          <div className="mx-auto h-10 w-10 text-gray-400 mb-2">
                             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <p className="text-sm text-gray-600">
                              {file ? file.name : 'Upload Image or Video'}
                          </p>
                      </div>
                  )}

                  {/* Inputs */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          {activeTool === 'ANALYSIS' ? 'What should we look for?' :
                           activeTool === 'THINKING' ? 'Ask a complex travel question' : 'Search for places'}
                      </label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-4 border border-black bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows={activeTool === 'THINKING' ? 6 : 3}
                        placeholder={activeTool === 'ANALYSIS' ? "Describe this landmark..." : "..."}
                      />
                  </div>

                  <button 
                    onClick={executeTool}
                    disabled={loading || (!prompt && activeTool !== 'ANALYSIS') || (!file && activeTool === 'ANALYSIS')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-bold shadow-md w-full disabled:opacity-50"
                  >
                      {loading ? 'Processing with Gemini...' : 'Generate / Analyze'}
                  </button>

                  {/* Results */}
                  {result && (
                      <div className="mt-8 border-t pt-8 animate-fade-in">
                          <h3 className="text-lg font-bold mb-4">Result</h3>
                          
                          {result.type === 'text' && (
                              <div className="bg-gray-50 p-6 rounded-xl whitespace-pre-wrap font-mono text-sm border">
                                  {result.data}
                              </div>
                          )}
                          
                           {result.type === 'maps' && (
                              <div>
                                  <div className="bg-gray-50 p-6 rounded-xl whitespace-pre-wrap mb-4 text-sm border">
                                      {result.data.text}
                                  </div>
                                  <h4 className="font-bold text-sm text-gray-600 mb-2">Sources Found:</h4>
                                  <div className="grid grid-cols-1 gap-2">
                                    {result.data.chunks.map((chunk: any, i: number) => {
                                        if (chunk.maps?.title) {
                                           return (
                                               <a key={i} href={chunk.maps.googleMapsUri || chunk.maps.uri} target="_blank" rel="noreferrer" className="block bg-white p-3 rounded shadow hover:shadow-md border border-indigo-100">
                                                   <div className="font-bold text-indigo-600">{chunk.maps.title}</div>
                                                   <div className="text-xs text-gray-500">{chunk.maps.formattedAddress}</div>
                                                   {chunk.maps.rating && <div className="text-xs text-yellow-500">★ {chunk.maps.rating}</div>}
                                               </a>
                                           )
                                        }
                                        return null;
                                    })}
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AITools;