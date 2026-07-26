import React, { useState } from 'react';
import { AccountState, SubAccountProfile, AccountRole } from '../types';
import { INITIAL_CHARACTER, INITIAL_TASKS, INITIAL_ACHIEVEMENTS } from '../data/initialData';
import {
  X,
  UserCheck,
  UserPlus,
  Lock,
  Unlock,
  ShieldCheck,
  Sparkles,
  Trash2,
  KeyRound,
  Check,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { pixelSound } from '../utils/sound';
import { MinecraftEmeraldSVG, MinecraftGoldIngotSVG } from './MinecraftVectors';

interface Props {
  accountState: AccountState;
  isOpen: boolean;
  onClose: () => void;
  onSwitchAccount: (accountId: string, pinInput?: string) => boolean; // returns true if success
  onCreateSubAccount: (name: string, avatarIcon: string) => void;
  onDeleteSubAccount: (subAccountId: string) => void;
  onResetSubAccount: (
    subAccountId: string,
    options?: { resetCharacter?: boolean; resetTasks?: boolean; resetHistory?: boolean }
  ) => void;
  onSetMainPin: (pin: string | null) => void;
}

const AVATAR_OPTIONS = ['👦', '👧', '🧙‍♂️', '🦊', '🤖', '🐱', '🎒', '⚡', '🏹', '🛡️'];

export const AccountManagerModal: React.FC<Props> = ({
  accountState,
  isOpen,
  onClose,
  onSwitchAccount,
  onCreateSubAccount,
  onDeleteSubAccount,
  onResetSubAccount,
  onSetMainPin,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'add_sub' | 'pin_settings'>('switch');

  // New sub account form
  const [newSubName, setNewSubName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👦');

  // PIN verification
  const [pinInput, setPinInput] = useState('');
  const [targetSwitchId, setTargetSwitchId] = useState<string | null>(null);
  const [pinError, setPinError] = useState('');

  // Sub account reset state
  const [resetTargetSubId, setResetTargetSubId] = useState<string | null>(null);
  const [resetOptions, setResetOptions] = useState({
    resetCharacter: true,
    resetTasks: true,
    resetHistory: true,
  });

  // PIN settings state
  const [pinFormNew, setPinFormNew] = useState('');
  const [pinFormConfirm, setPinFormConfirm] = useState('');
  const [pinFormMsg, setPinFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const currentRole: AccountRole =
    accountState.activeAccountId === 'main' ? 'main' : 'sub';

  const currentSubAccount = accountState.subAccounts.find(
    (s) => s.id === accountState.activeAccountId
  );

  const targetResetSubAccount = accountState.subAccounts.find(
    (s) => s.id === resetTargetSubId
  );

  const handleRequestSwitch = (accountId: string) => {
    pixelSound.playClick();
    // If switching to main account and PIN is set, prompt for PIN
    if (accountId === 'main' && currentRole === 'sub' && accountState.mainPin) {
      setTargetSwitchId('main');
      setPinInput('');
      setPinError('');
      return;
    }

    const success = onSwitchAccount(accountId);
    if (success) {
      onClose();
    }
  };

  const handleVerifyPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSwitchId) return;

    const success = onSwitchAccount(targetSwitchId, pinInput);
    if (success) {
      setTargetSwitchId(null);
      setPinInput('');
      setPinError('');
      onClose();
    } else {
      setPinError('PIN 码不正确，请重新输入');
      pixelSound.playClick();
    }
  };

  const handleCreateSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    onCreateSubAccount(newSubName.trim(), selectedAvatar);
    pixelSound.playLevelUp();

    setNewSubName('');
    setActiveTab('switch');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinFormNew !== pinFormConfirm) {
      setPinFormMsg({ type: 'error', text: '两次输入的 PIN 码不一致！' });
      return;
    }
    if (pinFormNew.length > 0 && pinFormNew.length !== 4) {
      setPinFormMsg({ type: 'error', text: 'PIN 码必须为 4 位数字！' });
      return;
    }

    if (pinFormNew.length === 0) {
      onSetMainPin(null);
      setPinFormMsg({ type: 'success', text: '已解除主账户 PIN 码保护！' });
    } else {
      onSetMainPin(pinFormNew);
      setPinFormMsg({ type: 'success', text: '主账户 4 位 PIN 码保护设置成功！' });
    }

    setPinFormNew('');
    setPinFormConfirm('');
    pixelSound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="mc-panel-dark max-w-2xl w-full p-6 relative border-4 border-[#ffaa00] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#383842]">
          <div className="p-3 bg-[#2a2a38] border-2 border-[#ffaa00]">
            <UserCheck className="w-6 h-6 text-[#ffaa00]" />
          </div>
          <div>
            <h3 className="text-xl font-mc-title text-[#ffaa00] mc-text-shadow flex items-center gap-2">
              多账号管理系统 (Account Management)
            </h3>
            <p className="text-xs text-gray-400 font-pixel mt-0.5">
              支持主账户全功能权限与子账户（学生/孩子）专属学习体验
            </p>
          </div>
        </div>

        {/* Account Status Indicator */}
        <div className="bg-[#101014] p-3 border-2 border-[#2e8b2e] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-pixel">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">当前身份:</span>
            {currentRole === 'main' ? (
              <span className="bg-[#2e8b2e] text-white px-2 py-0.5 font-bold border border-[#55ff55] flex items-center gap-1">
                👑 主账户 (全功能/管理员)
              </span>
            ) : (
              <span className="bg-[#008080] text-white px-2 py-0.5 font-bold border border-[#55ffff] flex items-center gap-1">
                🎒 子账户: {currentSubAccount?.name || '学生'} (仅任务打卡与商店)
              </span>
            )}
          </div>

          <div className="text-gray-400 flex items-center gap-1">
            {accountState.mainPin ? (
              <span className="text-[#55ff55] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> 已设置 PIN 保护
              </span>
            ) : (
              <span className="text-gray-500 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" /> 无 PIN 保护
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b-2 border-[#383842] pb-3 mb-6">
          <button
            onClick={() => {
              pixelSound.playClick();
              setActiveTab('switch');
              setTargetSwitchId(null);
            }}
            className={`mc-btn text-xs py-2 px-3 ${
              activeTab === 'switch' ? 'mc-btn-primary' : 'bg-[#181820]'
            }`}
          >
            切换账户
          </button>

          {currentRole === 'main' && (
            <>
              <button
                onClick={() => {
                  pixelSound.playClick();
                  setActiveTab('add_sub');
                  setTargetSwitchId(null);
                }}
                className={`mc-btn text-xs py-2 px-3 ${
                  activeTab === 'add_sub' ? 'mc-btn-gold' : 'bg-[#181820]'
                }`}
              >
                + 添加子账户
              </button>

              <button
                onClick={() => {
                  pixelSound.playClick();
                  setActiveTab('pin_settings');
                  setTargetSwitchId(null);
                }}
                className={`mc-btn text-xs py-2 px-3 ${
                  activeTab === 'pin_settings' ? 'mc-btn-diamond' : 'bg-[#181820]'
                }`}
              >
                🔑 主账户 PIN 保护设置
              </button>
            </>
          )}
        </div>

        {/* PIN VERIFICATION FORM IF TRIGGERED */}
        {targetSwitchId && (
          <div className="bg-[#141418] p-5 border-2 border-[#ff5555] mb-6">
            <div className="flex items-center gap-2 text-[#ff5555] font-pixel text-sm font-bold mb-2">
              <ShieldAlert className="w-5 h-5" /> 验证主账户 PIN 码
            </div>
            <p className="text-xs font-pixel text-gray-300 mb-4">
              为了防止子账户误操作，请输入主账户设置的 4 位安全 PIN 码以切换至主账户：
            </p>

            <form onSubmit={handleVerifyPinSubmit} className="space-y-3 font-pixel">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="请输入4位数字PIN码"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-[#0c0c0e] text-center text-xl tracking-widest text-[#55ff55] border-2 border-[#ffaa00] p-3 focus:outline-none"
                />
              </div>

              {pinError && (
                <p className="text-xs text-[#ff5555] font-bold">{pinError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetSwitchId(null)}
                  className="mc-btn flex-1 py-2 bg-[#333344] text-xs"
                >
                  取消
                </button>
                <button type="submit" className="mc-btn mc-btn-primary flex-1 py-2 text-xs">
                  验证并切换
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 1: SWITCH ACCOUNT */}
        {activeTab === 'switch' && !targetSwitchId && (
          <div className="space-y-4">
            {/* Main Account Card */}
            <div
              className={`p-4 border-2 transition-all ${
                accountState.activeAccountId === 'main'
                  ? 'bg-[#1e2a1e] border-[#55ff55] shadow-lg'
                  : 'bg-[#141418] border-[#383842] hover:border-[#55ff55]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#2e8b2e] border-2 border-[#55ff55] flex items-center justify-center text-2xl shadow">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mc-title font-bold text-base text-[#55ff55] mc-text-shadow">
                        主账户 (家长/管理员)
                      </h4>
                      {accountState.activeAccountId === 'main' && (
                        <span className="bg-[#2e8b2e] text-white text-[10px] font-pixel px-2 py-0.5">
                          当前使用中
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-pixel text-gray-400 mt-1">
                      全功能使用权限：包含学习计划创建、修改、数据云端同步、子账户管理
                    </p>
                  </div>
                </div>

                {accountState.activeAccountId !== 'main' && (
                  <button
                    onClick={() => handleRequestSwitch('main')}
                    className="mc-btn mc-btn-primary text-xs py-2 px-3 whitespace-nowrap"
                  >
                    切换至主账户
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Accounts Section */}
            <div className="pt-2">
              <h4 className="font-pixel text-xs text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                <span>🎒</span> 子账户列表 (关联学生/孩子)
              </h4>

              {/* Reset Sub-Account Confirmation Panel */}
              {resetTargetSubId && targetResetSubAccount && currentRole === 'main' && (
                <div className="bg-[#181824] p-4 border-2 border-[#ffaa00] mb-4 font-pixel shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#383848]">
                    <div className="flex items-center gap-2 text-[#ffaa00] font-bold text-sm">
                      <RotateCcw className="w-4 h-4 text-[#ffaa00]" />
                      <span>重置子账户【{targetResetSubAccount.name}】的数据</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetTargetSubId(null)}
                      className="text-gray-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-gray-300 mb-3">
                    👑 主账户控制台：请勾选要重置的数据维度（重置后不可撤销）：
                  </p>

                  <div className="space-y-2 mb-4 text-xs bg-[#101014] p-3 border border-[#2c2c3a]">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-200 hover:text-white">
                      <input
                        type="checkbox"
                        checked={resetOptions.resetCharacter}
                        onChange={(e) =>
                          setResetOptions({ ...resetOptions, resetCharacter: e.target.checked })
                        }
                        className="accent-[#ffaa00] w-4 h-4"
                      />
                      <span>👑 <b>角色与装备重置</b>：回归 Lv.1、0 经验、0 金币、清空背包与已穿戴装备</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-200 hover:text-white">
                      <input
                        type="checkbox"
                        checked={resetOptions.resetTasks}
                        onChange={(e) =>
                          setResetOptions({ ...resetOptions, resetTasks: e.target.checked })
                        }
                        className="accent-[#ffaa00] w-4 h-4"
                      />
                      <span>📋 <b>清空任务打卡记录</b>：清除此子账户在所有学习计划任务中的打卡完成标志</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-200 hover:text-white">
                      <input
                        type="checkbox"
                        checked={resetOptions.resetHistory}
                        onChange={(e) =>
                          setResetOptions({ ...resetOptions, resetHistory: e.target.checked })
                        }
                        className="accent-[#ffaa00] w-4 h-4"
                      />
                      <span>📊 <b>清空学习历程日志</b>：重置该子账户图表中的每日 EXP 与专注时长积累</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setResetTargetSubId(null)}
                      className="mc-btn bg-[#333344] text-xs py-1.5 px-3"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetSubAccount(resetTargetSubId, resetOptions);
                        pixelSound.playLevelUp();
                        setResetTargetSubId(null);
                      }}
                      className="mc-btn mc-btn-gold text-xs py-1.5 px-4 font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 确认重置所选数据
                    </button>
                  </div>
                </div>
              )}

              {accountState.subAccounts.length === 0 ? (
                <div className="bg-[#141418] border-2 border-dashed border-[#383842] p-6 text-center">
                  <div className="text-3xl mb-2">👦</div>
                  <p className="font-pixel text-xs text-gray-400 mb-3">
                    尚未创建子账户。主账户可以为孩子创建专属子账户，让他们独立打卡、积攒金币并兑换换装！
                  </p>
                  {currentRole === 'main' && (
                    <button
                      onClick={() => setActiveTab('add_sub')}
                      className="mc-btn mc-btn-gold text-xs py-2 px-4 inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" /> 立即新建子账户
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {accountState.subAccounts.map((sub) => {
                    const isCurrent = accountState.activeAccountId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className={`p-4 border-2 transition-all ${
                          isCurrent
                            ? 'bg-[#182828] border-[#55ffff] shadow-lg'
                            : 'bg-[#141418] border-[#383842] hover:border-[#55ffff]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#008080]/60 border-2 border-[#55ffff] flex items-center justify-center text-2xl shadow">
                              {sub.avatarIcon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-mc-title font-bold text-base text-[#55ffff]">
                                  {sub.name}
                                </h5>
                                {isCurrent && (
                                  <span className="bg-[#008080] text-white text-[10px] font-pixel px-2 py-0.5">
                                    当前使用中
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs font-pixel text-gray-300">
                                <span className="text-[#ffaa00] font-bold">
                                  Lv.{sub.character.level} {sub.character.title}
                                </span>
                                <span className="flex items-center gap-1 text-[#ffaa00]">
                                  <MinecraftGoldIngotSVG className="w-3.5 h-3.5" />
                                  {sub.character.coins} 金币
                                </span>
                                <span className="text-gray-400">
                                  任务: {sub.tasks.length}个
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isCurrent && (
                              <button
                                onClick={() => handleRequestSwitch(sub.id)}
                                className="mc-btn mc-btn-diamond text-xs py-2 px-3 whitespace-nowrap"
                              >
                                切换登录
                              </button>
                            )}

                            {currentRole === 'main' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    pixelSound.playClick();
                                    setResetTargetSubId(sub.id);
                                  }}
                                  className="px-2.5 py-1.5 bg-[#2b2b18] text-[#ffaa00] border border-[#ffaa00] hover:bg-[#3d3d22] text-xs font-pixel flex items-center gap-1 transition-colors"
                                  title="重置该子账户的数据（等级/金币/打卡记录）"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>重置数据</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`确定要删除子账户【${sub.name}】吗？数据不可恢复！`)) {
                                      onDeleteSubAccount(sub.id);
                                      pixelSound.playClick();
                                    }
                                  }}
                                  className="p-2 text-gray-500 hover:text-[#ff5555] transition-colors"
                                  title="删除子账户"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD SUB ACCOUNT */}
        {activeTab === 'add_sub' && currentRole === 'main' && (
          <form onSubmit={handleCreateSubSubmit} className="space-y-5 font-pixel">
            <div>
              <label className="block text-xs text-gray-300 mb-1 font-bold">
                子账户名称 (学生/孩子姓名) *
              </label>
              <input
                type="text"
                required
                placeholder="例如：小明 / Alex / 迈克"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full bg-[#101014] text-white text-sm border-2 border-[#383842] p-2.5 focus:outline-none focus:border-[#ffaa00]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-2 font-bold">
                选择子账户专属图标/头像
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-10 h-10 text-xl flex items-center justify-center border-2 transition-transform ${
                      selectedAvatar === emoji
                        ? 'bg-[#2e8b2e] border-[#55ff55] scale-110 shadow'
                        : 'bg-[#101014] border-[#383842] hover:bg-[#202028]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#141418] p-3 border-2 border-[#383842] text-xs text-gray-300 space-y-1">
              <p className="text-[#55ff55] font-bold">💡 子账户专属说明：</p>
              <p>• 子账户拥有独立的角色等级、金币与换装衣服道具。</p>
              <p>• 子账户可以浏览并打卡完成学习计划任务，获得奖赏。</p>
              <p>• 子账户无法随意添加/删除任务或修改全局系统配置。</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('switch')}
                className="mc-btn flex-1 py-2 bg-[#333344] text-xs"
              >
                返回
              </button>
              <button type="submit" className="mc-btn mc-btn-gold flex-1 py-2 text-xs">
                创建子账户
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PIN SETTINGS */}
        {activeTab === 'pin_settings' && currentRole === 'main' && (
          <form onSubmit={handleSavePin} className="space-y-4 font-pixel">
            <div className="bg-[#141418] p-3 border-2 border-[#ffaa00] text-xs text-gray-300 space-y-1">
              <p className="text-[#ffaa00] font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 主账户 4 位 PIN 码锁
              </p>
              <p>
                设置 PIN 码后，从子账户切回主账户或修改系统数据时必须输入正确的 4 位 PIN 码，有效防止学生/孩子绕过权限。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  设置 4 位数字 PIN 码 (留空则清除)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="如 1234"
                  value={pinFormNew}
                  onChange={(e) => setPinFormNew(e.target.value)}
                  className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#55ffff]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">再次确认 4 位 PIN 码</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="再次输入"
                  value={pinFormConfirm}
                  onChange={(e) => setPinFormConfirm(e.target.value)}
                  className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#55ffff]"
                />
              </div>
            </div>

            {pinFormMsg && (
              <p
                className={`text-xs font-bold ${
                  pinFormMsg.type === 'success' ? 'text-[#55ff55]' : 'text-[#ff5555]'
                }`}
              >
                {pinFormMsg.text}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('switch')}
                className="mc-btn flex-1 py-2 bg-[#333344] text-xs"
              >
                返回
              </button>
              <button type="submit" className="mc-btn mc-btn-diamond flex-1 py-2 text-xs">
                保存 PIN 码设置
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
