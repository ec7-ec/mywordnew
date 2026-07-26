import React, { useState, useEffect } from 'react';
import {
  AppData,
  StudyTask,
  ShopItem,
  ItemCategory,
  AccountRole,
  SubAccountProfile,
  CustomReward,
  RedeemedRewardTicket,
  MaterialTier,
} from './types';
import {
  INITIAL_CHARACTER,
  INITIAL_TASKS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CUSTOM_REWARDS,
  ORE_ITEMS,
  calculateLevelName,
} from './data/initialData';
import { PixelCharacter } from './components/PixelCharacter';
import { TaskPlanner } from './components/TaskPlanner';
import { ShopModal } from './components/ShopModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CloudSyncModal } from './components/CloudSyncModal';
import { AccountManagerModal } from './components/AccountManagerModal';
import { pixelSound } from './utils/sound';

import {
  ShoppingBag,
  Trophy,
  BarChart3,
  ListTodo,
  Cloud,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronDown,
  Sparkles,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mc_study_planner_save_v1';

export default function App() {
  // Main Application State
  const [appData, setAppData] = useState<AppData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            accountState: parsed.accountState || {
              activeAccountId: 'main',
              mainPin: null,
              subAccounts: [],
            },
            character: parsed.character
              ? {
                  ...parsed.character,
                  level: Math.max(100, parsed.character.level || 100),
                  title: calculateLevelName(Math.max(100, parsed.character.level || 100)),
                }
              : INITIAL_CHARACTER,
            tasks: parsed.tasks || INITIAL_TASKS,
            achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
            dailyHistory: parsed.dailyHistory || [],
            customRewards: parsed.customRewards || INITIAL_CUSTOM_REWARDS,
            redeemedTickets: parsed.redeemedTickets || [],
            settings: parsed.settings || {
              darkMode: true,
              soundEnabled: true,
              syncCode: null,
              lastSyncedAt: null,
            },
          };
        }
      } catch (err) {
        console.error('Failed to load local storage save:', err);
      }
    }
    return {
      accountState: {
        activeAccountId: 'main',
        mainPin: null,
        subAccounts: [],
      },
      character: INITIAL_CHARACTER,
      tasks: INITIAL_TASKS,
      achievements: INITIAL_ACHIEVEMENTS,
      dailyHistory: [],
      customRewards: INITIAL_CUSTOM_REWARDS,
      redeemedTickets: [],
      settings: {
        darkMode: true,
        soundEnabled: true,
        syncCode: null,
        lastSyncedAt: null,
      },
    };
  });

  // Modal Visibility States
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [activeView, setActiveView] = useState<'planner' | 'analytics'>('planner');

  // Level Up Toast
  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
    levelName: string;
  }>({ isOpen: false, oldLevel: 1, newLevel: 1, levelName: '' });

  // Sync dark mode class on root body
  useEffect(() => {
    if (appData.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    pixelSound.setMuted(!appData.settings.soundEnabled);
  }, [appData.settings.darkMode, appData.settings.soundEnabled]);

  // Save to LocalStorage on every state update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.error('Failed to write save to localStorage', e);
    }
  }, [appData]);

  // Active Account Selectors
  const activeAccountId = appData.accountState?.activeAccountId || 'main';
  const currentRole: AccountRole = activeAccountId === 'main' ? 'main' : 'sub';

  const currentSubProfile = (appData.accountState?.subAccounts || []).find(
    (s) => s.id === activeAccountId
  );

  const activeCharacter =
    activeAccountId === 'main' || !currentSubProfile
      ? appData.character
      : currentSubProfile.character;

  const activeTasks = appData.tasks;

  const activeAchievements =
    activeAccountId === 'main' || !currentSubProfile
      ? appData.achievements
      : currentSubProfile.achievements;

  const activeDailyHistory =
    activeAccountId === 'main' || !currentSubProfile
      ? appData.dailyHistory
      : currentSubProfile.dailyHistory;

  // Helper: Update Active Account Data (Main or Sub Account)
  const updateActiveAccount = (
    updater: (curr: {
      character: typeof appData.character;
      tasks: typeof appData.tasks;
      achievements: typeof appData.achievements;
      dailyHistory: typeof appData.dailyHistory;
    }) => {
      character: typeof appData.character;
      tasks: typeof appData.tasks;
      achievements: typeof appData.achievements;
      dailyHistory: typeof appData.dailyHistory;
    }
  ) => {
    setAppData((prev) => {
      const activeId = prev.accountState?.activeAccountId || 'main';
      if (activeId === 'main') {
        const updated = updater({
          character: prev.character,
          tasks: prev.tasks,
          achievements: prev.achievements,
          dailyHistory: prev.dailyHistory,
        });
        return {
          ...prev,
          character: updated.character,
          tasks: updated.tasks,
          achievements: updated.achievements,
          dailyHistory: updated.dailyHistory,
        };
      } else {
        const updatedSubs = (prev.accountState?.subAccounts || []).map((sub) => {
          if (sub.id === activeId) {
            const updated = updater({
              character: sub.character,
              tasks: sub.tasks,
              achievements: sub.achievements,
              dailyHistory: sub.dailyHistory,
            });
            return {
              ...sub,
              character: updated.character,
              tasks: updated.tasks,
              achievements: updated.achievements,
              dailyHistory: updated.dailyHistory,
            };
          }
          return sub;
        });
        return {
          ...prev,
          accountState: {
            ...prev.accountState,
            subAccounts: updatedSubs,
          },
        };
      }
    });
  };

  // Helper: Update Account Data by Account ID ('main' or sub-account ID)
  const updateAccountById = (
    accountId: string,
    updater: (curr: {
      character: typeof appData.character;
      achievements: typeof appData.achievements;
      dailyHistory: typeof appData.dailyHistory;
    }) => {
      character: typeof appData.character;
      achievements: typeof appData.achievements;
      dailyHistory: typeof appData.dailyHistory;
    }
  ) => {
    setAppData((prev) => {
      if (accountId === 'main') {
        const updated = updater({
          character: prev.character,
          achievements: prev.achievements,
          dailyHistory: prev.dailyHistory,
        });
        return {
          ...prev,
          character: updated.character,
          achievements: updated.achievements,
          dailyHistory: updated.dailyHistory,
        };
      } else {
        const updatedSubs = (prev.accountState?.subAccounts || []).map((sub) => {
          if (sub.id === accountId) {
            const updated = updater({
              character: sub.character,
              achievements: sub.achievements,
              dailyHistory: sub.dailyHistory,
            });
            return {
              ...sub,
              character: updated.character,
              achievements: updated.achievements,
              dailyHistory: updated.dailyHistory,
            };
          }
          return sub;
        });
        return {
          ...prev,
          accountState: {
            ...prev.accountState,
            subAccounts: updatedSubs,
          },
        };
      }
    });
  };

  // Helper: Add EXP and Coins to active account character
  const addExpAndCoins = (expToAdd: number, coinsToAdd: number) => {
    updateActiveAccount((curr) => {
      let { level, exp, maxExp, health, maxHealth, coins } = curr.character;
      let newExp = exp + expToAdd;
      let newCoins = coins + coinsToAdd;
      let newLevel = level;
      let newMaxExp = maxExp;
      let newHealth = health;
      let leveledUp = false;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = newLevel * 100;
        newHealth = maxHealth;
        leveledUp = true;
      }

      if (leveledUp) {
        pixelSound.playLevelUp();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
        setLevelUpModal({
          isOpen: true,
          oldLevel: level,
          newLevel,
          levelName: calculateLevelName(newLevel),
        });
      }

      return {
        ...curr,
        character: {
          ...curr.character,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          health: newHealth,
          coins: newCoins,
          title: calculateLevelName(newLevel),
        },
      };
    });
  };

  // Check achievements against active account state
  const checkAchievements = () => {
    updateActiveAccount((curr) => {
      const { character } = curr;
      const activeId = appData.accountState?.activeAccountId || 'main';
      const completedCount = appData.tasks.filter(
        (t) => t.subCompletions?.[activeId]?.completed
      ).length;
      const epicCount = appData.tasks.filter(
        (t) => t.subCompletions?.[activeId]?.completed && t.difficulty === 'epic'
      ).length;
      const ownedItemsCount = character.inventory.length;

      const updatedAchievements = curr.achievements.map((ach) => {
        if (ach.isUnlocked) return ach;

        let currentVal = ach.currentValue;
        switch (ach.conditionType) {
          case 'task_count':
            currentVal = completedCount;
            break;
          case 'level':
            currentVal = character.level;
            break;
          case 'coins':
            currentVal = character.coins;
            break;
          case 'streak':
            currentVal = character.streakDays;
            break;
          case 'epic_task':
            currentVal = epicCount;
            break;
          case 'shop_buy':
            currentVal = Math.max(0, ownedItemsCount - 4);
            break;
        }

        return {
          ...ach,
          currentValue: currentVal,
        };
      });

      return { ...curr, achievements: updatedAchievements };
    });
  };

  // Helper: Award task completion EXP, Coins, stats & history to a specific account
  const awardTaskRewardsToAccount = (accountId: string, task: StudyTask, bonusMultiplier = 1) => {
    const expToAdd = Math.round(task.expReward * bonusMultiplier);
    const coinsToAdd = Math.round(task.coinReward * bonusMultiplier);
    const todayStr = new Date().toISOString().split('T')[0];

    updateAccountById(accountId, (curr) => {
      let { level, exp, maxExp, health, maxHealth, coins } = curr.character;
      let newExp = exp + expToAdd;
      let newCoins = coins + coinsToAdd;
      let newLevel = level;
      let newMaxExp = maxExp;
      let newHealth = health;
      let leveledUp = false;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = newLevel * 100;
        newHealth = maxHealth;
        leveledUp = true;
      }

      if (leveledUp) {
        pixelSound.playLevelUp();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
        setLevelUpModal({
          isOpen: true,
          oldLevel: level,
          newLevel,
          levelName: calculateLevelName(newLevel),
        });
      }

      // Daily history
      const history = [...curr.dailyHistory];
      const existingIdx = history.findIndex((h) => h.date === todayStr);

      if (existingIdx >= 0) {
        history[existingIdx] = {
          ...history[existingIdx],
          expGained: history[existingIdx].expGained + expToAdd,
          coinsGained: history[existingIdx].coinsGained + coinsToAdd,
          tasksCompleted: history[existingIdx].tasksCompleted + 1,
          minutesStudied: history[existingIdx].minutesStudied + task.durationMinutes,
        };
      } else {
        history.push({
          date: todayStr,
          expGained: expToAdd,
          coinsGained: coinsToAdd,
          tasksCompleted: 1,
          minutesStudied: task.durationMinutes,
        });
      }

      const completedCount =
        appData.tasks.filter((t) => t.subCompletions?.[accountId]?.completed).length + 1;

      const updatedAchievements = curr.achievements.map((ach) => {
        if (ach.isUnlocked) return ach;
        let val = ach.currentValue;
        if (ach.conditionType === 'task_count') val = completedCount;
        if (ach.conditionType === 'level') val = newLevel;
        if (ach.conditionType === 'coins') val = newCoins;
        return { ...ach, currentValue: val };
      });

      return {
        character: {
          ...curr.character,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          health: newHealth,
          coins: newCoins,
          stats: {
            ...curr.character.stats,
            strength: curr.character.stats.strength + 1,
            intelligence:
              task.difficulty === 'hard' || task.difficulty === 'epic'
                ? curr.character.stats.intelligence + 1
                : curr.character.stats.intelligence,
            focus: curr.character.stats.focus + (bonusMultiplier > 1 ? task.durationMinutes : 0),
          },
          title: calculateLevelName(newLevel),
        },
        dailyHistory: history,
        achievements: updatedAchievements,
      };
    });
  };

  // Task Operations
  const handleAddTask = (newTaskData: Omit<StudyTask, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: StudyTask = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
      subCompletions: {},
    };

    setAppData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleToggleTask = (taskId: string, targetSubAccountId?: string) => {
    const effectiveSubId = targetSubAccountId || activeAccountId;
    let taskToToggle: StudyTask | undefined;
    let isNowCompleted = false;

    setAppData((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          taskToToggle = t;
          const currentStatus = !!t.subCompletions?.[effectiveSubId]?.completed;
          isNowCompleted = !currentStatus;

          return {
            ...t,
            subCompletions: {
              ...(t.subCompletions || {}),
              [effectiveSubId]: {
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date().toISOString() : undefined,
              },
            },
          };
        }
        return t;
      });

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });

    if (taskToToggle && isNowCompleted) {
      awardTaskRewardsToAccount(effectiveSubId, taskToToggle);
    }
  };

  const handleCompleteTaskWithBonus = (task: StudyTask, bonusMultiplier: number) => {
    const effectiveSubId = activeAccountId;

    setAppData((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === task.id) {
          return {
            ...t,
            subCompletions: {
              ...(t.subCompletions || {}),
              [effectiveSubId]: {
                completed: true,
                completedAt: new Date().toISOString(),
              },
            },
          };
        }
        return t;
      });

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });

    awardTaskRewardsToAccount(effectiveSubId, task, bonusMultiplier);
  };

  const handleDeleteTask = (taskId: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Shop & Ore Operations
  const handleBuyOre = (oreItem: ShopItem, count: number = 1) => {
    const isMain = currentRole === 'main';
    const totalCost = oreItem.price * count;
    if (!isMain && activeCharacter.coins < totalCost) return;

    const tier = oreItem.tier || 'wood';
    updateActiveAccount((curr) => {
      const currentOres = curr.character.ores || { wood: 0, gold: 0, stone: 0, iron: 0, diamond: 0, netherite: 0 };
      return {
        ...curr,
        character: {
          ...curr.character,
          coins: isMain ? curr.character.coins : curr.character.coins - totalCost,
          ores: {
            ...currentOres,
            [tier]: (currentOres[tier] || 0) + count,
          },
        },
      };
    });

    setTimeout(() => checkAchievements(), 300);
  };

  const handleCraftEquipment = (item: ShopItem) => {
    const isMain = currentRole === 'main';
    const tier = item.tier === 'special' ? 'diamond' : (item.tier || 'wood');

    updateActiveAccount((curr) => {
      const currentOres = curr.character.ores || { wood: 0, gold: 0, stone: 0, iron: 0, diamond: 0, netherite: 0 };
      const availableOres = currentOres[tier] || 0;
      if (!isMain && availableOres < 4) return curr;

      return {
        ...curr,
        character: {
          ...curr.character,
          ores: {
            ...currentOres,
            [tier]: isMain ? availableOres : Math.max(0, availableOres - 4),
          },
          inventory: curr.character.inventory.includes(item.id)
            ? curr.character.inventory
            : [...curr.character.inventory, item.id],
          equipped: {
            ...curr.character.equipped,
            [item.category]: item.id,
          },
        },
      };
    });

    setTimeout(() => checkAchievements(), 300);
  };

  const handleBuyAndCraft = (item: ShopItem) => {
    const isMain = currentRole === 'main';
    const tier = item.tier === 'special' ? 'diamond' : (item.tier || 'wood');
    
    const oreItem = ORE_ITEMS.find((o) => o.tier === tier) || ORE_ITEMS[0];

    updateActiveAccount((curr) => {
      const currOres = curr.character.ores || { wood: 0, gold: 0, stone: 0, iron: 0, diamond: 0, netherite: 0 };
      const curTierCount = currOres[tier] || 0;
      const needToBuy = Math.max(0, 4 - curTierCount);
      const cost = needToBuy * oreItem.price;

      if (!isMain && curr.character.coins < cost) return curr;

      return {
        ...curr,
        character: {
          ...curr.character,
          coins: isMain ? curr.character.coins : curr.character.coins - cost,
          ores: {
            ...currOres,
            [tier]: isMain ? curTierCount : Math.max(0, curTierCount + needToBuy - 4),
          },
          inventory: curr.character.inventory.includes(item.id)
            ? curr.character.inventory
            : [...curr.character.inventory, item.id],
          equipped: {
            ...curr.character.equipped,
            [item.category]: item.id,
          },
        },
      };
    });

    setTimeout(() => checkAchievements(), 300);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (item.category === 'ore') {
      handleBuyOre(item, 1);
    } else if (item.category === 'background') {
      const isMain = currentRole === 'main';
      if (!isMain && activeCharacter.coins < item.price) return;

      updateActiveAccount((curr) => ({
        ...curr,
        character: {
          ...curr.character,
          coins: isMain ? curr.character.coins : curr.character.coins - item.price,
          inventory: curr.character.inventory.includes(item.id)
            ? curr.character.inventory
            : [...curr.character.inventory, item.id],
          equipped: {
            ...curr.character.equipped,
            [item.category]: item.id,
          },
        },
      }));
      setTimeout(() => checkAchievements(), 300);
    } else {
      handleCraftEquipment(item);
    }
  };

  // Custom Reward Handlers
  const handleAddCustomReward = (reward: Omit<CustomReward, 'id' | 'createdAt'>) => {
    const newReward: CustomReward = {
      ...reward,
      id: `custom_reward_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAppData((prev) => ({
      ...prev,
      customRewards: [newReward, ...(prev.customRewards || INITIAL_CUSTOM_REWARDS)],
    }));
  };

  const handleDeleteCustomReward = (rewardId: string) => {
    setAppData((prev) => ({
      ...prev,
      customRewards: (prev.customRewards || INITIAL_CUSTOM_REWARDS).filter((r) => r.id !== rewardId),
    }));
  };

  const handleRedeemCustomReward = (reward: CustomReward) => {
    if (activeCharacter.coins < reward.price) return;

    // Deduct coins from active sub account
    updateActiveAccount((curr) => ({
      ...curr,
      character: {
        ...curr.character,
        coins: curr.character.coins - reward.price,
      },
    }));

    // Create ticket log
    const newTicket: RedeemedRewardTicket = {
      id: `ticket_${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardIcon: reward.icon,
      costCoins: reward.price,
      subAccountId: activeAccountId,
      subAccountName: activeCharacter.name || currentSubProfile?.name || '学员',
      redeemedAt: new Date().toISOString(),
      fulfilled: false,
    };

    setAppData((prev) => ({
      ...prev,
      redeemedTickets: [newTicket, ...(prev.redeemedTickets || [])],
    }));

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleFulfillTicket = (ticketId: string) => {
    setAppData((prev) => ({
      ...prev,
      redeemedTickets: (prev.redeemedTickets || []).map((t) =>
        t.id === ticketId ? { ...t, fulfilled: true, fulfilledAt: new Date().toISOString() } : t
      ),
    }));
  };

  const handleEquipItem = (item: ShopItem) => {
    updateActiveAccount((curr) => ({
      ...curr,
      character: {
        ...curr.character,
        equipped: {
          ...curr.character.equipped,
          [item.category]: item.id,
        },
      },
    }));
  };

  const handleUnequipItem = (category: ItemCategory) => {
    updateActiveAccount((curr) => ({
      ...curr,
      character: {
        ...curr.character,
        equipped: {
          ...curr.character.equipped,
          [category]: null,
        },
      },
    }));
  };

  // Claim Achievement Reward
  const handleClaimReward = (achievementId: string) => {
    const ach = activeAchievements.find((a) => a.id === achievementId);
    if (!ach || ach.isUnlocked) return;

    updateActiveAccount((curr) => ({
      ...curr,
      achievements: curr.achievements.map((a) =>
        a.id === achievementId ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a
      ),
    }));

    addExpAndCoins(ach.rewardExp, ach.rewardCoins);
  };

  // Character Name Update
  const handleUpdateName = (newName: string) => {
    updateActiveAccount((curr) => ({
      ...curr,
      character: { ...curr.character, name: newName },
    }));
  };

  // Account Operations
  const handleSwitchAccount = (accountId: string, pinInput?: string): boolean => {
    if (
      accountId === 'main' &&
      currentRole === 'sub' &&
      appData.accountState?.mainPin
    ) {
      if (pinInput !== appData.accountState.mainPin) {
        return false;
      }
    }

    setAppData((prev) => ({
      ...prev,
      accountState: {
        ...prev.accountState,
        activeAccountId: accountId,
      },
    }));
    pixelSound.playLevelUp();
    return true;
  };

  const handleCreateSubAccount = (name: string, avatarIcon: string) => {
    const newSubId = `sub_${Date.now()}`;
    const newSub: SubAccountProfile = {
      id: newSubId,
      name,
      avatarIcon,
      character: {
        ...INITIAL_CHARACTER,
        coins: 0,
        name: `${name}方块人`,
      },
      tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
      achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
      dailyHistory: [],
      createdAt: new Date().toISOString(),
    };

    setAppData((prev) => ({
      ...prev,
      accountState: {
        ...prev.accountState,
        subAccounts: [...(prev.accountState?.subAccounts || []), newSub],
      },
    }));
  };

  const handleDeleteSubAccount = (subAccountId: string) => {
    setAppData((prev) => {
      const nextSubs = (prev.accountState?.subAccounts || []).filter(
        (s) => s.id !== subAccountId
      );
      const nextActiveId =
        prev.accountState?.activeAccountId === subAccountId
          ? 'main'
          : prev.accountState?.activeAccountId || 'main';

      return {
        ...prev,
        accountState: {
          ...prev.accountState,
          activeAccountId: nextActiveId,
          subAccounts: nextSubs,
        },
      };
    });
  };

  const handleResetSubAccount = (
    subAccountId: string,
    options: { resetCharacter?: boolean; resetTasks?: boolean; resetHistory?: boolean } = {
      resetCharacter: true,
      resetTasks: true,
      resetHistory: true,
    }
  ) => {
    setAppData((prev) => {
      const updatedSubs = (prev.accountState?.subAccounts || []).map((sub) => {
        if (sub.id === subAccountId) {
          const resetChar = options.resetCharacter !== false;
          const resetHist = options.resetHistory !== false;
          const resetTasksOpt = options.resetTasks !== false;

          return {
            ...sub,
            character: resetChar
              ? {
                  ...INITIAL_CHARACTER,
                  name: sub.character?.name || `${sub.name}方块人`,
                }
              : sub.character,
            achievements: resetChar
              ? JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS))
              : sub.achievements,
            dailyHistory: resetHist ? [] : sub.dailyHistory,
            tasks: resetTasksOpt ? JSON.parse(JSON.stringify(INITIAL_TASKS)) : sub.tasks,
          };
        }
        return sub;
      });

      // Reset task subCompletions if requested
      const updatedTasks = options.resetTasks !== false
        ? prev.tasks.map((t) => {
            if (t.subCompletions && t.subCompletions[subAccountId]) {
              const nextCompletions = { ...t.subCompletions };
              delete nextCompletions[subAccountId];
              return { ...t, subCompletions: nextCompletions };
            }
            return t;
          })
        : prev.tasks;

      // Clean up redeemed tickets for this sub-account if character reset
      const updatedTickets = options.resetCharacter !== false
        ? (prev.redeemedTickets || []).filter((t) => t.subAccountId !== subAccountId)
        : prev.redeemedTickets;

      return {
        ...prev,
        tasks: updatedTasks,
        redeemedTickets: updatedTickets,
        accountState: {
          ...prev.accountState,
          subAccounts: updatedSubs,
        },
      };
    });

    pixelSound.playLevelUp();
  };

  const handleSetMainPin = (pin: string | null) => {
    setAppData((prev) => ({
      ...prev,
      accountState: {
        ...prev.accountState,
        mainPin: pin,
      },
    }));
  };

  // Toggle Dark Mode / Sound
  const toggleDarkMode = () => {
    pixelSound.playClick();
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode },
    }));
  };

  const toggleSound = () => {
    const nextSound = !appData.settings.soundEnabled;
    pixelSound.setMuted(!nextSound);
    if (nextSound) pixelSound.playClick();
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, soundEnabled: nextSound },
    }));
  };

  // Restore & Reset Data
  const handleRestoreData = (newData: AppData) => {
    setAppData(newData);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAppData({
      accountState: {
        activeAccountId: 'main',
        mainPin: null,
        subAccounts: [],
      },
      character: INITIAL_CHARACTER,
      tasks: INITIAL_TASKS,
      achievements: INITIAL_ACHIEVEMENTS,
      dailyHistory: [],
      settings: {
        darkMode: true,
        soundEnabled: true,
        syncCode: null,
        lastSyncedAt: null,
      },
    });
  };

  const handleUpdateSyncStatus = (code: string, timestamp: string) => {
    setAppData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        syncCode: code,
        lastSyncedAt: timestamp,
      },
    }));
  };

  const claimableAchievementsCount = activeAchievements.filter(
    (a) => !a.isUnlocked && a.currentValue >= a.targetValue
  ).length;

  return (
    <div
      className={`min-h-screen font-pixel pb-16 transition-colors duration-500 relative overflow-x-hidden ${
        appData.settings.darkMode
          ? 'bg-[#0c0c0e] text-[#e0e0e0]'
          : 'bg-gradient-to-b from-[#3b82f6] via-[#60a5fa] to-[#93c5fd] text-[#0f172a]'
      }`}
    >
      {/* Background Pixel Atmosphere Decoration (Clouds in Day, Stars in Night) */}
      {!appData.settings.darkMode ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
          {/* Day Pixel Clouds */}
          <div className="absolute top-12 left-[10%] w-32 h-10 bg-white border-b-4 border-r-4 border-sky-200 shadow-md animate-pulse" />
          <div className="absolute top-24 left-[65%] w-48 h-12 bg-white border-b-4 border-r-4 border-sky-200 shadow-md" />
          <div className="absolute top-8 right-[15%] w-24 h-8 bg-white border-b-4 border-r-4 border-sky-200 shadow-md" />
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
          {/* Night Pixel Stars */}
          <div className="absolute top-10 left-[15%] text-xs text-[#ffff55]">✦</div>
          <div className="absolute top-28 left-[45%] text-sm text-[#ffffff] animate-ping">✨</div>
          <div className="absolute top-16 right-[20%] text-xs text-[#ffff55]">✦</div>
          <div className="absolute top-36 right-[35%] text-xs text-[#ffffff]">✨</div>
        </div>
      )}

      {/* Top Navigation Bar / Minecraft Title Banner */}
      <header className="sticky top-0 z-40 transition-colors duration-300 bg-[#f8fafc]/95 dark:bg-[#1e1e24] border-b-4 border-[#94a3b8] dark:border-[#3c3c46] shadow-xl text-slate-800 dark:text-white backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2 relative z-10">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2e8b2e] border-2 border-[#55ff55] flex items-center justify-center text-xl shadow select-none">
              ⛏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-mc-title font-bold text-[#16a34a] dark:text-[#55ff55] mc-text-shadow-light dark:mc-text-shadow tracking-wider">
                  我的世界学习计划表
                </h1>

                {/* Account Switcher Pill Button */}
                <button
                  onClick={() => {
                    pixelSound.playClick();
                    setIsAccountManagerOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 border-2 transition-all font-pixel text-xs ${
                    currentRole === 'main'
                      ? 'bg-[#e2e8f0] dark:bg-[#1e2a1e] border-[#16a34a] dark:border-[#55ff55] text-[#15803d] dark:text-[#55ff55] hover:bg-[#dcfce7]'
                      : 'bg-[#e0f2fe] dark:bg-[#182828] border-[#0284c7] dark:border-[#55ffff] text-[#0369a1] dark:text-[#55ffff] hover:bg-[#bae6fd]'
                  }`}
                  title="切换/管理账户"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="font-bold hidden xs:inline">
                    {currentRole === 'main' ? '������ 主账户' : `🎒 ${currentSubProfile?.name || '子账户'}`}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-gray-400 hidden sm:block">
                Minecraft Pixel Quest Planner & Leveling System
              </div>
            </div>
          </div>

          {/* Quick HUD Counters & Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins Badge */}
            <button
              onClick={() => {
                pixelSound.playClick();
                setIsShopOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-50 dark:bg-[#101014] px-2.5 py-1 border-2 border-[#ffaa00] hover:bg-amber-100 dark:hover:bg-[#222218] transition-colors shadow-sm"
              title="查看商店与金币"
            >
              <span className="text-base">🪙</span>
              <span className="font-bold text-sm text-[#d97706] dark:text-[#ffaa00]">
                {currentRole === 'main' ? '∞ (无限)' : activeCharacter.coins}
              </span>
            </button>

            {/* Achievements Trophy Badge (Sub Accounts Only) */}
            {currentRole === 'sub' && (
              <button
                onClick={() => {
                  pixelSound.playClick();
                  setIsAchievementsOpen(true);
                }}
                className="relative p-2 bg-yellow-50 dark:bg-[#101014] border-2 border-[#ca8a04] dark:border-[#ffff55] hover:bg-yellow-100 dark:hover:bg-[#222218] transition-colors"
                title="成就殿堂"
              >
                <Trophy className="w-4 h-4 text-[#ca8a04] dark:text-[#ffff55]" />
                {claimableAchievementsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#ff5555] text-white text-[9px] font-bold px-1.5 rounded-full animate-bounce">
                    {claimableAchievementsCount}
                  </span>
                )}
              </button>
            )}

            {/* Cloud Sync Button (Restricted to Main Account or Viewable) */}
            {currentRole === 'main' && (
              <button
                onClick={() => {
                  pixelSound.playClick();
                  setIsCloudSyncOpen(true);
                }}
                className="p-2 bg-cyan-50 dark:bg-[#101014] border-2 border-[#0284c7] dark:border-[#55ffff] hover:bg-cyan-100 dark:hover:bg-[#182222] transition-colors"
                title="跨设备云端同步"
              >
                <Cloud className="w-4 h-4 text-[#0284c7] dark:text-[#55ffff]" />
              </button>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 bg-white dark:bg-[#101014] border-2 border-slate-300 dark:border-[#383842] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={appData.settings.soundEnabled ? '静音' : '开启像素音效'}
            >
              {appData.settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#16a34a] dark:text-[#55ff55]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400 dark:text-gray-500" />
              )}
            </button>

            {/* Day / Night Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 border-2 transition-all flex items-center gap-1.5 font-pixel text-xs shadow-sm ${
                appData.settings.darkMode
                  ? 'bg-[#101014] border-[#383842] text-gray-300 hover:text-white'
                  : 'bg-white border-[#ffaa00] text-[#b45309] hover:bg-amber-50'
              }`}
              title={
                appData.settings.darkMode
                  ? '当前为夜间模式，点击切换为日间天空模式'
                  : '当前为日间模式，点击切换为夜间黑夜模式'
              }
            >
              {appData.settings.darkMode ? (
                <>
                  <Moon className="w-4 h-4 text-[#ffff55]" />
                  <span className="hidden md:inline font-bold text-[#ffff55]">夜间模式</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-[#ffaa00]" />
                  <span className="hidden md:inline font-bold text-[#b45309]">日间模式</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top Feature: Customizable Pixel Character Avatar System */}
        <PixelCharacter
          character={activeCharacter}
          currentRole={currentRole}
          onUpdateName={handleUpdateName}
        />

        {/* View Switcher Tabs (Planner vs Analytics) */}
        <div className="flex flex-wrap items-center gap-3 border-b-2 border-[#383842] pb-3">
          <button
            onClick={() => {
              pixelSound.playClick();
              setActiveView('planner');
            }}
            className={`mc-btn flex items-center gap-2 text-xs py-2 px-4 ${
              activeView === 'planner' ? 'mc-btn-primary' : 'bg-[#181820]'
            }`}
          >
            <ListTodo className="w-4 h-4" /> 学习任务清单
          </button>

          <button
            onClick={() => {
              pixelSound.playClick();
              setActiveView('analytics');
            }}
            className={`mc-btn flex items-center gap-2 text-xs py-2 px-4 ${
              activeView === 'analytics' ? 'mc-btn-diamond' : 'bg-[#181820]'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 学习进度统计图表
          </button>
        </div>

        {/* View Content */}
        {activeView === 'planner' ? (
          <TaskPlanner
            tasks={activeTasks}
            currentRole={currentRole}
            activeAccountId={activeAccountId}
            subAccounts={appData.accountState?.subAccounts || []}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onCompleteTaskWithBonus={handleCompleteTaskWithBonus}
          />
        ) : (
          <AnalyticsCharts
            tasks={activeTasks}
            dailyHistory={activeDailyHistory}
            activeAccountId={activeAccountId}
            subAccounts={appData.accountState?.subAccounts || []}
          />
        )}
      </main>

      {/* ACCOUNT MANAGER MODAL */}
      <AccountManagerModal
        accountState={appData.accountState || { activeAccountId: 'main', mainPin: null, subAccounts: [] }}
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
        onSwitchAccount={handleSwitchAccount}
        onCreateSubAccount={handleCreateSubAccount}
        onDeleteSubAccount={handleDeleteSubAccount}
        onResetSubAccount={handleResetSubAccount}
        onSetMainPin={handleSetMainPin}
      />

      {/* SHOP MODAL */}
      <ShopModal
        character={activeCharacter}
        currentRole={currentRole}
        activeAccountId={activeAccountId}
        activeAccountName={activeCharacter.name || currentSubProfile?.name || '主账户'}
        customRewards={appData.customRewards || INITIAL_CUSTOM_REWARDS}
        redeemedTickets={appData.redeemedTickets || []}
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onBuyItem={handleBuyItem}
        onBuyOre={handleBuyOre}
        onCraftItem={handleCraftEquipment}
        onBuyAndCraft={handleBuyAndCraft}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        onAddCustomReward={handleAddCustomReward}
        onDeleteCustomReward={handleDeleteCustomReward}
        onRedeemCustomReward={handleRedeemCustomReward}
        onFulfillTicket={handleFulfillTicket}
      />

      {/* ACHIEVEMENTS MODAL */}
      <AchievementsModal
        achievements={activeAchievements}
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        onClaimReward={handleClaimReward}
      />

      {/* CLOUD SYNC & BACKUP MODAL */}
      <CloudSyncModal
        appData={appData}
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onRestoreData={handleRestoreData}
        onResetData={handleResetData}
        onUpdateSyncStatus={handleUpdateSyncStatus}
      />

      {/* LEVEL UP CELEBRATION MODAL */}
      {levelUpModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="mc-panel-dark max-w-sm w-full p-6 text-center border-4 border-[#55ff55] shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-2 animate-bounce">👑</div>
            <div className="inline-block bg-[#2e8b2e] text-white text-xs font-pixel px-3 py-1 mb-2 border border-[#55ff55]">
              LEVEL UP! 升级通知
            </div>
            <h3 className="text-2xl font-mc-title font-bold text-[#55ff55] mc-text-shadow mb-1">
              等级提升至 Lv.{levelUpModal.newLevel} !
            </h3>
            <p className="text-sm font-pixel text-[#ffaa00] font-bold mb-4">
              获得称号：【{levelUpModal.levelName}】
            </p>
            <p className="text-xs font-pixel text-gray-300 mb-6 leading-relaxed">
              你的角色精力与生命值已完全补满！继续保持专注学习，在我的世界里探索更高维度！
            </p>
            <button
              onClick={() => {
                pixelSound.playClick();
                setLevelUpModal({ ...levelUpModal, isOpen: false });
              }}
              className="mc-btn mc-btn-primary w-full py-3 text-sm"
            >
              继续我的世界学习之旅！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
