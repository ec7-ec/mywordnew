import React from 'react';
import { Achievement } from '../types';
import { X, Trophy, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { pixelSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface Props {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (achievementId: string) => void;
}

export const AchievementsModal: React.FC<Props> = ({
  achievements,
  isOpen,
  onClose,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="mc-panel-dark max-w-2xl w-full p-6 relative border-4 border-[#ffff55] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#383842]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffff55]/20 border border-[#ffff55]">
              <Trophy className="w-6 h-6 text-[#ffff55]" />
            </div>
            <div>
              <h3 className="text-xl font-mc-title text-[#ffff55] mc-text-shadow">
                成就殿堂 (Achievements Hall)
              </h3>
              <p className="text-xs text-gray-400 font-pixel mt-0.5">
                突破学习里程碑，解锁我的世界专属奖章与丰厚丰收！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-pixel text-xs text-[#55ff55] bg-[#101014] px-3 py-1.5 border border-[#383842]">
              进度: {unlockedCount} / {achievements.length}
            </span>
            <button
              onClick={() => {
                pixelSound.playClick();
                onClose();
              }}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 py-4">
          {achievements.map((ach) => {
            const isCompleted = ach.currentValue >= ach.targetValue;
            const progressPercent = Math.min(
              100,
              Math.round((ach.currentValue / ach.targetValue) * 100)
            );

            return (
              <div
                key={ach.id}
                className={`p-4 border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  ach.isUnlocked
                    ? 'bg-[#1e2a1e] border-[#55ff55]'
                    : isCompleted
                    ? 'bg-[#2a2a14] border-[#ffff55] animate-pulse'
                    : 'bg-[#121216] border-[#383842] opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="mc-slot w-12 h-12 flex items-center justify-center text-2xl relative shrink-0">
                    {ach.icon}
                    {ach.isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#55ff55] absolute -bottom-1 -right-1" />
                    ) : !isCompleted ? (
                      <Lock className="w-3.5 h-3.5 text-gray-500 absolute -bottom-1 -right-1" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-pixel font-bold text-sm text-white flex items-center gap-2">
                      {ach.title}
                      {ach.isUnlocked && (
                        <span className="text-[10px] text-[#55ff55] font-normal border border-[#55ff55] px-1.5 bg-[#2e8b2e]/30">
                          已解锁
                        </span>
                      )}
                    </h4>
                    <p className="font-pixel text-xs text-gray-400 mt-0.5">
                      {ach.description}
                    </p>

                    {/* Progress bar */}
                    {!ach.isUnlocked && (
                      <div className="mt-2 w-full max-w-xs">
                        <div className="flex justify-between text-[10px] font-pixel text-gray-400 mb-0.5">
                          <span>进度</span>
                          <span>
                            {ach.currentValue} / {ach.targetValue}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#0a0a0d] border border-[#2a2a33] overflow-hidden">
                          <div
                            className="h-full bg-[#55ff55]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reward Claim Button */}
                <div className="shrink-0">
                  {ach.isUnlocked ? (
                    <div className="text-right font-pixel text-xs text-[#55ff55]">
                      已领取奖励
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => {
                        pixelSound.playLevelUp();
                        confetti({
                          particleCount: 60,
                          spread: 60,
                          origin: { y: 0.6 },
                        });
                        onClaimReward(ach.id);
                      }}
                      className="mc-btn mc-btn-gold py-2 px-3 text-xs flex items-center gap-1.5 animate-bounce"
                    >
                      <Sparkles className="w-4 h-4 text-white" /> 领取奖励
                    </button>
                  ) : (
                    <div className="text-right font-pixel text-xs text-gray-500">
                      奖励: +{ach.rewardCoins} 🪙 / +{ach.rewardExp} EXP
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
