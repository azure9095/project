
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppStep, CalibrationData, FrameConfig, Point } from './types';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import Header from './components/Header';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [frames, setFrames] = useState<FrameConfig[]>([]);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null);
  const [ratio, setRatio] = useState<number | null>(null); // cm per pixel
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRoomImage(event.target?.result as string);
        setStep(AppStep.CALIBRATE);
        setCalibration(null);
        setRatio(null);
        setFrames([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    // Immediate reset to Step 1
    setRoomImage(null);
    setCalibration(null);
    setRatio(null);
    setFrames([]);
    setStep(AppStep.UPLOAD);
  };

  const handleCalibrationUpdate = (data: CalibrationData) => {
    setCalibration(data);
  };

  const handleCalibrateSubmit = useCallback(() => {
    if (!calibration) return;
    
    const dx = calibration.p2.x - calibration.p1.x;
    const dy = calibration.p2.y - calibration.p1.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (pixelDistance > 0 && calibration.realDistanceCm > 0) {
      const newRatio = calibration.realDistanceCm / pixelDistance;
      setRatio(newRatio);
      setStep(AppStep.VISUALIZE);
    } else {
      alert("올바른 치수를 입력하고 두 점을 선택해 주세요.");
    }
  }, [calibration]);

  const addFrame = (width: number, height: number, color: string) => {
    const newFrame: FrameConfig = {
      id: Math.random().toString(36).substr(2, 9),
      widthCm: width,
      heightCm: height,
      color: color,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    };
    setFrames([...frames, newFrame]);
    setActiveFrameId(newFrame.id);
  };

  const updateFramePosition = (id: string, pos: Point) => {
    setFrames(prev => prev.map(f => f.id === id ? { ...f, position: pos } : f));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        className="hidden" 
        onChange={handleImageUpload} 
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r bg-white shadow-sm z-10 flex flex-col">
          <Sidebar 
            step={step} 
            setStep={setStep}
            onImageUploadClick={triggerUpload}
            onReset={handleReset}
            calibration={calibration}
            onCalibrationChange={handleCalibrationUpdate}
            onCalibrateSubmit={handleCalibrateSubmit}
            onAddFrame={addFrame}
            frames={frames}
            activeFrameId={activeFrameId}
            setActiveFrameId={setActiveFrameId}
            onRemoveFrame={(id) => setFrames(prev => prev.filter(f => f.id !== id))}
          />
        </div>

        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-8">
          {roomImage ? (
            <MainCanvas 
              imageSrc={roomImage}
              step={step}
              calibration={calibration}
              setCalibration={handleCalibrationUpdate}
              frames={frames}
              ratio={ratio}
              activeFrameId={activeFrameId}
              onFrameMove={updateFramePosition}
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800">거실 사진을 업로드해 주세요</h2>
              <p className="text-slate-500">실제 크기를 가늠하기 위해 기준이 될 가구나 벽의 사진이 필요합니다.</p>
              <button 
                onClick={triggerUpload}
                className="inline-block mt-4 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                사진 선택하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
