import { useEffect, useRef } from "react";

export default function useAutoScroll({ playing, speed, targetRef, onStop }) {
  const onStopRef = useRef(onStop);

  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  useEffect(() => {
    if (!playing) return;

    let frameId;
    let previousTime;
    let position = window.scrollY;

    const stop = () => onStopRef.current?.();

    const handleKeyDown = (event) => {
      if (
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]
          .includes(event.key)
      ) {
        stop();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
    };

    const animate = (timestamp) => {
      if (previousTime !== undefined) {
        const delta = Math.min((timestamp - previousTime) / 1000, 0.1);
        const maximum = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );

        // Stop once the last chord line is comfortably visible, not after the footer.
        const sheetBottom = targetRef.current?.getBoundingClientRect().bottom;
        if (
          (sheetBottom !== undefined && sheetBottom <= window.innerHeight * 0.7) ||
          window.scrollY >= maximum - 1
        ) {
          stop();
          return;
        }

        position = Math.min(maximum, Math.max(position, window.scrollY) + speed * delta);
        window.scrollTo(0, position);
      }

      previousTime = timestamp;
      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibility);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [playing, speed, targetRef]);
}
