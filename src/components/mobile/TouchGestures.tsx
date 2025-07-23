// src/components/mobile/TouchGestures.tsx
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  Heart,
  X
} from 'lucide-react';

interface TouchGesturesProps {
  children: ReactNode;
  className?: string;
}

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  children: ReactNode;
  className?: string;
}

interface PinchZoomProps {
  minZoom?: number;
  maxZoom?: number;
  children: ReactNode;
  className?: string;
}

interface ImageGalleryProps {
  images: string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface DoubleTapProps {
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  delay?: number;
  children: ReactNode;
  className?: string;
}

// Base Touch Gestures Handler
export const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`touch-manipulation select-none ${className}`}>
      {children}
    </div>
  );
};

// Swipe Gesture Component
export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  children,
  className = ''
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    // Determine if it's a horizontal or vertical swipe
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe) {
      // Horizontal swipe
      if (Math.abs(distanceX) > threshold) {
        if (distanceX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(distanceY) > threshold) {
        if (distanceY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }
  };

  return (
    <div
      className={`${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

// Pinch Zoom Component
export const PinchZoom: React.FC<PinchZoomProps> = ({
  minZoom = 1,
  maxZoom = 3,
  children,
  className = ''
}) => {
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setLastDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);
      if (lastDistance > 0) {
        const ratio = currentDistance / lastDistance;
        const newScale = Math.min(Math.max(scale * ratio, minZoom), maxZoom);
        setScale(newScale);
      }
      setLastDistance(currentDistance);
    }
  };

  const handleTouchEnd = () => {
    setLastDistance(0);
  };

  const resetZoom = () => {
    setScale(1);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={elementRef}
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-transform duration-100"
      >
        {children}
      </div>
      
      {scale > 1 && (
        <button
          onClick={resetZoom}
          className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Double Tap Component
export const DoubleTap: React.FC<DoubleTapProps> = ({
  onDoubleTap,
  onSingleTap,
  delay = 300,
  children,
  className = ''
}) => {
  const [lastTap, setLastTap] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < delay && timeDiff > 0) {
      // Double tap detected
      setTapCount(2);
      onDoubleTap?.();
    } else {
      // Potential single tap
      setTapCount(1);
      setTimeout(() => {
        if (tapCount === 1) {
          onSingleTap?.();
        }
        setTapCount(0);
      }, delay);
    }
    
    setLastTap(now);
  };

  return (
    <div className={className} onTouchEnd={handleTouchEnd}>
      {children}
    </div>
  );
};

// Advanced Image Gallery with Touch Gestures
export const TouchImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  currentIndex = 0,
  onIndexChange,
  className = '',
  showControls = true,
  autoPlay = false,
  autoPlayInterval = 3000
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (autoPlay && !showFullscreen) {
      intervalRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % images.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, images.length, showFullscreen]);

  const handleSwipeLeft = () => {
    const newIndex = (activeIndex + 1) % images.length;
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const handleSwipeRight = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const handleDoubleTap = () => {
    setIsZoomed(!isZoomed);
  };

  const handleFullscreen = () => {
    setShowFullscreen(true);
  };

  const renderImage = (fullscreen = false) => (
    <div className={`relative ${fullscreen ? 'h-screen w-screen' : 'h-64 w-full'} overflow-hidden`}>
      <SwipeGesture
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="h-full"
      >
        <DoubleTap onDoubleTap={handleDoubleTap} className="h-full">
          <PinchZoom className="h-full">
            <img
              src={images[activeIndex]}
              alt={`Image ${activeIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </PinchZoom>
        </DoubleTap>
      </SwipeGesture>

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          <button
            onClick={handleSwipeRight}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleSwipeLeft}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                onIndexChange?.(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Action Buttons (only in normal view) */}
      {!fullscreen && (
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleFullscreen}
            className="p-2 bg-black/50 text-white rounded-full"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Fullscreen Controls */}
      {fullscreen && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="p-2 bg-black/50 text-white rounded-full">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 bg-black/50 text-white rounded-full">
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowFullscreen(false)}
            className="p-2 bg-black/50 text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className={className}>
        <CardContent className="p-0">
          {renderImage()}
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {renderImage(true)}
        </div>
      )}
    </>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    const touchY = e.touches[0].clientY;
    const distance = Math.max(0, touchY - touchStart);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/10 transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`
        }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center space-x-2 text-primary">
            <div className={`animate-spin ${isRefreshing ? '' : 'opacity-0'}`}>
              <RotateCw className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>

      <div style={{ paddingTop: `${Math.max(0, pullDistance)}px` }}>
        {children}
      </div>
    </div>
  );
};

export default TouchGestures;