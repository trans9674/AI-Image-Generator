
import React, { useState, useCallback } from 'react';
import { generateImage } from './services/geminiService';
import Spinner from './components/Spinner';
import SparklesIcon from './components/icons/SparklesIcon';
import EditIcon from './components/icons/EditIcon';
import ImageEditor from './components/ImageEditor';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const aspectRatios: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-image.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              AI Image Generator
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              Powered by Imagen on Gemini
            </p>
          </header>

          <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Control Panel */}
              <div className="flex-1 lg:max-w-md">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-gray-300">
                      Describe your vision
                    </label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A photo of an astronaut riding a horse on Mars, cinematic lighting."
                      className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none text-gray-200 placeholder-gray-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-3 text-gray-300">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {aspectRatios.map((ar) => (
                        <button
                          key={ar}
                          onClick={() => setAspectRatio(ar)}
                          className={`py-2 px-1 text-sm font-medium rounded-md transition-all duration-200 ${
                            aspectRatio === ar
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                          disabled={isLoading}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Image Display */}
              <div className="flex-1 flex flex-col justify-center items-center bg-gray-900/50 p-4 rounded-lg border-2 border-dashed border-gray-700 min-h-[300px] lg:min-h-0">
                {error && (
                  <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">
                    <p className="font-semibold">Generation Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}
                {!error && isLoading && <Spinner />}
                {!error && !isLoading && !generatedImage && (
                  <div className="text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-2 text-lg">Your generated image will appear here.</p>
                  </div>
                )}
                {generatedImage && (
                  <div className="relative group w-full h-full flex justify-center items-center">
                    <img
                      src={generatedImage}
                      alt="Generated by AI"
                      className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/60 flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                      <button
                        onClick={() => setIsEditorOpen(true)}
                        className="bg-white/90 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white transition-colors"
                        title="Edit Image"
                      >
                        <EditIcon className="h-5 w-5" />
                        Edit
                      </button>
                      <button
                        onClick={handleDownload}
                        className="bg-white/90 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white transition-colors"
                        title="Download Original"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <ImageEditor 
        imageUrl={generatedImage}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </>
  );
};

export default App;
