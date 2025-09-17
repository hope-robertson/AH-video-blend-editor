'use client'

import { useState, useRef, useEffect } from 'react'
import VideoControls from '../components/VideoControls'
import { useVideoEffects, VideoControlsState } from '../hooks/useVideoEffects'
import './globals.css'
import { RefObject } from 'react' // Import RefObject

const App: React.FC = () => {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [video1State, setVideo1State] = useState<VideoControlsState>({
    speed: 1,
    hue: 0,
    invert: false,
    grain: 0,
    stutter: false,
    rgbShift: 0,
    pixelate: 0,
    chromaticAberration: 0,
    posterize: 32,
    scanlines: 0,
    mirrorX: false,
    mirrorY: false,
  })
  const [video2State, setVideo2State] = useState<VideoControlsState>({
    speed: 1,
    hue: 0,
    invert: false,
    grain: 0,
    stutter: false,
    rgbShift: 0,
    pixelate: 0,
    chromaticAberration: 0,
    posterize: 32,
    scanlines: 0,
    mirrorX: false,
    mirrorY: false,
  })
  const [video1FileName, setVideo1FileName] = useState('')
  const [video2FileName, setVideo2FileName] = useState('')
  const [blendMode, setBlendMode] = useState('normal')
  const [opacity, setOpacity] = useState(1)
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9)
  const [video1Ready, setVideo1Ready] = useState(false)
  const [video2Ready, setVideo2Ready] = useState(false)
  const [isPlaying1, setIsPlaying1] = useState(false)
  const [isPlaying2, setIsPlaying2] = useState(false)
  const [castWindow, setCastWindow] = useState<Window | null>(null)

  const { applyEffects } = useVideoEffects(
    video1Ref,
    video2Ref,
    canvasRef,
    video1State,
    video2State,
    blendMode,
    opacity,
    castWindow,
    video1Ready,
    video2Ready
  )

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    videoRef: RefObject<HTMLVideoElement>,
    setFileName: (name: string) => void,
    setVideoReady: (ready: boolean) => void
  ) => {
    const file = e.target.files?.[0]
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file)
      videoRef.current.src = url
      setFileName(file.name)
      setVideoReady(false)
    }
  }

  useEffect(() => {
    const handleMetadata = () => {
      if (
        video1Ref.current &&
        video1Ref.current.videoWidth &&
        video1Ref.current.videoHeight
      ) {
        setVideoAspectRatio(
          video1Ref.current.videoWidth / video1Ref.current.videoHeight
        )
        setVideo1Ready(true)
      }
    }

    const video1 = video1Ref.current
    if (video1) {
      video1.addEventListener('loadedmetadata', handleMetadata)
    }
    return () => {
      if (video1) {
        video1.removeEventListener('loadedmetadata', handleMetadata)
      }
    }
  }, [])

  useEffect(() => {
    const handleMetadata = () => {
      if (
        video2Ref.current &&
        video2Ref.current.videoWidth &&
        video2Ref.current.videoHeight
      ) {
        setVideoAspectRatio(
          video2Ref.current.videoWidth / video2Ref.current.videoHeight
        )
        setVideo2Ready(true)
      }
    }

    const video2 = video2Ref.current
    if (video2) {
      video2.addEventListener('loadedmetadata', handleMetadata)
    }
    return () => {
      if (video2) {
        video2.removeEventListener('loadedmetadata', handleMetadata)
      }
    }
  }, [])

  useEffect(() => {
    const handlePlay = () => setIsPlaying1(true)
    const handlePause = () => setIsPlaying1(false)
    const video1 = video1Ref.current
    if (video1) {
      video1.addEventListener('play', handlePlay)
      video1.addEventListener('pause', handlePause)
    }
    return () => {
      if (video1) {
        video1.removeEventListener('play', handlePlay)
        video1.removeEventListener('pause', handlePause)
      }
    }
  }, [])

  useEffect(() => {
    const handlePlay = () => setIsPlaying2(true)
    const handlePause = () => setIsPlaying2(false)
    const video2 = video2Ref.current
    if (video2) {
      video2.addEventListener('play', handlePlay)
      video2.addEventListener('pause', handlePause)
    }
    return () => {
      if (video2) {
        video2.removeEventListener('play', handlePlay)
        video2.removeEventListener('pause', handlePause)
      }
    }
  }, [])

  const togglePlayPause = (videoRef: RefObject<HTMLVideoElement>) => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .catch((e) => console.error('Video playback failed:', e))
      } else {
        videoRef.current.pause()
      }
    }
  }

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof VideoControlsState,
    setState: React.Dispatch<React.SetStateAction<VideoControlsState>>
  ) => {
    setState((prev: VideoControlsState) => ({
      ...prev,
      [key]: parseFloat(e.target.value),
    }))
  }

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof VideoControlsState,
    setState: React.Dispatch<React.SetStateAction<VideoControlsState>>
  ) => {
    setState((prev: VideoControlsState) => ({
      ...prev,
      [key]: e.target.checked,
    }))
  }

  const handleCastClick = () => {
    if (castWindow && !castWindow.closed) {
      castWindow.focus()
      return
    }

    const newWindow = window.open(
      '',
      '_blank',
      'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
    )
    if (!newWindow) {
      console.error(
        "Failed to open new window. Please check your browser's pop-up blocker settings."
      )
      return
    }

    setCastWindow(newWindow)
    const newDoc = newWindow.document
    newDoc.title = 'Live Visuals'

    newDoc.open()
    newDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Live Visuals</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                        background-color: black;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100vw;
                        height: 100vh;
                    }
                    canvas {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }
                </style>
            </head>
            <body>
                <canvas id="display-canvas"></canvas>
            </body>
            </html>
        `)
    newDoc.close()
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl bg-white space-y-4 md:space-y-6 max-h-screen overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-indigo-600">
        Video Blend Editor
      </h1>
      <p className="text-center text-sm sm:text-base text-gray-600">
        Upload two videos, select a blend mode, and create an amazing composite!
      </p>

      <div className="flex justify-center">
        <div id="video-display" className="resizable-wrapper">
          <div className="video-container">
            <video
              ref={video1Ref}
              className="hidden"
              autoPlay
              loop
              muted
              playsInline
            ></video>
            <video
              ref={video2Ref}
              className="hidden"
              autoPlay
              loop
              muted
              playsInline
            ></video>
            <canvas ref={canvasRef} className="z-10"></canvas>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="btn bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
          onClick={handleCastClick}
        >
          Cast to a new window 🎬
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <VideoControls
          title="Blend Layer"
          fileName={video2FileName}
          onFileChange={(e) =>
            handleFileChange(e, video2Ref, setVideo2FileName, setVideo2Ready)
          }
          onPlayPause={() => togglePlayPause(video2Ref)}
          isPlaying={isPlaying2}
          state={video2State}
          onSliderChange={(e, key) =>
            handleSliderChange(
              e,
              key as keyof VideoControlsState,
              setVideo2State
            )
          }
          onCheckboxChange={(e, key) =>
            handleCheckboxChange(
              e,
              key as keyof VideoControlsState,
              setVideo2State
            )
          }
        />

        <div className="controls-card p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-center">
            Blend Mode
          </h2>
          <select
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-full bg-gray-50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
            <option value="hue">Hue</option>
            <option value="saturation">Saturation</option>
            <option value="color">Color</option>
            <option value="luminosity">Luminosity</option>
            <option value="source-in">Source In</option>
            <option value="source-out">Source Out</option>
            <option value="source-atop">Source Atop</option>
            <option value="destination-over">Destination Over</option>
            <option value="destination-in">Destination In</option>
            <option value="destination-out">Destination Out</option>
            <option value="destination-atop">Destination Atop</option>
            <option value="lighter">Lighter</option>
          </select>
          <div className="flex items-center space-x-2 w-full">
            <label className="text-gray-600 font-medium text-sm sm:text-base">
              Opacity:
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
            <span className="font-bold text-gray-700 text-sm sm:text-base">
              {opacity.toFixed(2)}
            </span>
          </div>
        </div>

        <VideoControls
          title="Base Layer"
          fileName={video1FileName}
          onFileChange={(e) =>
            handleFileChange(e, video1Ref, setVideo1FileName, setVideo1Ready)
          }
          onPlayPause={() => togglePlayPause(video1Ref)}
          isPlaying={isPlaying1}
          state={video1State}
          onSliderChange={(e, key) =>
            handleSliderChange(
              e,
              key as keyof VideoControlsState,
              setVideo1State
            )
          }
          onCheckboxChange={(e, key) =>
            handleCheckboxChange(
              e,
              key as keyof VideoControlsState,
              setVideo1State
            )
          }
        />
      </div>
    </div>
  )
}

export default App
