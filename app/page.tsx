"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { Fullscreen, Pause, Play, ChevronLeft, ChevronRight, X } from "lucide-react";

const fetchPhotos = async () => {
  try {
    const res = await fetch("https://picsum.photos/v2/list?page=1&limit=10");
    if (!res.ok) throw new Error("Failed to fetch photos");
    return await res.json();
  } catch {
    throw new Error("Failed to fetch photos");
  }
};

export default function Slideshow() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const data = await fetchPhotos();
        setPhotos(data);
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);

    loadPhotos();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && photos.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, photos]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  }, [photos.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handlePausePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(false);
    setPhotos([]);
    setCurrentIndex(0);
    setIsPlaying(true);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape" && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, handleKeyDown]);

  useEffect(() => {
    const handleResize = () => {
      setShowControls(true);
      setTimeout(() => setShowControls(false), 5000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setTimeout(() => setShowControls(false), 5000);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (error) return <div className="flex flex-col justify-center items-center h-screen"><p>Error loading photos</p><button onClick={handleRetry} className="mt-2 p-2 bg-blue-500 text-white rounded">Retry</button></div>;

  if (photos.length === 0) return <div className="flex justify-center items-center h-screen">No photos available</div>;

  return (
    <div className={twMerge("relative h-screen", isFullscreen && "fixed inset-0 bg-black z-50")}>
      <div className="h-full flex justify-center items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Image src={photos[currentIndex]?.download_url} alt="Nature" layout="fill" objectFit="cover" />
        {showControls && (
          <div className="absolute inset-0 flex justify-between items-center p-4">
            <button onClick={handlePrevious} className="p-2 bg-white rounded-full"><ChevronLeft /></button>
            <button onClick={handlePausePlay} className="p-2 bg-white rounded-full">{isPlaying ? <Pause /> : <Play />}</button>
            <button onClick={handleNext} className="p-2 bg-white rounded-full"><ChevronRight /></button>
            <button onClick={handleFullscreenToggle} className="p-2 bg-white rounded-full"><Fullscreen /></button>
          </div>
        )}
        {isFullscreen && <button onClick={handleFullscreenToggle} className="absolute top-4 right-4 p-2 bg-white rounded-full"><X /></button>}
      </div>
    </div>
  );
}