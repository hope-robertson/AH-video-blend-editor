import { useEffect, useRef, useCallback } from 'react'

// Type definitions for video controls and state
export interface VideoControlsState {
  speed: number
  hue: number
  invert: boolean
  grain: number
  stutter: boolean
  rgbShift: number
  pixelate: number
  chromaticAberration: number
  posterize: number
  scanlines: number
  mirrorX: boolean
  mirrorY: boolean
}

export const useVideoEffects = (
  video1Ref: React.RefObject<HTMLVideoElement>,
  video2Ref: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  video1State: VideoControlsState,
  video2State: VideoControlsState,
  blendMode: string,
  opacity: number,
  castWindow: Window | null,
  video1Ready: boolean,
  video2Ready: boolean
) => {
  const tempCanvas1Ref = useRef(document.createElement('canvas'))
  const tempCanvas2Ref = useRef(document.createElement('canvas'))
  const pixelateTempCanvasRef = useRef(document.createElement('canvas'))
  const stutterInterval1Ref = useRef(0)
  const stutterInterval2Ref = useRef(0)

  const applyEffects = (
    video: HTMLVideoElement,
    controls: VideoControlsState,
    tempCanvas: HTMLCanvasElement,
    tempCtx: CanvasRenderingContext2D
  ) => {
    if (!video.videoWidth || !video.videoHeight) return tempCanvas

    const {
      invert,
      hue,
      grain,
      rgbShift,
      pixelate,
      chromaticAberration,
      posterize,
      scanlines,
      mirrorX,
      mirrorY,
    } = controls

    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

    const filters = []
    if (invert) filters.push('invert(1)')
    if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`)
    tempCtx.filter = filters.join(' ')

    tempCtx.save()
    const scaleX = mirrorX ? -1 : 1
    const scaleY = mirrorY ? -1 : 1
    tempCtx.scale(scaleX, scaleY)
    tempCtx.translate(
      mirrorX ? -tempCanvas.width : 0,
      mirrorY ? -tempCanvas.height : 0
    )

    if (pixelate > 0) {
      const pixelSize = Math.max(1, pixelate)
      const tempWidth = Math.floor(tempCanvas.width / pixelSize)
      const tempHeight = Math.floor(tempCanvas.height / pixelSize)
      const pixelateTempCanvas = pixelateTempCanvasRef.current
      const pixelateTempCtx = pixelateTempCanvas.getContext('2d')!
      pixelateTempCanvas.width = tempWidth
      pixelateTempCanvas.height = tempHeight
      pixelateTempCtx.imageSmoothingEnabled = false
      pixelateTempCtx.drawImage(video, 0, 0, tempWidth, tempHeight)
      tempCtx.imageSmoothingEnabled = false
      tempCtx.drawImage(
        pixelateTempCanvas,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      )
      tempCtx.imageSmoothingEnabled = true
    } else {
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)
    }

    if (rgbShift > 0) {
      tempCtx.globalCompositeOperation = 'difference'
      tempCtx.filter = 'hue-rotate(0deg) saturate(200%)'
      tempCtx.drawImage(
        video,
        -rgbShift,
        0,
        tempCanvas.width,
        tempCanvas.height
      )

      tempCtx.filter = 'hue-rotate(180deg) saturate(200%)'
      tempCtx.drawImage(video, rgbShift, 0, tempCanvas.width, tempCanvas.height)

      tempCtx.globalCompositeOperation = 'source-over'
    }

    if (chromaticAberration > 0) {
      tempCtx.globalCompositeOperation = 'lighter'
      tempCtx.filter = 'sepia(1) saturate(100) hue-rotate(0deg)'
      tempCtx.drawImage(
        video,
        -chromaticAberration,
        0,
        tempCanvas.width,
        tempCanvas.height
      )

      tempCtx.filter = 'sepia(1) saturate(100) hue-rotate(120deg)'
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)

      tempCtx.filter = 'sepia(1) saturate(100) hue-rotate(240deg)'
      tempCtx.drawImage(
        video,
        chromaticAberration,
        0,
        tempCanvas.width,
        tempCanvas.height
      )

      tempCtx.globalCompositeOperation = 'source-over'
    }

    tempCtx.restore()
    tempCtx.filter = 'none'

    if (grain > 0 || posterize < 32 || scanlines > 0) {
      const imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      )
      const data = imageData.data
      const posterizeLevels = posterize
      const step = 256 / posterizeLevels

      for (let i = 0; i < data.length; i += 4) {
        const y = Math.floor(i / 4 / tempCanvas.width)

        if (grain > 0) {
          const grainAmount = (Math.random() - 0.5) * grain * 2
          data[i] = Math.min(255, Math.max(0, data[i] + grainAmount))
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grainAmount))
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grainAmount))
        }

        if (posterizeLevels < 32) {
          data[i] = Math.floor(data[i] / step) * step
          data[i + 1] = Math.floor(data[i + 1] / step) * step
          data[i + 2] = Math.floor(data[i + 2] / step) * step
        }

        if (scanlines > 0 && y % 2 !== 0) {
          const darkness = 1 - scanlines / 100
          data[i] = data[i] * darkness
          data[i + 1] = data[i + 1] * darkness
          data[i + 2] = data[i + 2] * darkness
        }
      }
      tempCtx.putImageData(imageData, 0, 0)
    }

    return tempCanvas
  }

  const drawFrame = useCallback(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Stutter logic for Video 1
    if (video1State.stutter) {
      if (Math.random() < 0.05) {
        video1.playbackRate = 0.2
        stutterInterval1Ref.current = 10
      } else if (stutterInterval1Ref.current > 0) {
        stutterInterval1Ref.current--
      } else {
        video1.playbackRate = video1State.speed
      }
    } else {
      video1.playbackRate = video1State.speed
    }

    // Stutter logic for Video 2
    if (video2State.stutter) {
      if (Math.random() < 0.05) {
        video2.playbackRate = 0.2
        stutterInterval2Ref.current = 10
      } else if (stutterInterval2Ref.current > 0) {
        stutterInterval2Ref.current--
      } else {
        video2.playbackRate = video2State.speed
      }
    } else {
      video2.playbackRate = video2State.speed
    }

    if (video1Ready || video2Ready) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (video1Ready) {
        const processedFrame1 = applyEffects(
          video1,
          video1State,
          tempCanvas1Ref.current,
          tempCanvas1Ref.current.getContext('2d')!
        )
        ctx.drawImage(processedFrame1, 0, 0, canvas.width, canvas.height)
      }

      if (video2Ready) {
        const processedFrame2 = applyEffects(
          video2,
          video2State,
          tempCanvas2Ref.current,
          tempCanvas2Ref.current.getContext('2d')!
        )
        ctx.globalAlpha = opacity
        ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation
        ctx.drawImage(processedFrame2, 0, 0, canvas.width, canvas.height)

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1.0
      }

      // Draw to the cast window's canvas if it's open
      if (castWindow && !castWindow.closed) {
        const castCanvas = castWindow.document.getElementById(
          'display-canvas'
        ) as HTMLCanvasElement
        if (castCanvas) {
          const castCtx = castCanvas.getContext('2d')!
          castCtx.clearRect(0, 0, castCanvas.width, castCanvas.height)
          castCtx.drawImage(
            canvas,
            0,
            0,
            castCtx.canvas.width,
            castCtx.canvas.height
          )
        }
      }
    }

    const animationFrameId = requestAnimationFrame(drawFrame)
    return () => cancelAnimationFrame(animationFrameId)
  }, [
    video1Ref,
    video2Ref,
    canvasRef,
    video1State,
    video2State,
    blendMode,
    opacity,
    castWindow,
    video1Ready,
    video2Ready,
  ])

  // Use a single useEffect for the core animation loop
  useEffect(() => {
    const cleanup = drawFrame()
    return cleanup
  }, [drawFrame])

  return { applyEffects }
}
