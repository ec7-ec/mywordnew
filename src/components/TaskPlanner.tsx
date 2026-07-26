import React, { useState } from 'react';
import { StudyTask, TaskCategory, DifficultyLevel, AccountRole, SubAccountProfile } from '../types';
import { Plus, Search, CheckSquare, Square, Clock, Calendar, Sparkles, Trash2, ChevronDown, ChevronUp, Timer, Filter, AlertCircle, Lock, Users, CheckCircle2 } from 'lucide-react';
import { pixelSound } from '../utils/sound';
import { PomodoroTimerModal } from './PomodoroTimerModal';

interface Props {
  tasks: StudyTask[];
  currentRole?: AccountRole;
  activeAccountId?: string;
  subAccounts?: SubAccountProfile[];
  onAddTask: (task: Omit<StudyTask, 'id' | 'completed' | 'createdAt'>) => void;
  onToggleTask: (taskId: string, targetSubAccountId?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTaskWithBonus: (task: StudyTask, bonusMultiplier: number) => void;
  onRequestMainAccount?: () => void;
}

const CATEGORY_ICONS: Record<TaskCategory, string> = {
  数学: '📐',
  语文: '📖',
  英语: '🔤',
  编程: '💻',
  科学: '🧪',
  阅读: '📚',
  运动: '🏃',
  综合: '🛠️',
};

export const TaskPlanner: React.FC<Props> = ({
  tasks,
  currentRole = 'main',
  activeAccountId = 'main',
  subAccounts = [],
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onCompleteTaskWithBonus,
  onRequestMainAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<StudyTask | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [subAccountAlert, setSubAccountAlert] = useState(false);

  // New Task Form State
  const today = new Date().toISOString().split('T')[0];
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TaskCategory>('数学');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('medium');
  const [formDueDate, setFormDueDate] = useState(today);
  const [formDueTime, setFormDueTime] = useState('20:00');
  const [formDuration, setFormDuration] = useState(30);
  const [formNotes, setFormNotes] = useState('');

  // Calculate rewards preview based on difficulty & duration
  const getRewards = (difficulty: DifficultyLevel, duration: number) => {
    let baseExp = 100;
    let baseCoins = 30;

    switch (difficulty) {
      case 'easy':
        baseExp = 60;
        baseCoins = 15;
        break;
      case 'medium':
        baseExp = 120;
        baseCoins = 35;
        break;
      case 'hard':
        baseExp = 300;
        baseCoins = 80;
        break;
      case 'epic':
        baseExp = 600;
        baseCoins = 150;
        break;
    }

    const durationBonus = Math.floor(duration / 15) * 10;
    return {
      exp: baseExp + durationBonus,
      coins: baseCoins + Math.floor(durationBonus / 2),
    };
  };

  const isTaskCompletedBySub = (task: StudyTask, subId: string) => {
    return !!(task.subCompletions?.[subId]?.completed);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const rewards = getRewards(formDifficulty, formDuration);

    onAddTask({
      title: formTitle.trim(),
      category: formCategory,
      difficulty: formDifficulty,
      dueDate: formDueDate,
      dueTime: formDueTime,
      durationMinutes: Number(formDuration),
      expReward: rewards.exp,
      coinReward: rewards.coins,
      notes: formNotes.trim() || undefined,
    });

    pixelSound.playClick();
    setIsCreateModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormNotes('');
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search query
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }

    const taskDone =
      currentRole === 'sub'
        ? isTaskCompletedBySub(t, activeAccountId)
        : subAccounts.length > 0 && subAccounts.every((s) => isTaskCompletedBySub(t, s.id));

    // Tab filter
    if (activeTab === 'today') {
      return t.dueDate === today;
    }
    if (activeTab === 'pending') {
      return !taskDone;
    }
    if (activeTab === 'completed') {
      return taskDone;
    }
    return true;
  });

  const previewRewards = getRewards(formDifficulty, formDuration);

  // Get status badge for task
  const getDueDateStatus = (task: StudyTask) => {
    if (task.completed) return null;
    const isToday = task.dueDate === today;
    const taskDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
    const now = new Date();

    if (taskDateTime < now) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-[#ff5555] bg-[#330000] px-2 py-0.5 border border-[#ff5555]">
          <AlertCircle className="w-3 h-3" /> 已逾期
        </span>
      );
    }
    if (isToday) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-[#ffaa00] bg-[#332200] px-2 py-0.5 border border-[#ffaa00]">
          <Clock className="w-3 h-3" /> 今天截止
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-gray-300 bg-[#222230] px-2 py-0.5 border border-[#444455]">
        <Calendar className="w-3 h-3" /> {task.dueDate}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy':
        return <span className="bg-[#143d14] text-[#55ff55] border border-[#55ff55] text-[10px] font-pixel px-2 py-0.5">普通 (绿宝石)</span>;
      case 'medium':
        return <span className="bg-[#3d2f00] text-[#ffaa00] border border-[#ffaa00] text-[10px] font-pixel px-2 py-0.5">进阶 (金锭)</span>;
      case 'hard':
        return <span className="bg-[#003d3d] text-[#55ffff] border border-[#55ffff] text-[10px] font-pixel px-2 py-0.5">困难 (钻石)</span>;
      case 'epic':
        return <span className="bg-[#3d003d] text-[#ff55ff] border border-[#ff55ff] text-[10px] font-pixel px-2 py-0.5 animate-pulse">史诗 (下界之星)</span>;
    }
  };

  return (
    <div className="mc-panel-dark p-4 md:p-6 shadow-2xl">
      {/* Top Header & Task Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#383842]">
        <div>
          <h2 className="text-xl sm:text-2xl font-mc-title font-bold text-[#ffff55] mc-text-shadow flex items-center gap-2">
            <span>📋</span> 学习计划列表 (Task Quest)
          </h2>
          <p className="text-xs text-gray-400 font-pixel mt-1">
            安排每日学习任务，完成即可收获 EXP 经验值与金币奖励！
          </p>
        </div>

        {/* Create Task Button */}
        {currentRole === 'sub' ? (
          <button
            onClick={() => {
              pixelSound.playClick();
              setSubAccountAlert(true);
            }}
            className="mc-btn bg-[#2a2a38] text-gray-300 border-2 border-[#555566] flex items-center gap-2 py-2.5 px-4 text-sm whitespace-nowrap shadow"
            title="子账户无法创建任务，请切换主账户"
          >
            <Lock className="w-4 h-4 text-[#ffaa00]" />
            <span>新建学习任务 (需主账户)</span>
          </button>
        ) : (
          <button
            onClick={() => {
              pixelSound.playClick();
              setIsCreateModalOpen(true);
            }}
            className="mc-btn mc-btn-primary flex items-center gap-2 py-2.5 px-4 text-sm whitespace-nowrap shadow-lg"
          >
            <Plus className="w-5 h-5" /> 新建学习任务
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center mb-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#101014] p-1 border-2 border-[#383842]">
          {[
            { key: 'all', label: '全部任务' },
            { key: 'today', label: '今天计划' },
            { key: 'pending', label: '未完成' },
            { key: 'completed', label: '已完成' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                pixelSound.playClick();
                setActiveTab(tab.key as any);
              }}
              className={`px-3 py-1.5 font-pixel text-xs transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#2e8b2e] text-white border border-[#55ff55] font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#202028]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter & Search Box */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#101014] text-white font-pixel text-xs border-2 border-[#383842] px-3 py-2 focus:outline-none focus:border-[#55ff55]"
          >
            <option value="all">所有学科</option>
            {Object.keys(CATEGORY_ICONS).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat as TaskCategory]} {cat}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜索任务名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#101014] text-white font-pixel text-xs border-2 border-[#383842] pl-9 pr-3 py-2 w-full sm:w-48 focus:outline-none focus:border-[#55ff55]"
            />
          </div>
        </div>
      </div>

      {/* Main Account Banner */}
      {currentRole === 'main' && (
        <div className="bg-[#141820] border-2 border-[#ffaa00] p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-pixel">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <div>
              <p className="text-[#ffaa00] font-bold text-sm">主账户计划任务发布与多维度管理中心</p>
              <p className="text-gray-400 text-[11px] mt-0.5">
                主账户发布的任务将实时同步至所有子账户。主账户无需亲自打卡完成，可在此直接跟进查看各个孩子的完成进度。
              </p>
            </div>
          </div>
          <div className="bg-[#20202a] px-3 py-1.5 border border-[#444458] text-gray-300 whitespace-nowrap text-xs">
            已关联子账户: <span className="text-[#55ff55] font-bold">{subAccounts.length}</span> 人
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-[#141418] border-2 border-dashed border-[#383842] p-6">
            <div className="text-4xl mb-3">🗡️</div>
            <h3 className="font-mc-title text-gray-300 text-lg mb-1">暂无匹配的学习任务</h3>
            <p className="text-xs text-gray-500 font-pixel">
              点击右上角“新建学习任务”按钮发布学习计划，各子账户将即刻同步接收！
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSubRole = currentRole === 'sub';
            const isCompletedForCurrentRole = isSubRole
              ? isTaskCompletedBySub(task, activeAccountId)
              : subAccounts.length > 0 && subAccounts.every((s) => isTaskCompletedBySub(task, s.id));

            return (
              <div
                key={task.id}
                className={`mc-panel-dark p-4 border-2 transition-all ${
                  isCompletedForCurrentRole
                    ? 'bg-[#101014]/60 border-[#2a2a33] opacity-75'
                    : 'bg-[#181820] border-[#383848] hover:border-[#55ff55]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Checkbox or Main Role Icon & Task Info */}
                  <div className="flex items-start gap-3 flex-1">
                    {isSubRole ? (
                      <button
                        onClick={() => {
                          const isDone = isTaskCompletedBySub(task, activeAccountId);
                          if (!isDone) {
                            pixelSound.playCoin();
                          } else {
                            pixelSound.playClick();
                          }
                          onToggleTask(task.id);
                        }}
                        className="mt-0.5 text-[#55ff55] hover:scale-110 transition-transform"
                        title={
                          isTaskCompletedBySub(task, activeAccountId)
                            ? '点击取消打卡'
                            : '点击打卡完成任务'
                        }
                      >
                        {isTaskCompletedBySub(task, activeAccountId) ? (
                          <CheckSquare className="w-6 h-6 text-[#55ff55]" />
                        ) : (
                          <Square className="w-6 h-6 text-gray-500 hover:text-[#55ff55]" />
                        )}
                      </button>
                    ) : (
                      <div
                        className="mt-0.5 p-1 bg-[#202028] border border-[#ffaa00] text-[#ffaa00] rounded-none"
                        title="主账户管理视图"
                      >
                        <Users className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Category Tag */}
                        <span className="bg-[#2a2a38] text-gray-200 border border-[#444458] text-[10px] font-pixel px-2 py-0.5">
                          {CATEGORY_ICONS[task.category]} {task.category}
                        </span>

                        {/* Difficulty Badge */}
                        {getDifficultyBadge(task.difficulty)}

                        {/* Due Date Status */}
                        {getDueDateStatus(task)}
                      </div>

                      <h3
                        className={`font-pixel font-bold text-sm sm:text-base ${
                          isCompletedForCurrentRole ? 'line-through text-gray-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Reward preview info */}
                      <div className="flex items-center gap-4 mt-2 text-xs font-pixel text-gray-400">
                        <span className="flex items-center gap-1 text-[#55ff55]">
                          <Sparkles className="w-3.5 h-3.5" /> +{task.expReward} EXP
                        </span>
                        <span className="flex items-center gap-1 text-[#ffaa00]">
                          🪙 +{task.coinReward} 金币
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          ⏱️ {task.durationMinutes} 分钟
                        </span>
                      </div>

                      {/* Task Notes Accordion */}
                      {task.notes && (
                        <div className="mt-2">
                          <button
                            onClick={() =>
                              setExpandedNoteId(expandedNoteId === task.id ? null : task.id)
                            }
                            className="text-[11px] font-pixel text-gray-400 hover:text-white flex items-center gap-1"
                          >
                            {expandedNoteId === task.id ? (
                              <>
                                <ChevronUp className="w-3 h-3" /> 收起备注
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" /> 查看备注与重点
                              </>
                            )}
                          </button>
                          {expandedNoteId === task.id && (
                            <p className="text-xs font-pixel bg-[#101014] p-2 mt-1 border border-[#303040] text-gray-300">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Actions */}
                  <div className="flex items-center gap-2">
                    {currentRole === 'sub' && !isCompletedForCurrentRole && (
                      <button
                        onClick={() => {
                          pixelSound.playClick();
                          setFocusTask(task);
                        }}
                        className="mc-btn mc-btn-gold p-2 text-xs flex items-center gap-1"
                        title="开启专注计时器"
                      >
                        <Timer className="w-4 h-4" />
                        <span className="hidden sm:inline">专注</span>
                      </button>
                    )}

                    {currentRole === 'main' && (
                      <button
                        onClick={() => {
                          pixelSound.playClick();
                          onDeleteTask(task.id);
                        }}
                        className="p-2 text-gray-500 hover:text-[#ff5555] transition-colors"
                        title="删除任务"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Account View: Sub-accounts completion breakdown */}
                {currentRole === 'main' && (
                  <div className="mt-3 pt-3 border-t border-[#303040] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-400 font-pixel font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#ffaa00]" /> 各孩子打卡状态:
                      </span>

                      {subAccounts.length === 0 ? (
                        <span className="text-xs text-gray-500 font-pixel italic">
                          尚未创建子账户，新建子账户后可在此实时跟踪打卡进度
                        </span>
                      ) : (
                        subAccounts.map((sub) => {
                          const isDone = isTaskCompletedBySub(task, sub.id);
                          const doneTime = task.subCompletions?.[sub.id]?.completedAt;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                pixelSound.playClick();
                                onToggleTask(task.id, sub.id);
                              }}
                              className={`px-2.5 py-1 text-xs font-pixel border flex items-center gap-1.5 transition-all ${
                                isDone
                                  ? 'bg-[#1a3a1a] text-[#55ff55] border-[#55ff55] shadow'
                                  : 'bg-[#181820] text-gray-400 border-[#444455] hover:border-gray-300'
                              }`}
                              title={`点击代为标记/修改 ${sub.name} 的完成状态`}
                            >
                              <span>{sub.avatarIcon}</span>
                              <span className="font-bold">{sub.name}:</span>
                              <span>{isDone ? '✅ 已打卡' : '⏳ 待完成'}</span>
                              {isDone && doneTime && (
                                <span className="text-[10px] text-gray-400">
                                  ({doneTime.slice(11, 16)})
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {subAccounts.length > 0 && (
                      <div className="text-xs font-pixel text-[#ffaa00] bg-[#221c00] px-2.5 py-0.5 border border-[#ffaa00] self-start sm:self-auto">
                        完成度: {subAccounts.filter((s) => isTaskCompletedBySub(task, s.id)).length} / {subAccounts.length} 孩子
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="mc-panel-dark max-w-lg w-full p-6 relative border-4 border-[#ffaa00] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-mc-title text-[#ffaa00] mc-text-shadow mb-4 pb-2 border-b-2 border-[#383842]">
              ⚔️ 创造新学习任务 (New Quest)
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4 font-pixel text-xs">
              <div>
                <label className="block text-gray-300 mb-1">任务标题与学习内容 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：背诵英语单词50个 / 做数学第一章错题"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">学科分类</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                  >
                    {Object.keys(CATEGORY_ICONS).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat as TaskCategory]} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">任务难度级别</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                  >
                    <option value="easy">普通 (绿宝石 60+ EXP)</option>
                    <option value="medium">进阶 (金锭 120+ EXP)</option>
                    <option value="hard">困难 (钻石 300+ EXP)</option>
                    <option value="epic">史诗 (下界之星 600+ EXP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">截止日期</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">截止时间</label>
                  <input
                    type="time"
                    required
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">预估时长(分)</label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">任务细节或备忘（可选）</label>
                <textarea
                  rows={2}
                  placeholder="记录重点题目页码、相关资料链接或要点..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#101014] text-white border-2 border-[#383842] p-2 focus:outline-none focus:border-[#ffaa00]"
                />
              </div>

              {/* Estimated Rewards Banner */}
              <div className="bg-[#141418] p-3 border-2 border-[#2e8b2e] flex items-center justify-between text-xs">
                <span className="text-gray-300">预计完成奖励:</span>
                <div className="flex gap-3">
                  <span className="text-[#55ff55] font-bold">
                    ✨ +{previewRewards.exp} EXP
                  </span>
                  <span className="text-[#ffaa00] font-bold">
                    🪙 +{previewRewards.coins} 金币
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="mc-btn flex-1 py-2 bg-[#333344]"
                >
                  取消
                </button>
                <button type="submit" className="mc-btn mc-btn-primary flex-1 py-2">
                  发布任务
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POMODORO TIMER MODAL */}
      {focusTask && (
        <PomodoroTimerModal
          task={focusTask}
          isOpen={!!focusTask}
          onClose={() => setFocusTask(null)}
          onCompleteTaskWithBonus={onCompleteTaskWithBonus}
        />
      )}

      {/* SUB-ACCOUNT RESTRICTION ALERT */}
      {subAccountAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="mc-panel-dark max-w-sm w-full p-6 text-center border-4 border-[#ffaa00] shadow-2xl">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="text-lg font-mc-title font-bold text-[#ffaa00] mc-text-shadow mb-2">
              子账户权限限制
            </h3>
            <p className="text-xs font-pixel text-gray-300 mb-4 leading-relaxed">
              当前处于【子账户模式】。子账户专注于独立完成学习计划与购买道具。如需新建或删除任务，请请家长/教师点击顶部账户按钮切换回【主账户】。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSubAccountAlert(false)}
                className="mc-btn flex-1 py-2 text-xs bg-[#333344]"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
