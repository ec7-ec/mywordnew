import React from 'react';
import { StudyTask, DailyActivity, SubAccountProfile } from '../types';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Award, Clock, BookOpen, Sparkles, Users, CheckCircle2 } from 'lucide-react';

interface Props {
  tasks: StudyTask[];
  dailyHistory: DailyActivity[];
  activeAccountId?: string;
  subAccounts?: SubAccountProfile[];
}

const CATEGORY_COLORS: Record<string, string> = {
  数学: '#55ff55',
  语文: '#ffaa00',
  英语: '#55ffff',
  编程: '#ff55ff',
  科学: '#ffff55',
  阅读: '#ff5555',
  运动: '#aa00aa',
  综合: '#aaaaaa',
};

export const AnalyticsCharts: React.FC<Props> = ({
  tasks,
  dailyHistory,
  activeAccountId = 'main',
  subAccounts = [],
}) => {
  const isMainRole = activeAccountId === 'main';

  const isTaskCompleted = (t: StudyTask) => {
    if (isMainRole) {
      return t.completed || Object.values(t.subCompletions || {}).some((s) => s.completed);
    }
    return !!t.subCompletions?.[activeAccountId]?.completed || t.completed;
  };

  // Compute category breakdown data for Pie Chart
  const categoryMap: Record<string, number> = {};
  tasks.forEach((t) => {
    if (isTaskCompleted(t)) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    }
  });

  const categoryPieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // KPI Calculations
  const totalCompletedTasks = tasks.filter((t) => isTaskCompleted(t)).length;
  const totalStudyMinutes = tasks
    .filter((t) => isTaskCompleted(t))
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  // Prepare fallback last 7 days history if dailyHistory is small
  const chartData = dailyHistory.slice(-14).map((d) => ({
    date: d.date.slice(5), // MM-DD
    exp: d.expGained,
    coins: d.coinsGained,
    minutes: d.minutesStudied,
    tasks: d.tasksCompleted,
  }));

  return (
    <div className="mc-panel-dark p-4 md:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b-2 border-[#383842]">
        <h2 className="text-xl sm:text-2xl font-mc-title font-bold text-[#55ffff] mc-text-shadow flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#55ffff]" /> {isMainRole ? '👑 主账户管理控制台：子账户进度看板' : '学习数据分析仪表盘 (Study Analytics)'}
        </h2>
        <p className="text-xs text-gray-400 font-pixel mt-1">
          {isMainRole
            ? '实时跟进查看各个关联孩子的任务完成率、累计打卡数、等级提升与专注学习数据。'
            : '直观的像素可视化图表，追踪你的每日 EXP 经验增长、学科分布与专注时长趋势。'}
        </p>
      </div>

      {/* Main Account Exclusive: Sub-Accounts Completion Progress Cards */}
      {isMainRole && (
        <div className="bg-[#141822] p-4 border-2 border-[#ffaa00] font-pixel">
          <h3 className="font-pixel text-sm font-bold text-[#ffaa00] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ffaa00]" /> 各孩子任务完成进度概览
          </h3>

          {subAccounts.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs bg-[#101014] p-4 border border-[#303040]">
              <span>👦 暂无已关联的子账户。在顶部“账户管理”添加子账户后，可在此实时跟进其完成进度！</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subAccounts.map((sub) => {
                const subCompletedCount = tasks.filter((t) => t.subCompletions?.[sub.id]?.completed).length;
                const totalTasksCount = tasks.length;
                const progressPct = totalTasksCount > 0 ? Math.round((subCompletedCount / totalTasksCount) * 100) : 0;
                const char = sub.character;

                return (
                  <div key={sub.id} className="bg-[#101014] p-3 border border-[#383848] space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#282838]">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sub.avatarIcon}</span>
                        <div>
                          <div className="font-bold text-white text-sm">{sub.name}</div>
                          <div className="text-[10px] text-gray-400">
                            Lv.{char?.level || 1} ({char?.exp || 0} EXP) • 🪙 {char?.coins || 0}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#55ff55] bg-[#1a331a] px-2 py-0.5 border border-[#55ff55]">
                        {progressPct}% 完成
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-300">
                        <span>已完成任务:</span>
                        <span className="font-bold text-[#ffaa00]">
                          {subCompletedCount} / {totalTasksCount} 个
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#20202a] h-3 border border-[#383848] relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#2e8b2e] to-[#55ff55] h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#141418] p-4 border-2 border-[#2e8b2e]">
          <div className="flex items-center gap-2 text-xs font-pixel text-gray-400 mb-1">
            <Award className="w-4 h-4 text-[#55ff55]" /> 累计完成任务
          </div>
          <div className="text-2xl font-pixel font-bold text-[#55ff55] mc-text-shadow">
            {totalCompletedTasks} <span className="text-xs font-normal text-gray-400">个</span>
          </div>
        </div>

        <div className="bg-[#141418] p-4 border-2 border-[#cc8800]">
          <div className="flex items-center gap-2 text-xs font-pixel text-gray-400 mb-1">
            <Clock className="w-4 h-4 text-[#ffaa00]" /> 专注学习时长
          </div>
          <div className="text-2xl font-pixel font-bold text-[#ffaa00] mc-text-shadow">
            {totalStudyMinutes} <span className="text-xs font-normal text-gray-400">分钟</span>
          </div>
        </div>

        <div className="bg-[#141418] p-4 border-2 border-[#008080]">
          <div className="flex items-center gap-2 text-xs font-pixel text-gray-400 mb-1">
            <Sparkles className="w-4 h-4 text-[#55ffff]" /> 经验金币收益
          </div>
          <div className="text-2xl font-pixel font-bold text-[#55ffff] mc-text-shadow">
            {chartData.reduce((acc, c) => acc + c.exp, 0)}{' '}
            <span className="text-xs font-normal text-gray-400">EXP</span>
          </div>
        </div>

        <div className="bg-[#141418] p-4 border-2 border-[#aa0000]">
          <div className="flex items-center gap-2 text-xs font-pixel text-gray-400 mb-1">
            <BookOpen className="w-4 h-4 text-[#ff5555]" /> 任务完成率
          </div>
          <div className="text-2xl font-pixel font-bold text-[#ff5555] mc-text-shadow">
            {tasks.length > 0 ? Math.round((totalCompletedTasks / tasks.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* EXP & Coins Trend Area Chart */}
        <div className="lg:col-span-8 bg-[#101014] p-4 border-2 border-[#383842]">
          <h3 className="font-pixel text-sm font-bold text-[#55ff55] mb-4 flex items-center gap-2">
            <span>📈</span> EXP 经验值与金币增长趋势 (EXP & Coins Trend)
          </h3>
          <div className="h-64 w-full font-pixel text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55ff55" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#55ff55" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" tick={{ fill: '#aaa', fontSize: 10 }} />
                <YAxis stroke="#888888" tick={{ fill: '#aaa', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    borderColor: '#55ff55',
                    color: '#fff',
                    fontFamily: 'Pixelify Sans',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="exp"
                  name="EXP 经验"
                  stroke="#55ff55"
                  fillOpacity={1}
                  fill="url(#expGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="coins"
                  name="金币 🪙"
                  stroke="#ffaa00"
                  fillOpacity={1}
                  fill="url(#coinGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-[#101014] p-4 border-2 border-[#383842] flex flex-col justify-between">
          <h3 className="font-pixel text-sm font-bold text-[#ffaa00] mb-2 flex items-center gap-2">
            <span>🍕</span> 完成任务学科分布 (Subject Breakdown)
          </h3>

          {categoryPieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-pixel text-xs text-center py-8">
              <span>📚 尚无已完成的任务数据</span>
              <span className="text-[10px] text-gray-600 mt-1">完成学习任务后即可在此查看统计</span>
            </div>
          ) : (
            <div className="h-56 w-full font-pixel text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || '#888888'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      borderColor: '#ffaa00',
                      color: '#fff',
                      fontFamily: 'Pixelify Sans',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Daily Study Minutes Bar Chart */}
      <div className="bg-[#101014] p-4 border-2 border-[#383842]">
        <h3 className="font-pixel text-sm font-bold text-[#55ffff] mb-4 flex items-center gap-2">
          <span>⏱️</span> 每日专注学习时长 (Study Duration)
        </h3>
        <div className="h-52 w-full font-pixel text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" stroke="#888888" tick={{ fill: '#aaa', fontSize: 10 }} />
              <YAxis stroke="#888888" tick={{ fill: '#aaa', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  borderColor: '#55ffff',
                  color: '#fff',
                  fontFamily: 'Pixelify Sans',
                }}
              />
              <Bar dataKey="minutes" name="专注分钟" fill="#55ffff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
