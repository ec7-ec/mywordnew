import React, { useState, useEffect } from 'react';
import { StudyTask } from '../types';
import { Play, Pause, RotateCcw, CheckCircle, X, Volume2, Sparkles, Trophy } from 'lucide-react';
import { pixelSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface Props {
  task: StudyTask;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTaskWithBonus: (task: StudyTask, bonusMultiplier: number) => void;
}

export const PomodoroTimerModal: React.FC<Props> = ({
  task,
  isOpen,
  onClose,
  onCompleteTaskWithBonus,
}) => {
  const initialSeconds = task.durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setSecondsLeft(task.durationMinutes * 60);
    setIsActive(false);
    setIsFinished(false);
  }, [task]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      pixelSound.playTaskComplete();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.round(((initialSeconds - secondsLeft) / initialSeconds) * 100);

  const handleStartPause = () => {
    pixelSound.playClick();
    setIsActive(!isActive);
  };

  const handleReset = () => {
    pixelSound.playClick();
    setIsActive(false);
    setSecondsLeft(initialSeconds);
    setIsFinished(false);
  };

  const handleClaimBonus = () => {
    pixelSound.playLevelUp();
    onCompleteTaskWithBonus(task, 1.5); // 1.5x bonus for completing with focus timer
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="mc-panel-dark max-w-md w-full p-6 relative border-4 border-[#55ff55] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#2e8b2e] text-white font-pixel text-xs px-3 py-1 mb-2 border border-[#55ff55]">
            <Sparkles className="w-3.5 h-3.5" /> 像素专注房 (Pomodoro Room)
          </div>
          <h3 className="text-xl font-mc-title text-[#ffaa00] mc-text-shadow">
            {task.title}
          </h3>
          <p className="text-xs text-gray-400 font-pixel mt-1">
            完成专注可获得额外 <span className="text-[#55ff55] font-bold">1.5倍</span> 经验值与金币加成！
          </p>
        </div>

        {/* Pixel Countdown Display */}
        <div className="bg-[#101014] p-6 border-4 border-[#383842] rounded text-center mb-6 relative overflow-hidden">
          {/* Progress fill */}
          <div
            className="absolute bottom-0 left-0 top-0 bg-[#2e8b2e]/20 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />

          <div className="relative z-10 text-5xl font-pixel font-bold text-[#55ff55] mc-text-shadow tracking-widest my-2">
            {formattedTime}
          </div>

          <div className="relative z-10 text-xs font-pixel text-gray-400 mt-2">
            {isFinished ? '🎉 专注完成！点击下方领取丰厚加成！' : isActive ? '⏳ 正在进行深度学习中...' : '⏸️ 计时暂停中'}
          </div>
        </div>

        {/* Action Controls */}
        {!isFinished ? (
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStartPause}
              className={`mc-btn flex-1 py-3 text-base flex items-center justify-center gap-2 ${
                isActive ? 'mc-btn-gold' : 'mc-btn-primary'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" /> 暂停专注
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> 开始专注
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="mc-btn p-3 bg-[#333344] hover:bg-[#444455]"
              title="重置计时器"
            >
              <RotateCcw className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleClaimBonus}
            className="mc-btn mc-btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 animate-bounce"
          >
            <Trophy className="w-6 h-6 text-[#ffff55]" /> 领取 1.5倍 专注奖励！
          </button>
        )}
      </div>
    </div>
  );
};
