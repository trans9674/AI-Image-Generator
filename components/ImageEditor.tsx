import React, { useState, useMemo, useEffect, useRef } from 'react';
import CropIcon from './icons/CropIcon';
import RotateIcon from './icons/RotateIcon';
import FlipHorizontalIcon from './icons/FlipHorizontalIcon';
import FlipVerticalIcon from './icons/FlipVerticalIcon';

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

const INITIAL_TRANSFORMS = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, isOpen, onClose }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [transforms, setTransforms] = useState(INITIAL_TRANSFORMS);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [appliedCrop, setAppliedCrop] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [startCropPosition, setStartCropPosition] = useState<{ x: number, y: number } | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      handleReset(); // Reset all settings when modal opens
    }
  }, [isOpen]);
  
  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setTransforms(INITIAL_TRANSFORMS);
    setAppliedCrop(null);
    setCrop(null);
    setIsCropping(false);
  }

  const combinedStyle = useMemo(() => {
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%)`,
      transform: `rotate(${transforms.rotation}deg) scaleX(${transforms.scaleX}) scaleY(${transforms.scaleY})`,
    };
  }, [filters, transforms]);

  const handleSliderChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: parseInt(value, 10) }));
  };
  
  const applyPreset = (preset: Partial<typeof filters>) => {
    setFilters({ ...INITIAL_FILTERS, ...preset });
  }

  const handleRotate = () => {
    setTransforms(prev => ({...prev, rotation: (prev.rotation + 90) % 360 }));
  }
  
  const handleFlipHorizontal = () => {
    setTransforms(prev => ({ ...prev, scaleX: prev.scaleX * -1 }));
  }

  const handleFlipVertical = () => {
    setTransforms(prev => ({ ...prev, scaleY: prev.scaleY * -1 }));
  }

  const handleDownload = () => {
    if (!imageUrl) return;
    setIsDownloading(true);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDownloading(false);
        return;
      }
      
      const displayImage = imageContainerRef.current?.querySelector('img');
      if (!displayImage) {
          setIsDownloading(false);
          return;
      }

      const scaleX = image.naturalWidth / displayImage.width;
      const scaleY = image.naturalHeight / displayImage.height;

      let sourceX = 0, sourceY = 0, sourceWidth = image.naturalWidth, sourceHeight = image.naturalHeight;

      if (appliedCrop && appliedCrop.width > 0 && appliedCrop.height > 0) {
        sourceX = appliedCrop.x * scaleX;
        sourceY = appliedCrop.y * scaleY;
        sourceWidth = appliedCrop.width * scaleX;
        sourceHeight = appliedCrop.height * scaleY;
      }
      
      const rad = transforms.rotation * Math.PI / 180;
      const isSwapped = transforms.rotation % 180 !== 0;
      const canvasWidth = isSwapped ? sourceHeight : sourceWidth;
      const canvasHeight = isSwapped ? sourceWidth : sourceHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.filter = combinedStyle.filter.replace(/brightness\([^)]+\)/, ''); // Brightness is buggy on canvas, handled manually
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(transforms.scaleX, transforms.scaleY);
      
      // Manual brightness
      const brightnessValue = filters.brightness / 100;
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
      if (brightnessValue !== 1) {
          ctx.globalCompositeOperation = 'luminosity';
          ctx.fillStyle = `hsl(0, 0%, ${brightnessValue * 50}%)`;
          ctx.fillRect(-sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
      }
      ctx.restore();

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
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartCropPosition({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isCropping || !startCropPosition || !imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      const newCrop = {
          x: Math.min(startCropPosition.x, currentX),
          y: Math.min(startCropPosition.y, currentY),
          width: Math.abs(currentX - startCropPosition.x),
          height: Math.abs(currentY - startCropPosition.y),
      };
      setCrop(newCrop);
  };

  const handleMouseUp = () => {
      if (!isCropping) return;
      setStartCropPosition(null);
  };
  
  const handleApplyCrop = () => {
    if (crop && crop.width > 0 && crop.height > 0) {
        setAppliedCrop(crop);
    }
    setIsCropping(false);
  }

  const handleCancelCrop = () => {
    setIsCropping(false);
    setCrop(null);
  }

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Image Preview */}
        <div 
          className="relative flex-1 flex items-center justify-center p-6 bg-black/20 overflow-hidden"
          ref={imageContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt="Image preview for editing"
            className={`max-w-full max-h-full object-contain select-none transition-transform duration-300 ${isCropping ? 'cursor-crosshair' : ''}`}
            style={combinedStyle}
          />
           {crop && isCropping && (
            <div
              className="absolute border-2 border-dashed border-white"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 bg-gray-800/50 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white text-center">Edit Image</h2>
          
          {isCropping ? (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-gray-300 text-center">Draw a rectangle on the image to crop.</h3>
              <div className="grid grid-cols-2 gap-2 pt-4">
                  <button onClick={handleApplyCrop} className="px-4 py-2 text-sm bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">Apply Crop</button>
                  <button onClick={handleCancelCrop} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <>
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
            
            {/* Filters & Tools */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-2 mb-3">Filters & Tools</h3>
              <div className="grid grid-cols-4 gap-2">
                  <button title="Crop" onClick={() => setIsCropping(true)} className="p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"><CropIcon className="w-5 h-5" /></button>
                  <button title="Rotate" onClick={handleRotate} className="p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"><RotateIcon className="w-5 h-5" /></button>
                  <button title="Flip Horizontal" onClick={handleFlipHorizontal} className="p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"><FlipHorizontalIcon className="w-5 h-5" /></button>
                  <button title="Flip Vertical" onClick={handleFlipVertical} className="p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"><FlipVerticalIcon className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => applyPreset({ grayscale: 100 })} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Grayscale</button>
                  <button onClick={() => applyPreset({ sepia: 100 })} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Sepia</button>
                  <button onClick={() => applyPreset({ invert: 100 })} className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Invert</button>
                  <button onClick={handleReset} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 transition-colors">Reset All</button>
              </div>
            </div>
            </>
          )}

          {/* Actions */}
          <div className="flex-grow flex flex-col justify-end pt-4 space-y-3">
             <button
              onClick={handleDownload}
              disabled={isDownloading || isCropping}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
