
import { useEffect, useState } from 'react'

const MIN_SPEED = 1
const MAX_SPEED = 10

function getInitialSpeed() {
  try {
    const saved = Number(
      localStorage.getItem('guitar-chords-scroll-speed')
    )

    if (
      Number.isInteger(saved) &&
      saved >= MIN_SPEED &&
      saved <= MAX_SPEED
    ) {
      return saved
    }
  } catch {
    // Use default speed.
  }

  return 3
}

export default function useAutoScroll() {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(getInitialSpeed)

  useEffect(() => {
    try {
      localStorage.setItem(
        'guitar-chords-scroll-speed',
        String(speed)
      )
    } catch {
      // Storage is optional.
    }
  }, [speed])

  useEffect(() => {
    if (!playing) return

    let frameId
    let lastTime = null
    let remainder = 0

    const pixelsPerSecond = speed * 10

    function stop() {
      setPlaying(false)
    }

    function scrollFrame(timestamp) {
      if (lastTime === null) {
        lastTime = timestamp
      }

      const elapsed = Math.min(
        (timestamp - lastTime) / 1000,
        0.1
      )

      lastTime = timestamp

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight -
          window.innerHeight
      )

      if (window.scrollY >= maxScroll - 1) {
        stop()
        return
      }

      remainder += pixelsPerSecond * elapsed

      const distance = Math.floor(remainder)

      if (distance > 0) {
        window.scrollBy(0, distance)
        remainder -= distance
      }

      frameId = requestAnimationFrame(scrollFrame)
    }

    function handleKeyDown(event) {
      const target = event.target

      if (
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']
          .includes(target?.tagName) ||
        target?.isContentEditable
      ) {
        return
      }

      const scrollKeys = [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ]

      if (scrollKeys.includes(event.key)) {
        stop()
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stop()
      }
    }

    window.addEventListener(
      'wheel',
      stop,
      { passive: true }
    )

    window.addEventListener(
      'touchmove',
      stop,
      { passive: true }
    )

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )

    frameId = requestAnimationFrame(scrollFrame)

    return () => {
      cancelAnimationFrame(frameId)

      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
    }
  }, [playing, speed])

  function toggle() {
    setPlaying(current => !current)
  }

  function pause() {
    setPlaying(false)
  }

  function restart() {
    setPlaying(false)

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    })
  }

  function increaseSpeed() {
    setSpeed(current =>
      Math.min(MAX_SPEED, current + 1)
    )
  }

  function decreaseSpeed() {
    setSpeed(current =>
      Math.max(MIN_SPEED, current - 1)
    )
  }

  return {
    playing,
    speed,
    toggle,
    pause,
    restart,
    increaseSpeed,
    decreaseSpeed,
    minSpeed: MIN_SPEED,
    maxSpeed: MAX_SPEED,
  }
}
