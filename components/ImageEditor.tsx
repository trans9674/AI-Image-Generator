
import React, { useState, useMemo, useEffect } from 'react';

interface ImageEditorProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, isOpen, onClose }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFilters(INITIAL_FILTERS); // Reset filters when modal opens
    }
  }, [isOpen]);

  const filterStyle = useMemo(() => {
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%)`,
    };
  }, [filters]);

  const handleSliderChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: parseInt(value, 10) }));
  };
  
  const applyPreset = (preset: Partial<typeof filters>) => {
    setFilters({ ...INITIAL_FILTERS, ...preset });
  }

  const handleDownload = () => {
    if (!imageUrl) return;
    setIsDownloading(true);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDownloading(false);
        return;
      }
      
      ctx.filter = filterStyle.filter;
      ctx.drawImage(image, 0, 0);

      const link = document.createElement('a');
      link.download = 'edited-image.jpeg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsDownloading(false);
      onClose();
    };
    image.onerror = () => {
        alert("Could not load image for editing. Please try downloading the original instead.");
        setIsDownloading(false);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-6 bg-black/20 overflow-hidden">
          <img
            src={imageUrl}
            alt="Image preview for editing"
            className="max-w-full max-h-full object-contain"
            style={filterStyle}
          />
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 bg-gray-800/50 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white text-center">Edit Image</h2>
          
          {/* Adjustments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-2">Adjustments</h3>
            <div>
              <label htmlFor="brightness" className="block text-sm font-medium text-gray-400">Brightness: {filters.brightness}%</label>
              <input id="brightness" type="range" min="0" max="200" value={filters.brightness} onChange={e => handleSliderChange('brightness', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>
            <div>
              <label htmlFor="contrast" className="block text-sm font-medium text-gray-400">Contrast: {filters.contrast}%</label>
              <input id="contrast" type="range" min="0" max="200" value={filters.contrast} onChange={e => handleSliderChange('contrast', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>
            <div>
              <label htmlFor="saturate" className="block text-sm font-medium text-gray-400">Saturation: {filters.saturate}%</label>
              <input id="saturate" type="range" min="0" max="200" value={filters.saturate} onChange={e => handleSliderChange('saturate', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>
          </div>
          
          {/* Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-2 mb-3">Filters</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyPreset({ grayscale: 100 })} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Grayscale</button>
                <button onClick={() => applyPreset({ sepia: 100 })} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Sepia</button>
                <button onClick={() => applyPreset({ invert: 100 })} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Invert</button>
                <button onClick={() => setFilters(INITIAL_FILTERS)} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 transition-colors">Reset All</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-grow flex flex-col justify-end pt-4 space-y-3">
             <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-wait"
            >
              {isDownloading ? 'Processing...' : 'Save & Download'}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
