
import React, { useState } from 'react';
import { AppStep, CalibrationData, FrameConfig } from '../types';

interface SidebarProps {
  step: AppStep;
  setStep: (step: AppStep) => void;
  onImageUploadClick: () => void;
  onReset: () => void;
  calibration: CalibrationData | null;
  onCalibrationChange: (data: CalibrationData) => void;
  onCalibrateSubmit: () => void;
  onAddFrame: (w: number, h: number, color: string) => void;
  frames: FrameConfig[];
  activeFrameId: string | null;
  setActiveFrameId: (id: string | null) => void;
  onRemoveFrame: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  step,
  setStep,
  onImageUploadClick,
  onReset,
  calibration,
  onCalibrationChange,
  onCalibrateSubmit,
  onAddFrame,
  frames,
  activeFrameId,
  setActiveFrameId,
  onRemoveFrame
}) => {
  const [frameW, setFrameW] = useState(50);
  const [frameH, setFrameH] = useState(70);
  const [frameColor, setFrameColor] = useState('#222222');

  const getStepClass = (s: AppStep) => {
    const isActive = step === s;
    const canGoBack = (s === AppStep.UPLOAD && (step === AppStep.CALIBRATE || step === AppStep.VISUALIZE)) ||
                      (s === AppStep.CALIBRATE && step === AppStep.VISUALIZE);
    
    return `flex items-center gap-3 p-3 rounded-lg transition-all ${
      isActive ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 
      canGoBack ? 'text-slate-600 hover:bg-slate-100 cursor-pointer hover:translate-x-1' : 
      'text-slate-300 opacity-50 cursor-default'
    }`;
  };

  const handleStepClick = (s: AppStep) => {
    if (s === AppStep.UPLOAD && step !== AppStep.UPLOAD) {
      onReset(); // Go back to start
    } else if (s === AppStep.CALIBRATE && step === AppStep.VISUALIZE) {
      setStep(AppStep.CALIBRATE); // Go back to calibration stage
    }
  };

  const isCalibrationValid = calibration && 
    calibration.p1.x !== calibration.p2.x && 
    calibration.realDistanceCm > 0;

  return (
    <div className="flex flex-col h-full p-6 gap-8 overflow-y-auto">
      {/* Steps Indicator */}
      <nav className="flex flex-col gap-2">
        <div 
          className={getStepClass(AppStep.UPLOAD)} 
          onClick={() => handleStepClick(AppStep.UPLOAD)}
        >
          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${step === AppStep.UPLOAD ? 'bg-blue-600 border-blue-600 text-white' : 'border-current'}`}>1</span>
          <div className="flex flex-col">
            <span className="text-sm">사진 업로드</span>
            {(step === AppStep.CALIBRATE || step === AppStep.VISUALIZE) && <span className="text-[10px] opacity-70 font-normal">다시 시작하려면 클릭</span>}
          </div>
        </div>
        
        <div 
          className={getStepClass(AppStep.CALIBRATE)} 
          onClick={() => handleStepClick(AppStep.CALIBRATE)}
        >
          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${step === AppStep.CALIBRATE ? 'bg-blue-600 border-blue-600 text-white' : 'border-current'}`}>2</span>
          <div className="flex flex-col">
            <span className="text-sm">치수 캘리브레이션</span>
            {step === AppStep.VISUALIZE && <span className="text-[10px] opacity-70 font-normal">다시 설정하려면 클릭</span>}
          </div>
        </div>

        <div className={getStepClass(AppStep.VISUALIZE)}>
          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${step === AppStep.VISUALIZE ? 'bg-blue-600 border-blue-600 text-white' : 'border-current'}`}>3</span>
          <span className="text-sm">액자 배치하기</span>
        </div>
      </nav>

      {/* Dynamic Controls based on Step */}
      <div className="border-t pt-6 flex flex-col gap-6">
        {step === AppStep.UPLOAD && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-sm text-slate-500 leading-relaxed">
              중앙의 <span className="font-bold text-blue-600">사진 선택하기</span> 버튼을 눌러 사진을 업로드해 주세요.
            </p>
          </div>
        )}

        {step === AppStep.CALIBRATE && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">실제 치수 입력</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                1. 사진 속 물체의 양 끝점을 클릭하세요.<br/>
                2. 해당 물체의 실제 길이를 아래에 입력하세요.
              </p>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  value={calibration?.realDistanceCm || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (calibration) {
                      onCalibrationChange({ ...calibration, realDistanceCm: val });
                    } else {
                      onCalibrationChange({ 
                        p1: {x: 0, y: 0}, 
                        p2: {x: 0, y: 0}, 
                        realDistanceCm: val 
                      });
                    }
                  }}
                  placeholder="예: 120"
                />
                <span className="text-slate-500 font-medium whitespace-nowrap">cm</span>
              </div>
            </div>
            
            <button 
              disabled={!isCalibrationValid}
              onClick={onCalibrateSubmit}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              설정 완료
            </button>

            <button 
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              사진 업로드 단계로 돌아가기
            </button>
          </div>
        )}

        {step === AppStep.VISUALIZE && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">새 액자 추가</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">너비 (cm)</label>
                  <input type="number" value={frameW} onChange={(e) => setFrameW(Number(e.target.value))} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">높이 (cm)</label>
                  <input type="number" value={frameH} onChange={(e) => setFrameH(Number(e.target.value))} className="w-full border p-2 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">프레임 색상</label>
                <div className="flex gap-2">
                  {['#222222', '#F8F8F8', '#8B4513', '#FFD700'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setFrameColor(c)}
                      className={`w-8 h-8 rounded-full border ${frameColor === c ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md' : 'hover:scale-110 transition-transform'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="w-8 h-8 rounded-full border-none cursor-pointer overflow-hidden p-0" />
                </div>
              </div>
              <button 
                onClick={() => onAddFrame(frameW, frameH, frameColor)}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                액자 배치
              </button>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center justify-between">
                배치된 액자
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{frames.length}</span>
              </h3>
              <div className="space-y-2">
                {frames.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm italic">추가된 액자가 없습니다.</p>
                ) : frames.map(f => (
                  <div 
                    key={f.id} 
                    onClick={() => setActiveFrameId(f.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${activeFrameId === f.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}
                  >
                    <div className="text-sm">
                      <p className="font-bold text-slate-700">{f.widthCm} x {f.heightCm} cm</p>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: f.color }}></div>
                        액자 프레임
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveFrame(f.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 border-t pt-4">
              <button 
                onClick={() => setStep(AppStep.CALIBRATE)}
                className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-2 py-1 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                치수 다시 설정하기 (Step 2)
              </button>
              <button 
                onClick={onReset}
                className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-2 py-1 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                사진 새로 업로드하기 (Step 1)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
