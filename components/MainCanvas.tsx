
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppStep, CalibrationData, FrameConfig, Point } from '../types';

interface MainCanvasProps {
  imageSrc: string;
  step: AppStep;
  calibration: CalibrationData | null;
  setCalibration: (data: CalibrationData) => void;
  frames: FrameConfig[];
  ratio: number | null; // cm per pixel
  activeFrameId: string | null;
  onFrameMove: (id: string, pos: Point) => void;
}

const MainCanvas: React.FC<MainCanvasProps> = ({
  imageSrc,
  step,
  calibration,
  setCalibration,
  frames,
  ratio,
  activeFrameId,
  onFrameMove
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSelectingP2, setIsSelectingP2] = useState(false);
  const [draggingFrameId, setDraggingFrameId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Handle calibration point clicks
  const handleContainerClick = (e: React.MouseEvent) => {
    if (step !== AppStep.CALIBRATE || draggingFrameId) return;

    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isSelectingP2) {
      // Step 1: Set the first point
      setCalibration({
        p1: { x, y },
        p2: { x, y },
        realDistanceCm: calibration?.realDistanceCm || 100
      });
      setIsSelectingP2(true);
    } else {
      // Step 2: Set the second point
      if (calibration) {
        setCalibration({
          ...calibration,
          p2: { x, y }
        });
      }
      setIsSelectingP2(false);
    }
  };

  // Handle real-time guide line while selecting P2
  const handleMouseMoveCalibration = (e: React.MouseEvent) => {
    if (step === AppStep.CALIBRATE && isSelectingP2) {
      const rect = imgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (calibration) {
        setCalibration({
          ...calibration,
          p2: { x, y }
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, frameId: string) => {
    if (step !== AppStep.VISUALIZE) return;
    const frame = frames.find(f => f.id === frameId);
    if (!frame) return;

    setDraggingFrameId(frameId);
    setDragOffset({
      x: e.clientX - frame.position.x,
      y: e.clientY - frame.position.y
    });
    e.stopPropagation();
  };

  const handleMouseMoveDragging = useCallback((e: MouseEvent) => {
    if (!draggingFrameId) return;
    onFrameMove(draggingFrameId, {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  }, [draggingFrameId, dragOffset, onFrameMove]);

  const handleMouseUp = useCallback(() => {
    setDraggingFrameId(null);
  }, []);

  useEffect(() => {
    if (draggingFrameId) {
      window.addEventListener('mousemove', handleMouseMoveDragging);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveDragging);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveDragging);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingFrameId, handleMouseMoveDragging, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className="relative shadow-2xl bg-white max-w-full max-h-full cursor-crosshair overflow-hidden rounded-lg border-8 border-white"
      onClick={handleContainerClick}
      onMouseMove={handleMouseMoveCalibration}
    >
      <img 
        ref={imgRef}
        src={imageSrc} 
        alt="Room" 
        className="max-w-full max-h-[80vh] block pointer-events-none select-none"
      />

      {/* Calibration Overlay */}
      {step === AppStep.CALIBRATE && calibration && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.5"/>
            </filter>
          </defs>
          <line 
            x1={calibration.p1.x} y1={calibration.p1.y} 
            x2={calibration.p2.x} y2={calibration.p2.y} 
            stroke="#3b82f6" strokeWidth="3" strokeDasharray={isSelectingP2 ? "6,4" : "0"}
            filter="url(#shadow)"
          />
          <circle cx={calibration.p1.x} cy={calibration.p1.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" filter="url(#shadow)" />
          <circle cx={calibration.p2.x} cy={calibration.p2.y} r="6" fill={isSelectingP2 ? "#ef4444" : "#3b82f6"} stroke="white" strokeWidth="2" filter="url(#shadow)" />
          
          {!isSelectingP2 && calibration.p1.x !== calibration.p2.x && (
            <>
              <rect 
                x={(calibration.p1.x + calibration.p2.x) / 2 - 40} 
                y={(calibration.p1.y + calibration.p2.y) / 2 - 25} 
                width="80" height="24" rx="12" fill="rgba(59, 130, 246, 0.9)" 
              />
              <text 
                x={(calibration.p1.x + calibration.p2.x) / 2} 
                y={(calibration.p1.y + calibration.p2.y) / 2 - 8} 
                textAnchor="middle" fill="white" fontSize="12" fontWeight="bold"
              >
                {calibration.realDistanceCm}cm
              </text>
            </>
          )}
        </svg>
      )}

      {/* Visualization Frames */}
      {step === AppStep.VISUALIZE && ratio && frames.map(frame => {
        const widthPx = frame.widthCm / ratio;
        const heightPx = frame.heightCm / ratio;
        
        return (
          <div 
            key={frame.id}
            onMouseDown={(e) => handleMouseDown(e, frame.id)}
            style={{
              position: 'fixed',
              left: frame.position.x,
              top: frame.position.y,
              width: widthPx,
              height: heightPx,
              boxSizing: 'content-box', // Ensure border is added OUTSIDE the width/height
              border: `8px solid ${frame.color}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.1)',
              backgroundColor: '#ffffff', // Pure white for the inner area
              cursor: draggingFrameId === frame.id ? 'grabbing' : 'grab',
              zIndex: activeFrameId === frame.id ? 50 : 10,
              transform: `translate(-50%, -50%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: draggingFrameId ? 'none' : 'all 0.1s ease-out'
            }}
            className={activeFrameId === frame.id ? 'ring-4 ring-blue-500 ring-offset-4' : ''}
          >
            {/* Inner shadows to make it look like a real frame depth */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
            
            <div className="text-[10px] font-bold text-slate-300 select-none uppercase tracking-widest text-center px-1 z-10">
              {frame.widthCm} x {frame.heightCm} cm
            </div>
          </div>
        );
      })}

      {/* Instructions Overlay */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border text-sm font-medium flex items-center gap-2 text-slate-600 pointer-events-none">
        {step === AppStep.CALIBRATE ? (
          isSelectingP2 ? (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              끝점(B)을 클릭하여 길이를 고정하세요
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              시작점(A)을 클릭하세요
            </>
          )
        ) : step === AppStep.VISUALIZE ? (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            액자를 원하는 위치로 드래그하세요
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MainCanvas;
