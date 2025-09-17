import React from 'react'
import { VideoControlsState } from '../hooks/useVideoEffects' // Import the type here

interface VideoControlsProps {
  title: string
  fileName: string
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPlayPause: () => void
  isPlaying: boolean
  state: VideoControlsState // Use the specific type instead of 'any'
  onSliderChange: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void
  onCheckboxChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => void
}

const VideoControls: React.FC<VideoControlsProps> = ({
  title,
  fileName,
  onFileChange,
  onPlayPause,
  isPlaying,
  state,
  onSliderChange,
  onCheckboxChange,
}) => {
  return (
    <div className="controls-card p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 sm:space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-center">{title}</h2>
      <div className="flex items-center justify-between w-full space-x-2">
        <label className="file-input-label text-sm sm:text-base whitespace-nowrap">
          Upload Video
          <input
            type="file"
            className="file-input"
            accept="video/*"
            onChange={onFileChange}
          />
        </label>
        <button
          className="btn bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200"
          onClick={onPlayPause}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
        </button>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 truncate w-full text-center mt-2">
        {fileName}
      </p>
      <div className="flex flex-col w-full space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox text-indigo-600 rounded"
              checked={state.invert}
              onChange={(e) => onCheckboxChange(e, 'invert')}
            />
            <label className="text-gray-600 text-sm">Invert</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox text-indigo-600 rounded"
              checked={state.stutter}
              onChange={(e) => onCheckboxChange(e, 'stutter')}
            />
            <label className="text-gray-600 text-sm">Stutter</label>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Chromatic Aberration:
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={state.chromaticAberration}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'chromaticAberration')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.chromaticAberration}
          </span>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Posterize:
          </label>
          <input
            type="range"
            min="2"
            max="32"
            step="1"
            value={state.posterize}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'posterize')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.posterize}
          </span>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Scanlines:
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={state.scanlines}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'scanlines')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.scanlines}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox text-indigo-600 rounded"
              checked={state.mirrorX}
              onChange={(e) => onCheckboxChange(e, 'mirrorX')}
            />
            <label className="text-gray-600 text-sm">Mirror X</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox text-indigo-600 rounded"
              checked={state.mirrorY}
              onChange={(e) => onCheckboxChange(e, 'mirrorY')}
            />
            <label className="text-gray-600 text-sm">Mirror Y</label>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Speed:
          </label>
          <input
            type="range"
            min="0.25"
            max="2"
            step="0.05"
            value={state.speed}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'speed')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.speed.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Hue:
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={state.hue}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'hue')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.hue}°
          </span>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Grain:
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={state.grain}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'grain')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.grain}
          </span>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            RGB Shift:
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={state.rgbShift}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'rgbShift')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.rgbShift}
          </span>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <label className="text-gray-600 font-medium text-sm sm:text-base">
            Pixelate:
          </label>
          <input
            type="range"
            min="0"
            max="32"
            step="1"
            value={state.pixelate}
            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => onSliderChange(e, 'pixelate')}
          />
          <span className="font-bold text-gray-700 text-sm sm:text-base">
            {state.pixelate}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VideoControls
