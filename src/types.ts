export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'epic';

export type TaskCategory = '数学' | '语文' | '英语' | '编程' | '科学' | '阅读' | '运动' | '综合';

export interface TaskSubCompletion {
  completed: boolean;
  completedAt?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  category: TaskCategory;
  difficulty: DifficultyLevel;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  durationMinutes: number;
  expReward: number;
  coinReward: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  notes?: string;
  subCompletions?: Record<string, TaskSubCompletion>;
}

export type ItemCategory =
  | 'helmet'      // 头盔
  | 'chestplate'  // 胸甲
  | 'leggings'    // 护腿
  | 'boots'       // 靴子
  | 'melee'       // 近战武器 (剑 / 三叉戟)
  | 'ranged'      // 远程武器 (弓 / 弩)
  | 'background'  // 探险背景
  | 'ore'         // 矿石合成材料
  | 'hat'         // Legacy
  | 'outfit'      // Legacy
  | 'item';       // Legacy

export type MaterialTier = 'wood' | 'gold' | 'stone' | 'iron' | 'diamond' | 'netherite' | 'special';

export type WeaponSubtype = 'sword' | 'trident' | 'bow' | 'crossbow';

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  icon: string; // Emoji or SVG representation
  color: string;
  description: string;
  tier?: MaterialTier;
  subtype?: WeaponSubtype;
  previewStyle?: {
    headBg?: string;
    bodyBg?: string;
    itemBg?: string;
    canvasBg?: string;
  };
}

export interface CharacterEquipped {
  helmet?: string | null;
  chestplate?: string | null;
  leggings?: string | null;
  boots?: string | null;
  melee?: string | null;
  ranged?: string | null;
  background?: string | null;
  // Legacy compatibility fields
  hat?: string | null;
  outfit?: string | null;
  item?: string | null;
}

export interface CharacterStats {
  strength: number;    // From completed tasks
  intelligence: number; // From hard/epic tasks
  focus: number;       // From study hours
  defense: number;     // From streak days
}

export interface CharacterState {
  name: string;
  title: string;
  level: number;
  exp: number;
  maxExp: number;
  health: number;
  maxHealth: number;
  coins: number;
  equipped: CharacterEquipped;
  inventory: string[]; // List of owned item IDs
  ores?: Record<string, number>; // Record of owned ore counts (e.g. { wood: 4, gold: 0, stone: 0, iron: 0, diamond: 0, netherite: 0 })
  stats: CharacterStats;
  streakDays: number;
  lastActiveDate: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardCoins: number;
  rewardExp: number;
  conditionType: 'task_count' | 'level' | 'coins' | 'streak' | 'epic_task' | 'shop_buy' | 'focus_time';
  targetValue: number;
  currentValue: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  expGained: number;
  coinsGained: number;
  tasksCompleted: number;
  minutesStudied: number;
}

export type AccountRole = 'main' | 'sub';

export interface SubAccountProfile {
  id: string;
  name: string;
  avatarIcon: string;
  character: CharacterState;
  tasks: StudyTask[];
  achievements: Achievement[];
  dailyHistory: DailyActivity[];
  createdAt: string;
}

export interface AccountState {
  activeAccountId: string; // 'main' or sub-account id
  mainPin: string | null; // 4-digit PIN for main account
  subAccounts: SubAccountProfile[];
}

export interface CustomReward {
  id: string;
  title: string;
  icon: string;
  price: number;
  description: string;
  createdAt: string;
}

export interface RedeemedRewardTicket {
  id: string;
  rewardId: string;
  rewardTitle: string;
  rewardIcon: string;
  costCoins: number;
  subAccountId: string;
  subAccountName: string;
  redeemedAt: string;
  fulfilled: boolean;
  fulfilledAt?: string;
}

export interface AppData {
  accountState: AccountState;
  character: CharacterState;
  tasks: StudyTask[];
  achievements: Achievement[];
  dailyHistory: DailyActivity[];
  customRewards?: CustomReward[];
  redeemedTickets?: RedeemedRewardTicket[];
  settings: {
    darkMode: boolean;
    soundEnabled: boolean;
    syncCode: string | null;
    lastSyncedAt: string | null;
  };
}
