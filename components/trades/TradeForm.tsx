import React, { useState, useEffect, useRef } from 'react';
import { Trade, TagGroup, TradeDirection } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { PlusCircleIcon, XMarkIcon, StarIcon, PhotoIcon } from '../ui/Icons';
import { uploadImage, deleteImage, validateImage, uploadMultipleImages, UploadProgress, UploadedImage } from '../../utils/imageUpload';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

interface TradeFormProps {
  onSubmit: (trade: Trade) => void;
  onCancel: () => void;
  initialTrade?: Trade;
  tagGroups: TagGroup[];
  tradeToEdit?: Trade | null;
}

const calculateTimeInTrade = (timeIn: string, timeOut: string): number => {
  try {
    // Parse HH:mm format
    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);
    
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    
    // Handle case where time out is on the next day
    let timeDiff = outTotalMinutes - inTotalMinutes;
    if (timeDiff < 0) {
      timeDiff += 24 * 60; // Add 24 hours worth of minutes
    }
    
    return timeDiff;
  } catch (error) {
    console.error('Error calculating time in trade:', error);
    return 0;
  }
};

const calculateProfit = (entry: number, exit: number, contracts: number, direction: TradeDirection): number => {
  const priceDiff = exit - entry;
  return direction === 'long' ? priceDiff * contracts : -priceDiff * contracts;
};

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onCancel, initialTrade, tagGroups, tradeToEdit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [symbol, setSymbol] = useState('');
  const [contracts, setContracts] = useState('');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [profit, setProfit] = useState('');
  const [journal, setJournal] = useState('');
  const [selectedTags, setSelectedTags] = useState<{ [groupId: string]: string[] }>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [screenshots, setScreenshots] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; x: number; y: number } | null>(null);

  // Use either tradeToEdit or initialTrade
  const tradeToLoad = tradeToEdit || initialTrade;

  useEffect(() => {
    if (tradeToLoad) {
      setDate(tradeToLoad.date);
      setDirection(tradeToLoad.direction);
      setSymbol(tradeToLoad.symbol);
      setContracts(tradeToLoad.contracts.toString());
      setEntry(tradeToLoad.entry.toString());
      setExit(tradeToLoad.exit.toString());
      setTimeIn(tradeToLoad.timeIn);
      setTimeOut(tradeToLoad.timeOut);
      setProfit(tradeToLoad.profit.toString());
      setJournal(tradeToLoad.journal);
      setIsFavorite(tradeToLoad.isFavorite);
      setScreenshots(tradeToLoad.screenshots);
      // Convert the tags object to our internal format
      const convertedTags = Object.entries(tradeToLoad.tags).reduce((acc, [groupId, subtagId]) => ({
        ...acc,
        [groupId]: [subtagId]
      }), {} as { [groupId: string]: string[] });
      setSelectedTags(convertedTags);
    } else {
      // Reset form for new trade
      setDate(new Date().toISOString().split('T')[0]);
      setDirection('long');
      setSymbol('');
      setContracts('');
      setEntry('');
      setExit('');
      setTimeIn('');
      setTimeOut('');
      setProfit('');
      setJournal('');
      setSelectedTags({});
      setIsFavorite(false);
      setScreenshots([]);
    }
  }, [tradeToLoad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure time values are in HH:mm format
    const formatTime = (time: string) => {
      if (time.includes('T')) {
        // If it's an ISO string, extract just the time part
        return new Date(time).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      return time;
    };

    const formattedTimeIn = formatTime(timeIn);
    const formattedTimeOut = formatTime(timeOut);
    
    // Calculate time in trade
    const timeInTrade = calculateTimeInTrade(formattedTimeIn, formattedTimeOut);
    
    const trade: Trade = {
      id: tradeToEdit?.id || crypto.randomUUID(),
      symbol: symbol.toUpperCase(),
      date,
      contracts: parseInt(contracts),
      entry: parseFloat(entry),
      exit: parseFloat(exit),
      timeIn: formattedTimeIn,
      timeOut: formattedTimeOut,
      profit: calculateProfit(parseFloat(entry), parseFloat(exit), parseInt(contracts), direction),
      tags: Object.entries(selectedTags).reduce((acc, [groupId, subtagIds]) => {
        if (subtagIds.length > 0) {
          acc[groupId] = subtagIds[0];
        }
        return acc;
      }, {} as { [tagGroupId: string]: string }),
      journal,
      direction,
      isFavorite,
      screenshots,
      timeInTrade
    };

    onSubmit(trade);
    onCancel();
  };

  const handleTagSelection = (groupId: string, subtagId: string) => {
    setSelectedTags(prev => {
      const currentTags = prev[groupId] || [];
      const newTags = currentTags.includes(subtagId)
        ? currentTags.filter(id => id !== subtagId)
        : [...currentTags, subtagId];
      
      return {
        ...prev,
        [groupId]: newTags
      };
    });
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate all files first
      for (let i = 0; i < files.length; i++) {
        const validation = validateImage(files[i]);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }

      const handleProgress = (progress: UploadProgress) => {
        setUploadProgress(prev => ({
          ...prev,
          [progress.fileName]: progress.progress
        }));
      };

      const uploadedImages = await uploadMultipleImages(Array.from(files), handleProgress);
      setScreenshots(prev => [...prev, ...uploadedImages]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveScreenshot = async (index: number) => {
    try {
      const screenshot = screenshots[index];
      await deleteImage(screenshot.url);
      setScreenshots(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      setUploadError('Failed to remove image');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(screenshots);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScreenshots(items);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate all files first
      for (const file of files) {
        const validation = validateImage(file);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }

      const handleProgress = (progress: UploadProgress) => {
        setUploadProgress(prev => ({
          ...prev,
          [progress.fileName]: progress.progress
        }));
      };

      const uploadedImages = await uploadMultipleImages(files, handleProgress);
      setScreenshots(prev => [...prev, ...uploadedImages]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageHover = (e: React.MouseEvent<HTMLImageElement>, url: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPreviewImage({
      url,
      x: rect.right + 10,
      y: rect.top
    });
  };

  const handleImageLeave = () => {
    setPreviewImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Direction</label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={direction === 'long' ? 'primary' : 'secondary'}
              onClick={() => setDirection('long')}
              className="flex-1"
            >
              Long
            </Button>
            <Button
              type="button"
              variant={direction === 'short' ? 'primary' : 'secondary'}
              onClick={() => setDirection('short')}
              className="flex-1"
            >
              Short
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
          <Input
            type="text"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            placeholder="e.g., AAPL"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Contracts</label>
          <Input
            type="number"
            value={contracts}
            onChange={e => setContracts(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price</label>
          <Input
            type="number"
            step="0.01"
            value={entry}
            onChange={e => setEntry(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Exit Price</label>
          <Input
            type="number"
            step="0.01"
            value={exit}
            onChange={e => setExit(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Time In</label>
          <Input
            type="time"
            value={timeIn}
            onChange={e => setTimeIn(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Time Out</label>
          <Input
            type="time"
            value={timeOut}
            onChange={e => setTimeOut(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {tagGroups.map(group => (
            <div key={group.id} className="bg-gray-700 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-purple-300 mb-2">{group.name}</h4>
              <div className="flex flex-wrap gap-2">
                {group.subtags.map(subtag => (
                  <button
                    key={subtag.id}
                    type="button"
                    onClick={() => handleTagSelection(group.id, subtag.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                      selectedTags[group.id]?.includes(subtag.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: subtag.color }}
                    />
                    <span>{subtag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Profit/Loss</label>
        <Input
          type="number"
          step="0.01"
          value={profit}
          onChange={e => setProfit(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Journal</label>
        <Textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Add any additional notes about the trade..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={e => setIsFavorite(e.target.checked)}
            className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-gray-300">Mark as Favorite</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Screenshots</label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            isUploading ? 'border-gray-300' : 'border-blue-500 hover:border-blue-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="screenshots" direction="horizontal">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-wrap gap-2 min-h-[100px]"
                >
                  {screenshots.map((screenshot, index) => (
                    <Draggable
                      key={screenshot.url}
                      draggableId={screenshot.url}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative group"
                        >
                          <img
                            src={screenshot.url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg cursor-move"
                            onMouseEnter={(e) => handleImageHover(e, screenshot.url)}
                            onMouseLeave={handleImageLeave}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Drag to reorder
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Image Preview */}
          {previewImage && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: `${previewImage.x}px`,
                top: `${previewImage.y}px`,
                transform: 'translateY(-50%)'
              }}
            >
              <div className="bg-white rounded-lg shadow-xl p-2">
                <img
                  src={previewImage.url}
                  alt="Preview"
                  className="max-w-[300px] max-h-[300px] object-contain rounded"
                />
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleScreenshotUpload}
              disabled={isUploading}
              className="hidden"
              id="screenshot-upload"
            />
            <label
              htmlFor="screenshot-upload"
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Add Screenshots'}
            </label>
            <p className="mt-2 text-sm text-gray-500">
              or drag and drop images here
            </p>
          </div>
        </div>

        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{fileName}</p>
          </div>
        ))}
        {uploadError && (
          <p className="text-sm text-red-600 mt-1">{uploadError}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
          disabled={isUploading}
        >
          {tradeToEdit ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );
};
