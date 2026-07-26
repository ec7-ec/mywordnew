import React, { useState } from 'react';
import { AccountRole, CharacterState, CustomReward, ItemCategory, MaterialTier, RedeemedRewardTicket, ShopItem } from '../types';
import { SHOP_ITEMS } from '../data/initialData';
import { X, ShoppingBag, Plus, Trash2, Gift, Ticket, Clock, CheckCircle2, Sparkles, Hammer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { pixelSound } from '../utils/sound';
import {
  MinecraftEmeraldSVG,
  MinecraftGoldIngotSVG,
  MinecraftHelmetSVG,
  MinecraftChestplateSVG,
  MinecraftLeggingsSVG,
  MinecraftBootsSVG,
  MinecraftSwordSVG,
  MinecraftTridentSVG,
  MinecraftBowSVG,
  MinecraftCrossbowSVG,
  MinecraftGrassBlockSVG,
  MinecraftOreBlockSVG,
  MinecraftAnvilSVG,
} from './MinecraftVectors';

interface Props {
  character: CharacterState;
  currentRole?: AccountRole;
  activeAccountId?: string;
  activeAccountName?: string;
  customRewards?: CustomReward[];
  redeemedTickets?: RedeemedRewardTicket[];
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (item: ShopItem) => void;
  onBuyOre?: (oreItem: ShopItem, count?: number) => void;
  onCraftItem?: (item: ShopItem) => void;
  onBuyAndCraft?: (item: ShopItem) => void;
  onEquipItem: (item: ShopItem) => void;
  onUnequipItem: (category: ItemCategory) => void;
  onAddCustomReward?: (reward: Omit<CustomReward, 'id' | 'createdAt'>) => void;
  onDeleteCustomReward?: (rewardId: string) => void;
  onRedeemCustomReward?: (reward: CustomReward) => void;
  onFulfillTicket?: (ticketId: string) => void;
}

const EMOJI_OPTIONS = ['📺', '🎮', '🍰', '🧸', '🎡', '📚', '🍿', '🚲', '🎁', '🍕', '⚽', '🎨'];

type CategoryTab = 'craft' | 'ores' | 'all' | 'weapons' | 'armor' | 'custom' | 'tickets';

export const getOreInfo = (tier?: MaterialTier) => {
  switch (tier) {
    case 'wood':
      return { name: '橡木原木', icon: '🪵', color: '#8b5a2b', price: 10 };
    case 'stone':
      return { name: '原石', icon: '🪨', color: '#a8a8a8', price: 35 };
    case 'gold':
      return { name: '黄金矿石', icon: '🪙', color: '#ffaa00', price: 20 };
    case 'iron':
      return { name: '铁矿石', icon: '🧱', color: '#e0e0e0', price: 65 };
    case 'diamond':
    case 'special':
      return { name: '钻石矿石', icon: '💎', color: '#55ffff', price: 125 };
    case 'netherite':
      return { name: '下界合金残骸', icon: '🖤', color: '#343038', price: 220 };
    default:
      return { name: '橡木原木', icon: '🪵', color: '#8b5a2b', price: 10 };
  }
};

export const getOreItem = (tier?: MaterialTier) => {
  const oreTier = tier === 'special' ? 'diamond' : (tier || 'wood');
  return SHOP_ITEMS.find((i) => i.category === 'ore' && i.tier === oreTier) || SHOP_ITEMS[0];
};

export const ShopModal: React.FC<Props> = ({
  character,
  currentRole = 'main',
  activeAccountId = 'main',
  activeAccountName = '主账户',
  customRewards = [],
  redeemedTickets = [],
  isOpen,
  onClose,
  onBuyItem,
  onBuyOre,
  onCraftItem,
  onBuyAndCraft,
  onEquipItem,
  onUnequipItem,
  onAddCustomReward,
  onDeleteCustomReward,
  onRedeemCustomReward,
  onFulfillTicket,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('craft');
  const [weaponFilter, setWeaponFilter] = useState<'all' | 'melee' | 'ranged'>('all');
  const [armorFilter, setArmorFilter] = useState<'all' | 'helmet' | 'chestplate' | 'leggings' | 'boots'>('all');
  const [tierFilter, setTierFilter] = useState<MaterialTier | 'all'>('all');
  
  // Custom reward creation form state
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardIcon, setRewardIcon] = useState('📺');
  const [rewardPrice, setRewardPrice] = useState(50);
  const [rewardDescription, setRewardDescription] = useState('');

  const [equippedToast, setEquippedToast] = useState<{ name: string; icon: string; actionText?: string } | null>(null);

  if (!isOpen) return null;

  const triggerEquipToast = (itemName: string, iconStr: string, actionText = '装备成功！') => {
    setEquippedToast({ name: itemName, icon: iconStr, actionText });
    setTimeout(() => {
      setEquippedToast(null);
    }, 2800);
  };

  const isMainRole = currentRole === 'main';

  // Current ore inventory object
  const userOres = character.ores || {
    wood: 4,
    gold: 0,
    stone: 0,
    iron: 0,
    diamond: 0,
    netherite: 0,
  };

  // Filter logic for standard items
  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (activeTab === 'craft') {
      // Crafting bench tab: all equipment that requires ores (exclude ores)
      return item.category !== 'ore';
    }

    if (activeTab === 'ores') {
      return item.category === 'ore';
    }

    if (activeTab === 'all') return true;

    if (activeTab === 'weapons') {
      const isWeapon = item.category === 'melee' || item.category === 'ranged' || item.category === 'item';
      if (!isWeapon) return false;
      if (weaponFilter === 'melee') return item.category === 'melee' || item.id.includes('sword') || item.id.includes('trident');
      if (weaponFilter === 'ranged') return item.category === 'ranged' || item.id.includes('bow') || item.id.includes('crossbow');
      return true;
    }

    if (activeTab === 'armor') {
      const isArmor = item.category === 'helmet' || item.category === 'chestplate' || item.category === 'leggings' || item.category === 'boots' || item.category === 'hat' || item.category === 'outfit';
      if (!isArmor) return false;
      if (armorFilter === 'helmet') return item.category === 'helmet' || item.category === 'hat';
      if (armorFilter === 'chestplate') return item.category === 'chestplate' || item.category === 'outfit';
      if (armorFilter === 'leggings') return item.category === 'leggings';
      if (armorFilter === 'boots') return item.category === 'boots';
      return true;
    }

    return true;
  });

  const pendingTicketsCount = redeemedTickets.filter((t) => !t.fulfilled).length;

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim() || !onAddCustomReward) return;

    onAddCustomReward({
      title: rewardTitle.trim(),
      icon: rewardIcon,
      price: Math.max(1, rewardPrice),
      description: rewardDescription.trim() || '主账户设置的现实兑换奖励。',
    });

    pixelSound.playLevelUp();
    setRewardTitle('');
    setRewardPrice(50);
    setRewardDescription('');
    setIsAddingReward(false);
  };

  const renderTierBadge = (tier?: MaterialTier) => {
    switch (tier) {
      case 'wood':
        return <span className="bg-[#5c3a21] text-[#ffddaa] text-[9px] font-pixel px-1.5 py-0.5 border border-[#8b5a2b]">🪵 木质</span>;
      case 'gold':
        return <span className="bg-[#ffaa00]/20 text-[#ffaa00] text-[9px] font-pixel px-1.5 py-0.5 border border-[#ffaa00]">✨ 黄金</span>;
      case 'stone':
        return <span className="bg-[#444450] text-[#dddddd] text-[9px] font-pixel px-1.5 py-0.5 border border-[#888899]">🪨 石质</span>;
      case 'iron':
        return <span className="bg-[#666677] text-[#ffffff] text-[9px] font-pixel px-1.5 py-0.5 border border-[#aaaaaa]">🛡️ 铁质</span>;
      case 'diamond':
      case 'special':
        return <span className="bg-[#00aaaa]/20 text-[#55ffff] text-[9px] font-pixel px-1.5 py-0.5 border border-[#55ffff]">💎 钻石</span>;
      case 'netherite':
        return <span className="bg-[#343038] text-[#ff8855] text-[9px] font-pixel px-1.5 py-0.5 border border-[#ff5555]">🖤 下界合金</span>;
      default:
        return null;
    }
  };

  const renderItemVectorIcon = (item: ShopItem) => {
    const color = item.color;
    if (item.category === 'ore') return <MinecraftOreBlockSVG tier={item.tier || 'wood'} className="w-8 h-8" />;
    if (item.category === 'helmet' || item.category === 'hat') return <MinecraftHelmetSVG color={color} className="w-8 h-8" />;
    if (item.category === 'chestplate' || item.category === 'outfit') return <MinecraftChestplateSVG color={color} className="w-8 h-8" />;
    if (item.category === 'leggings') return <MinecraftLeggingsSVG color={color} className="w-8 h-8" />;
    if (item.category === 'boots') return <MinecraftBootsSVG color={color} className="w-8 h-8" />;
    if (item.subtype === 'trident') return <MinecraftTridentSVG color={color} className="w-8 h-8" />;
    if (item.subtype === 'bow') return <MinecraftBowSVG color={color} className="w-8 h-8" />;
    if (item.subtype === 'crossbow') return <MinecraftCrossbowSVG color={color} className="w-8 h-8" />;
    if (item.subtype === 'sword' || item.category === 'melee') return <MinecraftSwordSVG color={color} className="w-8 h-8" />;
    if (item.category === 'background') return <MinecraftGrassBlockSVG className="w-8 h-8" />;
    return <span className="text-2xl">{item.icon}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="mc-panel-dark max-w-4xl w-full p-6 relative border-4 border-[#ffaa00] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#383842] relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffaa00]/20 border border-[#ffaa00]">
              <ShoppingBag className="w-6 h-6 text-[#ffaa00]" />
            </div>
            <div>
              <h3 className="text-xl font-mc-title text-[#ffaa00] mc-text-shadow flex items-center gap-2">
                <span>装备合成与交易集市</span>
                <MinecraftEmeraldSVG className="w-5 h-5 inline" />
              </h3>
              <p className="text-xs text-gray-400 font-pixel mt-0.5">
                {isMainRole
                  ? '👑 主账户视角：无限金币体验矿石合成与武器/防具完整套系！'
                  : '武器与装备需用 4 个对应矿石合成！先在矿石商店购买矿石，再前往铁砧合成武装吧！'}
              </p>
            </div>
          </div>

          {/* Coins Balance & Close */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#101014] px-3 py-1.5 border-2 border-[#ffaa00]">
              <MinecraftGoldIngotSVG className="w-5 h-5" />
              <span className="font-pixel text-base font-bold text-[#ffaa00] mc-text-shadow">
                {isMainRole ? '🪙 ∞ (无限)' : character.coins}
              </span>
            </div>
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

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {equippedToast && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="my-2 bg-gradient-to-r from-[#1b2b1b] via-[#223d22] to-[#1b2b1b] border-2 border-[#55ff55] p-2.5 shadow-xl font-pixel flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-[#55ff55] font-bold">
                <Sparkles className="w-4 h-4 text-[#55ff55] animate-spin" />
                <span>✨ {equippedToast.actionText} 方块人已穿戴【{equippedToast.name}】！</span>
              </div>
              <span className="text-[10px] text-gray-300">防具与武力属性已同步提高</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ore Inventory Bar Banner */}
        <div className="bg-[#121218] p-2.5 my-2 border-2 border-[#383848] flex flex-wrap items-center justify-between gap-2 font-pixel text-xs">
          <div className="flex items-center gap-1.5 text-[#ffaa00] font-bold">
            <MinecraftAnvilSVG className="w-4 h-4" />
            <span>我的背包矿石:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {[
              { tier: 'wood', name: '🪵 木原木', count: userOres.wood || 0, color: '#8b5a2b' },
              { tier: 'stone', name: '🪨 原石', count: userOres.stone || 0, color: '#a8a8a8' },
              { tier: 'gold', name: '🪙 金矿', count: userOres.gold || 0, color: '#ffaa00' },
              { tier: 'iron', name: '🧱 铁矿', count: userOres.iron || 0, color: '#e0e0e0' },
              { tier: 'diamond', name: '💎 钻矿', count: userOres.diamond || 0, color: '#55ffff' },
              { tier: 'netherite', name: '🖤 合金', count: userOres.netherite || 0, color: '#ff7755' },
            ].map((o) => (
              <div
                key={o.tier}
                className={`px-2 py-0.5 border flex items-center gap-1 ${
                  o.count >= 4 ? 'bg-[#223d22] border-[#55ff55] text-white font-bold' : 'bg-[#181822] border-[#2c2c3a] text-gray-300'
                }`}
              >
                <span>{o.name}:</span>
                <span style={{ color: o.color }} className="font-bold">{o.count}</span>
                {o.count >= 4 && <span className="text-[9px] bg-[#55ff55] text-black px-0.5 font-bold">可合成</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { key: 'craft', label: '🔨 装备合成台', icon: '🔨' },
            { key: 'ores', label: '⛏️ 矿石与材料', icon: '⛏️' },
            { key: 'all', label: '🎒 全部图鉴', icon: '🎒' },
            { key: 'weapons', label: '⚔️ 武器类', icon: '⚔️' },
            { key: 'armor', label: '🛡️ 防具类', icon: '🛡️' },
            { key: 'custom', label: '🎁 现实自定义', icon: '🎁' },
            {
              key: 'tickets',
              label: `🎟️ 兑换日志 ${pendingTicketsCount > 0 ? `(${pendingTicketsCount})` : ''}`,
              icon: '🎟️',
              badge: pendingTicketsCount > 0,
            },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                pixelSound.playClick();
                setActiveTab(cat.key as any);
              }}
              className={`px-3 py-1.5 font-pixel text-xs flex items-center gap-1.5 transition-all relative ${
                activeTab === cat.key
                  ? 'mc-btn-gold text-black font-bold'
                  : 'bg-[#141418] text-gray-300 hover:bg-[#22222a] border border-[#383842]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.badge && (
                <span className="w-2 h-2 rounded-full bg-[#ff5555] animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* Sub-Filters for Weapons, Armor, and Material Tiers */}
        {activeTab === 'weapons' && (
          <div className="flex gap-2 mb-3 bg-[#101015] p-2 border border-[#2c2c3a] font-pixel text-xs">
            <span className="text-gray-400 self-center">武器筛选:</span>
            <button
              onClick={() => setWeaponFilter('all')}
              className={`px-2.5 py-1 border ${weaponFilter === 'all' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              全部武器
            </button>
            <button
              onClick={() => setWeaponFilter('melee')}
              className={`px-2.5 py-1 border ${weaponFilter === 'melee' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              🗡️ 近战 (剑 / 三叉戟)
            </button>
            <button
              onClick={() => setWeaponFilter('ranged')}
              className={`px-2.5 py-1 border ${weaponFilter === 'ranged' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              🏹 远程 (弓 / 弩)
            </button>
          </div>
        )}

        {activeTab === 'armor' && (
          <div className="flex flex-wrap gap-2 mb-3 bg-[#101015] p-2 border border-[#2c2c3a] font-pixel text-xs">
            <span className="text-gray-400 self-center">防具部位:</span>
            <button
              onClick={() => setArmorFilter('all')}
              className={`px-2.5 py-1 border ${armorFilter === 'all' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              全部部位
            </button>
            <button
              onClick={() => setArmorFilter('helmet')}
              className={`px-2.5 py-1 border ${armorFilter === 'helmet' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              🪖 头盔 (Helmet)
            </button>
            <button
              onClick={() => setArmorFilter('chestplate')}
              className={`px-2.5 py-1 border ${armorFilter === 'chestplate' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              🛡️ 胸甲 (Chestplate)
            </button>
            <button
              onClick={() => setArmorFilter('leggings')}
              className={`px-2.5 py-1 border ${armorFilter === 'leggings' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              🪵 护腿 (Leggings)
            </button>
            <button
              onClick={() => setArmorFilter('boots')}
              className={`px-2.5 py-1 border ${armorFilter === 'boots' ? 'bg-[#ffaa00] text-black font-bold border-[#ffaa00]' : 'bg-[#181822] text-gray-300 border-[#383848]'}`}
            >
              🥾 靴子 (Boots)
            </button>
          </div>
        )}

        {/* TAB 1: CUSTOM REWARDS */}
        {activeTab === 'custom' && (
          <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
            <div className="bg-[#181824] p-4 border-2 border-[#55aaff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-pixel">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-[#55aaff]" />
                <div>
                  <h4 className="text-sm font-bold text-[#55aaff]">现实自定义奖励心愿池</h4>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {isMainRole
                      ? '主账户可自由添加现实奖品（如看电视、玩游戏、游乐园等），孩子们用金币兑换后主账户可进行核销。'
                      : '完成学习任务积累金币，在此向家长/老师兑换现实生活中的精彩奖励吧！'}
                  </p>
                </div>
              </div>

              {isMainRole && (
                <button
                  onClick={() => {
                    pixelSound.playClick();
                    setIsAddingReward(!isAddingReward);
                  }}
                  className="mc-btn mc-btn-gold text-xs py-2 px-3 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingReward ? '取消添加' : '添加自定义奖励'}</span>
                </button>
              )}
            </div>

            {isMainRole && isAddingReward && (
              <form
                onSubmit={handleCreateReward}
                className="mc-panel p-4 border-2 border-[#ffaa00] bg-[#14141c] space-y-3 font-pixel animate-in slide-in-from-top-2 duration-200"
              >
                <h4 className="text-sm font-bold text-[#ffaa00] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> 新建现实自定义奖励
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">奖励名称 *</label>
                    <input
                      type="text"
                      required
                      placeholder="例如：看 30 分钟动画片 / 游乐园门票"
                      value={rewardTitle}
                      onChange={(e) => setRewardTitle(e.target.value)}
                      className="w-full bg-[#101014] border border-[#444458] p-2 text-xs text-white focus:border-[#ffaa00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">所需金币 (Coins) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={9999}
                      value={rewardPrice}
                      onChange={(e) => setRewardPrice(parseInt(e.target.value) || 1)}
                      className="w-full bg-[#101014] border border-[#444458] p-2 text-xs text-white focus:border-[#ffaa00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">选择代表图标</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setRewardIcon(emoji)}
                        className={`p-2 text-lg border ${
                          rewardIcon === emoji
                            ? 'bg-[#ffaa00]/20 border-[#ffaa00]'
                            : 'bg-[#101014] border-[#383848] hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">规则与详细说明</label>
                  <input
                    type="text"
                    placeholder="例如：需在完成当日主线学习任务后兑换使用"
                    value={rewardDescription}
                    onChange={(e) => setRewardDescription(e.target.value)}
                    className="w-full bg-[#101014] border border-[#444458] p-2 text-xs text-white focus:border-[#ffaa00] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingReward(false)}
                    className="mc-btn px-3 py-1.5 text-xs bg-[#2a2a35]"
                  >
                    取消
                  </button>
                  <button type="submit" className="mc-btn mc-btn-gold px-4 py-1.5 text-xs">
                    确认发布奖励
                  </button>
                </div>
              </form>
            )}

            {customRewards.length === 0 ? (
              <div className="text-center py-10 bg-[#101014] border-2 border-dashed border-[#383848] p-6 font-pixel">
                <Gift className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <h4 className="text-gray-300 text-sm font-bold">尚无自定义现实奖励</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {isMainRole
                    ? '点击右上角“添加自定义奖励”，为孩子上架专属的心愿奖励吧！'
                    : '请主账户（家长/老师）添加现实生活中的兑换奖励。'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customRewards.map((reward) => {
                  const canAfford = isMainRole || character.coins >= reward.price;

                  return (
                    <div
                      key={reward.id}
                      className="mc-panel-dark p-4 border-2 border-[#383848] hover:border-[#55aaff] transition-all bg-[#101015] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="mc-slot w-12 h-12 flex items-center justify-center text-3xl">
                            {reward.icon}
                          </div>

                          <div className="flex items-center gap-1.5 bg-[#201a00] px-2.5 py-1 border border-[#ffaa00]">
                            <span className="text-xs">🪙</span>
                            <span className="font-pixel text-xs font-bold text-[#ffaa00]">
                              {reward.price} 金币
                            </span>
                          </div>
                        </div>

                        <h4 className="font-pixel font-bold text-sm text-white mb-1">
                          {reward.title}
                        </h4>
                        <p className="font-pixel text-xs text-gray-400 leading-relaxed mb-3">
                          {reward.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2a2a38]">
                        {isMainRole ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-gray-500 font-pixel">
                              主账户管理
                            </span>
                            {onDeleteCustomReward && (
                              <button
                                onClick={() => {
                                  pixelSound.playClick();
                                  onDeleteCustomReward(reward.id);
                                }}
                                className="p-1.5 text-gray-500 hover:text-[#ff5555] transition-colors"
                                title="删除该奖励"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              if (canAfford && onRedeemCustomReward) {
                                pixelSound.playCoin();
                                onRedeemCustomReward(reward);
                              }
                            }}
                            className={`mc-btn w-full py-2 text-xs font-pixel flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'mc-btn-gold'
                                : 'opacity-50 cursor-not-allowed bg-[#2a2a2a]'
                            }`}
                          >
                            <Gift className="w-4 h-4" />
                            <span>{canAfford ? `消耗 ${reward.price} 金币兑换` : '金币不足'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REDEEMED TICKETS LOG */}
        {activeTab === 'tickets' && (
          <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-3 font-pixel">
            <div className="bg-[#181820] p-3 border-2 border-[#ffaa00] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#ffaa00]" />
                <span className="text-xs text-gray-200 font-bold">现实奖励兑换核销日志</span>
              </div>
              <span className="text-xs text-gray-400">
                待兑现: <span className="text-[#ffaa00] font-bold">{pendingTicketsCount}</span> 张
              </span>
            </div>

            {redeemedTickets.length === 0 ? (
              <div className="text-center py-10 bg-[#101014] border-2 border-dashed border-[#383848] p-6">
                <Ticket className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <h4 className="text-gray-300 text-sm font-bold">尚无兑换记录</h4>
                <p className="text-xs text-gray-500 mt-1">
                  孩子使用金币兑换自定义现实奖励后，相关记录将即刻呈现在此。
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {redeemedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3.5 border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      ticket.fulfilled
                        ? 'bg-[#101410] border-[#2a3a2a] opacity-80'
                        : 'bg-[#181824] border-[#ffaa00]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2 bg-[#101014] border border-[#383848]">
                        {ticket.rewardIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{ticket.rewardTitle}</h4>
                          <span className="text-xs text-[#ffaa00] bg-[#2a2200] px-2 py-0.5 border border-[#ffaa00]">
                            🪙 {ticket.costCoins} 金币
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>👤 兑换者: <strong className="text-white">{ticket.subAccountName}</strong></span>
                          <span>🕒 兑换时间: {ticket.redeemedAt.slice(0, 16).replace('T', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-auto">
                      {ticket.fulfilled ? (
                        <div className="flex items-center gap-1 text-xs text-[#55ff55] bg-[#1a301a] px-3 py-1.5 border border-[#55ff55]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>已于 {ticket.fulfilledAt?.slice(11, 16) || '今日'} 兑现</span>
                        </div>
                      ) : isMainRole ? (
                        <button
                          onClick={() => {
                            pixelSound.playLevelUp();
                            if (onFulfillTicket) onFulfillTicket(ticket.id);
                          }}
                          className="mc-btn mc-btn-gold text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>确认兑现给孩子</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-[#ffaa00] bg-[#2e2200] px-3 py-1.5 border border-[#ffaa00]">
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>等待主账户(家长)兑现</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STANDARD SHOP & CRAFTING ITEMS */}
        {activeTab !== 'custom' && activeTab !== 'tickets' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-1 flex-1 py-2">
            {filteredItems.map((item) => {
              const isOwned = character.inventory.includes(item.id);
              const equippedId = character.equipped[item.category as keyof typeof character.equipped];
              const isEquipped = equippedId === item.id;
              const isOre = item.category === 'ore';
              const isBackground = item.category === 'background';

              const oreInfo = getOreInfo(item.tier);
              const oreTierKey = item.tier === 'special' ? 'diamond' : (item.tier || 'wood');
              const ownedOres = userOres[oreTierKey] || 0;
              const canAffordCoins = isMainRole || character.coins >= item.price;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-4 border-2 flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-[#1e2a1e] border-[#55ff55] shadow-[0_0_15px_rgba(85,255,85,0.25)]'
                      : isOwned
                      ? 'bg-[#181822] border-[#383850]'
                      : 'bg-[#101014] border-[#2a2a35]'
                  }`}
                >
                  <div>
                    {/* Top Slot Header */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="mc-slot w-12 h-12 flex items-center justify-center text-2xl relative">
                        <motion.div
                          animate={isEquipped ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        >
                          {renderItemVectorIcon(item)}
                        </motion.div>
                        {isEquipped && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-[#55ff55] text-black text-[9px] font-pixel px-1 font-bold shadow animate-bounce"
                          >
                            E
                          </motion.div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {renderTierBadge(item.tier)}
                        {isEquipped ? (
                          <span className="bg-[#2e8b2e] text-white text-[10px] font-pixel px-2 py-0.5 border border-[#55ff55] flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 text-[#55ff55]" /> 已装备
                          </span>
                        ) : isOwned ? (
                          <span className="bg-[#383850] text-gray-300 text-[10px] font-pixel px-2 py-0.5 border border-[#555577]">
                            已拥有
                          </span>
                        ) : isOre ? (
                          <span className="bg-[#201e14] text-[#ffaa00] text-[10px] font-pixel px-2 py-0.5 border border-[#ffaa00]">
                            拥有: {userOres[item.tier || 'wood'] || 0} 个
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 font-pixel text-[11px] text-[#55ffff]">
                            <MinecraftAnvilSVG className="w-3.5 h-3.5 inline" />
                            <span>用4个矿石合成</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-pixel font-bold text-sm text-white mb-1 flex items-center gap-1">
                      <span>{item.name}</span>
                    </h4>
                    <p className="font-pixel text-[11px] text-gray-400 leading-tight mb-2">
                      {item.description}
                    </p>

                    {/* 4-Slot Crafting Recipe Indicator for Equipment */}
                    {!isOre && (
                      <div className="my-2 bg-[#14141c] p-2 border border-[#383848]">
                        <div className="flex justify-between items-center text-[10px] font-pixel mb-1">
                          <span className="text-gray-300 flex items-center gap-1">
                            <Hammer className="w-3 h-3 text-[#ffaa00]" /> 4 × {oreInfo.name}
                          </span>
                          <span className={ownedOres >= 4 ? 'text-[#55ff55] font-bold' : 'text-[#ffaa00]'}>
                            ({ownedOres}/4 矿石)
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[1, 2, 3, 4].map((slotIndex) => {
                            const isFilled = ownedOres >= slotIndex;
                            return (
                              <div
                                key={slotIndex}
                                className={`h-6 border flex items-center justify-center font-pixel text-xs transition-all ${
                                  isFilled
                                    ? 'bg-[#264226] border-[#55ff55] text-white shadow-[0_0_6px_rgba(85,255,85,0.4)] font-bold'
                                    : 'bg-[#181820] border-[#303040] text-gray-600 opacity-50'
                                }`}
                              >
                                {isFilled ? oreInfo.icon : <span className="text-[9px] text-gray-600">{slotIndex}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions depending on category (Ore vs Background vs Equipment) */}
                  <div className="pt-1">
                    {/* CASE 1: ORE ITEM */}
                    {isOre ? (
                      <div className="space-y-1.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (isMainRole || character.coins >= item.price) {
                              pixelSound.playCoin();
                              if (onBuyOre) onBuyOre(item, 1);
                              else onBuyItem(item);
                            }
                          }}
                          disabled={!isMainRole && character.coins < item.price}
                          className={`mc-btn w-full py-1.5 text-xs font-pixel flex items-center justify-center gap-1 ${
                            isMainRole || character.coins >= item.price
                              ? 'mc-btn-gold font-bold'
                              : 'opacity-50 cursor-not-allowed bg-[#2a2a2a]'
                          }`}
                        >
                          <span>购买 1 个 ({isMainRole ? '免费' : `${item.price}金币`})</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const cost4 = item.price * 4;
                            if (isMainRole || character.coins >= cost4) {
                              pixelSound.playCoin();
                              if (onBuyOre) onBuyOre(item, 4);
                            }
                          }}
                          disabled={!isMainRole && character.coins < item.price * 4}
                          className={`mc-btn w-full py-1 text-[11px] font-pixel flex items-center justify-center gap-1 ${
                            isMainRole || character.coins >= item.price * 4
                              ? 'bg-[#223d22] border-[#55ff55] text-[#55ff55] hover:bg-[#2a4d2a]'
                              : 'opacity-40 cursor-not-allowed bg-[#1e1e24]'
                          }`}
                        >
                          <span>⚡ 买齐 4 个直接合成量 ({isMainRole ? '免费' : `${item.price * 4}金币`})</span>
                        </motion.button>
                      </div>
                    ) : isOwned ? (
                      /* CASE 2: ALREADY OWNED EQUIPMENT / BACKGROUND */
                      isEquipped ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            pixelSound.playClick();
                            onUnequipItem(item.category);
                          }}
                          className="mc-btn w-full py-1.5 text-xs bg-[#3a3a4a] hover:bg-[#4a4a5a]"
                        >
                          卸下装备
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            pixelSound.playLevelUp();
                            onEquipItem(item);
                            triggerEquipToast(item.name, item.icon || '✨', '装备穿戴成功！');
                          }}
                          className="mc-btn mc-btn-primary w-full py-1.5 text-xs flex items-center justify-center gap-1 font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#55ff55]" />
                          <span>装备上去</span>
                        </motion.button>
                      )
                    ) : (
                      /* CASE 3: EQUIPMENT ITEM NEEDING 4 ORES TO CRAFT */
                      <div className="space-y-1.5">
                        {isMainRole ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              pixelSound.playLevelUp();
                              if (onCraftItem) onCraftItem(item);
                              else onBuyItem(item);
                              triggerEquipToast(item.name, item.icon || '🔨', '合成锻造成功！');
                            }}
                            className="mc-btn mc-btn-gold w-full py-1.5 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Hammer className="w-3.5 h-3.5 text-black" />
                            <span>👑 体验合成装备</span>
                          </motion.button>
                        ) : ownedOres >= 4 ? (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              pixelSound.playLevelUp();
                              if (onCraftItem) onCraftItem(item);
                              else onBuyItem(item);
                              triggerEquipToast(item.name, item.icon || '🔨', '消耗 4 矿石合成成功！');
                            }}
                            className="mc-btn w-full py-1.5 text-xs bg-[#224422] border-2 border-[#55ff55] text-[#55ff55] hover:bg-[#2a552a] font-bold flex items-center justify-center gap-1 animate-pulse"
                          >
                            <Hammer className="w-4 h-4 text-[#55ff55]" />
                            <span>🔨 消耗 4个{oreInfo.name}合成</span>
                          </motion.button>
                        ) : (
                          <>
                            {/* Option A: Buy 1 Ore */}
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => {
                                  const oreItm = getOreItem(item.tier);
                                  if (character.coins >= oreItm.price) {
                                    pixelSound.playCoin();
                                    if (onBuyOre) onBuyOre(oreItm, 1);
                                  }
                                }}
                                disabled={character.coins < oreInfo.price}
                                className={`mc-btn py-1 text-[11px] font-pixel text-center ${
                                  character.coins >= oreInfo.price ? 'bg-[#2a2a38] text-gray-200 hover:bg-[#383848]' : 'opacity-40 cursor-not-allowed bg-[#1a1a20]'
                                }`}
                              >
                                买1矿石({oreInfo.price}🪙)
                              </button>

                              {/* Option B: One-click Buy Remaining Ores & Craft */}
                              {(() => {
                                const missing = Math.max(1, 4 - ownedOres);
                                const costMissing = missing * oreInfo.price;
                                const canAffordMissing = character.coins >= costMissing;
                                return (
                                  <button
                                    onClick={() => {
                                      if (canAffordMissing) {
                                        pixelSound.playLevelUp();
                                        if (onBuyAndCraft) onBuyAndCraft(item);
                                        else if (onCraftItem) onCraftItem(item);
                                        triggerEquipToast(item.name, item.icon || '✨', '买齐矿石并合成成功！');
                                      }
                                    }}
                                    disabled={!canAffordMissing}
                                    className={`mc-btn py-1 text-[11px] font-pixel text-center font-bold ${
                                      canAffordMissing
                                        ? 'mc-btn-gold text-black'
                                        : 'opacity-40 cursor-not-allowed bg-[#1a1a20]'
                                    }`}
                                  >
                                    一键合成({costMissing}🪙)
                                  </button>
                                );
                              })()}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
