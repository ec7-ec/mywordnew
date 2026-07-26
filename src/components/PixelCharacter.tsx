import React, { useState, useEffect, useRef } from 'react';
import { AccountRole, CharacterState, ItemCategory } from '../types';
import { calculateLevelName, SHOP_ITEMS } from '../data/initialData';
import { Edit2, Check, Shield, Zap, BookOpen, Flame, Sparkles, Crown, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { pixelSound } from '../utils/sound';
import {
  MinecraftSteveAvatarSVG,
  MinecraftEmeraldSVG,
  MinecraftDiamondSVG,
  MinecraftGoldIngotSVG,
  MinecraftHelmetSVG,
  MinecraftChestplateSVG,
  MinecraftLeggingsSVG,
  MinecraftBootsSVG,
  MinecraftPickaxeSVG,
  MinecraftSwordSVG,
  MinecraftBowSVG,
  MinecraftGrassBlockSVG,
} from './MinecraftVectors';

interface Props {
  character: CharacterState;
  currentRole?: AccountRole;
  onUpdateName: (newName: string) => void;
}

interface EquipNotification {
  id: string;
  itemName: string;
  itemIcon: string;
  categoryName: string;
  color?: string;
}

export const PixelCharacter: React.FC<Props> = ({ character, currentRole = 'main', onUpdateName }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(character.name);
  
  // Equip Animation States
  const [equipNotification, setEquipNotification] = useState<EquipNotification | null>(null);
  const [lastChangedSlot, setLastChangedSlot] = useState<string | null>(null);
  const [isAvatarBouncing, setIsAvatarBouncing] = useState(false);
  
  const prevEquippedRef = useRef<CharacterState['equipped']>(character.equipped);

  const isMainRole = currentRole === 'main';

  // Detect equipment changes and trigger animated feedback!
  useEffect(() => {
    const prevEquipped = prevEquippedRef.current;
    const currentEquipped = character.equipped;

    if (prevEquipped) {
      // Find which slot changed
      let changedSlotKey: string | null = null;
      let newItemId: string | undefined = undefined;

      const keys = Object.keys(currentEquipped) as Array<keyof typeof currentEquipped>;
      for (const key of keys) {
        if (prevEquipped[key] !== currentEquipped[key] && currentEquipped[key]) {
          changedSlotKey = String(key);
          newItemId = currentEquipped[key];
          break;
        }
      }

      if (changedSlotKey && newItemId) {
        const foundItem = SHOP_ITEMS.find((i) => i.id === newItemId);
        if (foundItem) {
          const categoryLabels: Record<string, string> = {
            helmet: '头盔',
            chestplate: '胸甲',
            leggings: '护腿',
            boots: '靴子',
            melee: '近战武器',
            ranged: '远程武器',
            background: '探险群系',
            hat: '帽子装扮',
            outfit: '服装装扮',
            item: '随身道具',
          };

          setEquipNotification({
            id: Date.now().toString(),
            itemName: foundItem.name,
            itemIcon: foundItem.icon || '✨',
            categoryName: categoryLabels[changedSlotKey] || '装备',
            color: foundItem.color,
          });

          setLastChangedSlot(changedSlotKey);
          setIsAvatarBouncing(true);

          // Play triumph sound
          pixelSound.playLevelUp();

          // Reset bouncing after animation
          const bounceTimer = setTimeout(() => setIsAvatarBouncing(false), 1200);
          const notifyTimer = setTimeout(() => setEquipNotification(null), 3000);

          return () => {
            clearTimeout(bounceTimer);
            clearTimeout(notifyTimer);
          };
        }
      }
    }

    prevEquippedRef.current = character.equipped;
  }, [character.equipped]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      pixelSound.playClick();
    }
    setIsEditingName(false);
  };

  const expPercentage = Math.min(100, Math.round((character.exp / character.maxExp) * 100));

  // Determine colors and styles based on equipped items
  const { hat, outfit, item, background } = character.equipped;

  // Background style classes or colors
  const getBgClass = () => {
    switch (background) {
      case 'bg_cave':
        return 'bg-gradient-to-b from-[#2a2a30] via-[#1a1a20] to-[#0f0f12] border-[#444455]';
      case 'bg_nether':
        return 'bg-gradient-to-b from-[#550000] via-[#330000] to-[#1a0000] border-[#990000]';
      case 'bg_end':
        return 'bg-gradient-to-b from-[#220033] via-[#110022] to-[#080014] border-[#8800aa]';
      default: // Plains
        return 'bg-gradient-to-b from-[#4a88c7] via-[#74b3f2] to-[#55aa33] border-[#387a20]';
    }
  };

  return (
    <div className="mc-panel-dark p-4 md:p-6 rounded-none relative overflow-hidden shadow-2xl">
      {/* Background Biome Atmosphere */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500 ${getBgClass()}`} />

      {/* Top Header: Character Name & Title */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#383842]">
        <div>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={12}
                  className="bg-[#101014] border-2 border-[#55ff55] px-2 py-1 text-white font-pixel text-lg focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button
                  onClick={handleSaveName}
                  className="mc-btn mc-btn-primary p-1.5"
                  title="保存名字"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempName(character.name);
                  setIsEditingName(true);
                }}
                className="group flex items-center gap-2 cursor-pointer hover:opacity-90"
                title="点击修改名字"
              >
                <MinecraftGrassBlockSVG className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-mc-title font-bold text-[#55ff55] mc-text-shadow tracking-wide">
                  {character.name}
                </h2>
                <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-[#55ff55] transition-colors" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {isMainRole ? (
              <span className="bg-[#ffaa00] text-black font-pixel text-xs px-2 py-0.5 font-bold uppercase tracking-wider shadow flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                👑 创世管理主控
              </span>
            ) : (
              <>
                <span className="bg-[#ffaa00] text-black font-pixel text-xs px-2 py-0.5 font-bold uppercase tracking-wider shadow flex items-center gap-1">
                  <MinecraftEmeraldSVG className="w-3.5 h-3.5" />
                  {calculateLevelName(character.level)}
                </span>
                <span className="text-xs text-gray-300 font-pixel">
                  等级 Lv.{character.level}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Level / Admin Badge Pill */}
        <div className="flex items-center gap-3 bg-[#101014] p-2 border-2 border-[#3c3c46] shadow-inner">
          {isMainRole ? (
            <div className="flex items-center gap-2 px-2 py-1 font-pixel text-xs">
              <Crown className="w-5 h-5 text-[#ffaa00] animate-pulse" />
              <div>
                <div className="text-[#ffaa00] font-bold text-sm">主账户 (无需等级)</div>
                <div className="text-gray-400 text-[10px]">无限金币 & 自由装扮</div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-end font-pixel">
                <span className="text-xs text-gray-400">经验值 (EXP)</span>
                <span className="text-sm text-[#55ff55] font-bold">
                  {character.exp} / {character.maxExp}
                </span>
              </div>
              <div className="w-10 h-10 bg-[#2e8b2e] border-2 border-[#55ff55] flex items-center justify-center font-pixel text-lg font-bold text-white mc-text-shadow">
                {character.level}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Avatar Canvas Area & Equipment View */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
        {/* Pixel Character Render Box */}
        <div className="md:col-span-5 flex flex-col items-center justify-center py-4 bg-[#141418]/80 border-2 border-[#383842] rounded relative overflow-hidden">
          
          {/* Floating Equip Banner Notification */}
          <AnimatePresence>
            {equipNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute top-2 z-30 bg-[#181824]/95 border-2 border-[#ffaa00] px-3 py-1.5 shadow-2xl font-pixel flex items-center gap-2 max-w-[90%]"
              >
                <div className="w-6 h-6 rounded-full bg-[#ffaa00]/20 border border-[#ffaa00] flex items-center justify-center text-sm animate-bounce">
                  {equipNotification.itemIcon}
                </div>
                <div>
                  <div className="text-[10px] text-[#ffaa00] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ffaa00]" /> 穿戴成功 ({equipNotification.categoryName})
                  </div>
                  <div className="text-xs text-white font-bold truncate">
                    {equipNotification.itemName}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Biome Badge Tag */}
          <div className="absolute top-2 left-2 text-[10px] font-pixel bg-[#000000]/60 px-2 py-0.5 text-gray-300 border border-gray-700 flex items-center gap-1 z-10">
            <span>🌍</span>
            <span>{background === 'bg_cave' ? '探险: 矿洞' : background === 'bg_nether' ? '探险: 下界' : background === 'bg_end' ? '探险: 末地' : '探险: 主世界'}</span>
          </div>

          {/* Sparkles / Particles Beam FX when Equipping */}
          <AnimatePresence>
            {isAvatarBouncing && (
              <>
                {/* Radiant Expansion Shockwave */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute z-10 w-32 h-32 rounded-full border-4 border-[#ffaa00] bg-gradient-to-r from-[#ffaa00]/30 via-[#55ffff]/30 to-[#55ff55]/30 pointer-events-none"
                />

                {/* Floating Particles */}
                {['✨', '💎', '🛡️', '⚔️', '🌟'].map((pIcon, idx) => (
                  <motion.div
                    key={idx}
                    initial={{
                      opacity: 1,
                      x: (idx - 2) * 20,
                      y: 20,
                      scale: 0.5,
                    }}
                    animate={{
                      opacity: 0,
                      y: -80 - idx * 15,
                      scale: 1.3,
                      rotate: idx % 2 === 0 ? 45 : -45,
                    }}
                    transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                    className="absolute z-20 text-lg pointer-events-none"
                  >
                    {pIcon}
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Minecraft 2D Vector Character Graphic */}
          <motion.div
            animate={
              isAvatarBouncing
                ? {
                    scale: [1, 1.22, 0.95, 1.08, 1],
                    rotate: [0, -6, 6, -3, 0],
                    y: [0, -12, 0],
                  }
                : { y: [0, -5, 0] }
            }
            transition={
              isAvatarBouncing
                ? { duration: 0.8, ease: 'easeInOut' }
                : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
            }
            className="relative w-36 h-48 flex items-center justify-center my-2 select-none cursor-pointer filter drop-shadow-xl z-10"
            onClick={() => pixelSound.playClick()}
          >
            <MinecraftSteveAvatarSVG
              equipped={character.equipped}
              hat={hat}
              outfit={outfit}
              item={item}
              className="w-36 h-48"
            />
          </motion.div>

          {/* Equipped Gear Summary Slots (Armor + Weapons) */}
          <div className="grid grid-cols-7 gap-1 mt-2 px-2 max-w-full z-10">
            {/* Slot 1: Helmet */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'helmet' || lastChangedSlot === 'hat'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 头盔"
            >
              {character.equipped.helmet || character.equipped.hat ? (
                <MinecraftHelmetSVG className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-pixel text-gray-500">头</span>
              )}
            </div>

            {/* Slot 2: Chestplate */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'chestplate' || lastChangedSlot === 'outfit'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 胸甲"
            >
              {character.equipped.chestplate || character.equipped.outfit ? (
                <MinecraftChestplateSVG className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-pixel text-gray-500">甲</span>
              )}
            </div>

            {/* Slot 3: Leggings */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'leggings'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 护腿"
            >
              {character.equipped.leggings ? (
                <MinecraftLeggingsSVG className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-pixel text-gray-500">腿</span>
              )}
            </div>

            {/* Slot 4: Boots */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'boots'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 靴子"
            >
              {character.equipped.boots ? (
                <MinecraftBootsSVG className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-pixel text-gray-500">靴</span>
              )}
            </div>

            {/* Slot 5: Melee */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'melee' || lastChangedSlot === 'item'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 近战武器 (剑/三叉戟)"
            >
              {character.equipped.melee || character.equipped.item ? (
                <MinecraftSwordSVG className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-pixel text-gray-500">近</span>
              )}
            </div>

            {/* Slot 6: Ranged */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'ranged'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 远程武器 (弓/弩)"
            >
              {character.equipped.ranged ? (
                <MinecraftBowSVG className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-pixel text-gray-500">远</span>
              )}
            </div>

            {/* Slot 7: Background */}
            <div
              className={`mc-slot w-8 h-8 flex items-center justify-center transition-all ${
                lastChangedSlot === 'background'
                  ? 'ring-2 ring-[#ffaa00] bg-[#3a2e10] animate-pulse scale-110'
                  : ''
              }`}
              title="已装备: 探险背景"
            >
              <MinecraftGrassBlockSVG className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Character Attributes & Progress Bar */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          {/* Minecraft EXP Progress Bar or Main Account Mode Notice */}
          {isMainRole ? (
            <div className="bg-[#101014] p-3.5 border-2 border-[#ffaa00] shadow flex items-center gap-3">
              <div className="text-2xl p-2 bg-[#ffaa00]/20 border border-[#ffaa00] text-[#ffaa00]">
                👑
              </div>
              <div className="font-pixel">
                <h4 className="text-sm font-bold text-[#ffaa00]">主账户管理员视界</h4>
                <p className="text-xs text-gray-300 mt-0.5">
                  主账户免除等级提升限制，拥有<span className="text-[#55ff55] font-bold">无限金币</span>。可在商店直接试穿拥有装备，并可为子账户设置自定义现实兑换奖励！
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#101014] p-3 border-2 border-[#383842] shadow">
              <div className="flex justify-between items-center mb-1 font-pixel text-xs">
                <span className="text-[#55ff55] font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 升级进度 (EXP Progress)
                </span>
                <span className="text-gray-300">{expPercentage}%</span>
              </div>
              {/* Minecraft EXP Green Bar */}
              <div className="w-full h-4 bg-[#0a0a0d] border border-[#2a2a33] p-0.5 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2e8b2e] via-[#55ff55] to-[#88ff88] transition-all duration-500 relative"
                  style={{ width: `${expPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 font-pixel">
                距离下一级还需 <span className="text-[#55ff55] font-bold">{character.maxExp - character.exp}</span> EXP经验值！完成学习任务即可提升等级。
              </p>
            </div>
          )}

          {/* Character Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141418] p-3 border-2 border-[#2c2c36] flex items-center gap-3">
              <div className="p-2 bg-[#8b0000]/40 border border-[#ff5555] text-[#ff5555]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-pixel">力量 (任务数)</div>
                <div className="text-lg font-pixel font-bold text-white">
                  {character.stats.strength} <span className="text-xs text-gray-400 font-normal">点</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141418] p-3 border-2 border-[#2c2c36] flex items-center gap-3">
              <div className="p-2 bg-[#008080]/40 border border-[#55ffff] text-[#55ffff]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-pixel">智力 (难题斩获)</div>
                <div className="text-lg font-pixel font-bold text-white">
                  {character.stats.intelligence} <span className="text-xs text-gray-400 font-normal">点</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141418] p-3 border-2 border-[#2c2c36] flex items-center gap-3">
              <div className="p-2 bg-[#cc8800]/40 border border-[#ffaa00] text-[#ffaa00]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-pixel">专注 (专注分钟)</div>
                <div className="text-lg font-pixel font-bold text-white">
                  {character.stats.focus} <span className="text-xs text-gray-400 font-normal">分</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141418] p-3 border-2 border-[#2c2c36] flex items-center gap-3">
              <div className="p-2 bg-[#0000aa]/40 border border-[#5555ff] text-[#5555ff]">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-pixel">防御 (连胜打卡)</div>
                <div className="text-lg font-pixel font-bold text-white">
                  {character.streakDays} <span className="text-xs text-gray-400 font-normal">天</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
