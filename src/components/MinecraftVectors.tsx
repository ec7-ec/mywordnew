import React from 'react';

// Custom Crisp Minecraft Pixel SVG Vector Graphics Component Library

// Grass Block Logo SVG
export const MinecraftGrassBlockSVG: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Dirt Bottom */}
    <rect x="0" y="0" width="16" height="16" fill="#866043" />
    <rect x="2" y="10" width="3" height="3" fill="#573d26" />
    <rect x="10" y="11" width="4" height="2" fill="#573d26" />
    <rect x="6" y="13" width="3" height="2" fill="#573d26" />
    <rect x="1" y="6" width="2" height="2" fill="#573d26" />

    {/* Grass Top & Drips */}
    <rect x="0" y="0" width="16" height="5" fill="#5b8731" />
    <rect x="0" y="5" width="2" height="3" fill="#5b8731" />
    <rect x="4" y="5" width="3" height="2" fill="#5b8731" />
    <rect x="8" y="5" width="2" height="4" fill="#5b8731" />
    <rect x="12" y="5" width="3" height="2" fill="#5b8731" />

    {/* Grass Top Highlight Layer */}
    <rect x="0" y="0" width="16" height="2" fill="#73a938" />
    <rect x="3" y="1" width="4" height="2" fill="#87c443" />
    <rect x="10" y="1" width="5" height="2" fill="#87c443" />

    {/* Border Frame */}
    <rect x="0" y="0" width="16" height="1" fill="#38541e" />
  </svg>
);

// Diamond Vector SVG
export const MinecraftDiamondSVG: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <path d="M5 2h6v2h2v3h-1v2h-2v2h-2v3H8v-3H6v-2H4V7H3V4h2V2z" fill="#55ffff" />
    <path d="M6 3h4v1H6z" fill="#ffffff" />
    <path d="M4 5h3v1H4z" fill="#ffffff" />
    <path d="M3 4h2v2H3z" fill="#33c9c9" />
    <path d="M11 4h2v2h-2z" fill="#209898" />
    <path d="M5 7h6v2H5z" fill="#1fa8a8" />
    <path d="M6 9h4v2H6z" fill="#136e6e" />
    <path d="M7 11h2v3H7z" fill="#0d4d4d" />
  </svg>
);

// Emerald Vector SVG
export const MinecraftEmeraldSVG: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <path d="M5 1h6v2h3v6h-2v4h-2v2H6v-2H4V9H2V3h3V1z" fill="#17b037" />
    <path d="M6 2h4v2H6z" fill="#55ff55" />
    <path d="M4 4h3v3H4z" fill="#7dff7d" />
    <path d="M3 3h2v2H3z" fill="#aaffaa" />
    <path d="M11 3h2v4h-2z" fill="#0e7823" />
    <path d="M5 7h6v4H5z" fill="#0d8525" />
    <path d="M6 11h4v3H6z" fill="#085417" />
  </svg>
);

// Gold Ingot SVG
export const MinecraftGoldIngotSVG: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <rect x="3" y="5" width="10" height="7" fill="#fdb813" />
    <rect x="4" y="4" width="8" height="2" fill="#ffe066" />
    <rect x="3" y="5" width="2" height="5" fill="#ffe066" />
    <rect x="11" y="6" width="2" height="6" fill="#c48a00" />
    <rect x="3" y="11" width="10" height="2" fill="#9e6f00" />
    <rect x="4" y="6" width="2" height="2" fill="#ffffff" />
  </svg>
);

// XP Orb SVG
export const MinecraftXPOrbSVG: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <circle cx="8" cy="8" r="6" fill="#88ff00" />
    <circle cx="8" cy="8" r="4" fill="#ccff66" />
    <rect x="6" y="6" width="2" height="2" fill="#ffffff" />
    <rect x="0" y="0" width="16" height="16" fill="none" />
  </svg>
);

// Minecraft Heart SVG
export const MinecraftHeartSVG: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 9 9" className={className} shapeRendering="crispEdges">
    {/* Heart Outline */}
    <path d="M1 1h3v1h1V1h3v1h1v3h-1v1h-1v1h-1v1h-1v1h-1V8h-1V7h-1V6h-1V5h-1V2h1V1z" fill="#000000" />
    {/* Inner Heart Color */}
    {filled ? (
      <>
        <rect x="2" y="2" width="2" height="3" fill="#ff2222" />
        <rect x="5" y="2" width="2" height="3" fill="#ff2222" />
        <rect x="2" y="5" width="5" height="1" fill="#ff2222" />
        <rect x="3" y="6" width="3" height="1" fill="#ff2222" />
        <rect x="4" y="7" width="1" height="1" fill="#ff2222" />
        {/* Highlight */}
        <rect x="2" y="2" width="1" height="1" fill="#ffaaaa" />
        <rect x="5" y="2" width="1" height="1" fill="#ffffff" />
      </>
    ) : (
      <rect x="2" y="2" width="5" height="5" fill="#3a3a3a" />
    )}
  </svg>
);

// Diamond Pickaxe Vector SVG
export const MinecraftPickaxeSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#55ffff',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Pickaxe Head */}
    <rect x="9" y="1" width="6" height="2" fill={color} />
    <rect x="13" y="3" width="2" height="3" fill={color} />
    <rect x="8" y="2" width="2" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="2" fill="#ffffff" />

    {/* Pickaxe Handle */}
    <rect x="8" y="4" width="2" height="2" fill="#8b5a2b" />
    <rect x="6" y="6" width="2" height="2" fill="#8b5a2b" />
    <rect x="4" y="8" width="2" height="2" fill="#8b5a2b" />
    <rect x="2" y="10" width="2" height="2" fill="#8b5a2b" />
    <rect x="1" y="12" width="2" height="2" fill="#5c3a21" />

    {/* Metal Joint */}
    <rect x="7" y="3" width="2" height="2" fill="#209898" />
  </svg>
);

// Diamond Sword Vector SVG
export const MinecraftSwordSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#55ffff',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Sword Tip & Blade */}
    <rect x="13" y="1" width="2" height="2" fill="#ffffff" />
    <rect x="11" y="2" width="3" height="3" fill={color} />
    <rect x="9" y="4" width="3" height="3" fill={color} />
    <rect x="7" y="6" width="3" height="3" fill={color} />
    <rect x="5" y="8" width="3" height="3" fill={color} />

    {/* Guard */}
    <rect x="3" y="10" width="3" height="2" fill="#ffaa00" />
    <rect x="6" y="9" width="2" height="3" fill="#ffaa00" />

    {/* Handle & Pommel */}
    <rect x="2" y="12" width="2" height="2" fill="#8b5a2b" />
    <rect x="1" y="14" width="2" height="2" fill="#5c3a21" />
  </svg>
);

// Helmet Vector SVG
export const MinecraftHelmetSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#55ffff',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <rect x="2" y="3" width="12" height="8" fill={color} />
    <rect x="1" y="4" width="14" height="6" fill={color} />
    <rect x="3" y="2" width="10" height="2" fill={color} />
    <rect x="3" y="4" width="3" height="2" fill="#ffffff" opacity={0.5} />
    {/* Visor Cutout */}
    <rect x="3" y="8" width="10" height="3" fill="#101014" />
    <rect x="7" y="7" width="2" height="4" fill={color} />
  </svg>
);

// Chestplate Vector SVG
export const MinecraftChestplateSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#55ffff',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Shoulder Pads */}
    <rect x="1" y="3" width="4" height="4" fill={color} />
    <rect x="11" y="3" width="4" height="4" fill={color} />
    {/* Neck Cutout */}
    <rect x="6" y="3" width="4" height="3" fill="#101014" />
    {/* Main Chest Body */}
    <rect x="2" y="6" width="12" height="8" fill={color} />
    <rect x="3" y="5" width="2" height="2" fill="#ffffff" opacity={0.5} />
    <rect x="3" y="13" width="10" height="1" fill="#000000" />
  </svg>
);

// Leggings Vector SVG
export const MinecraftLeggingsSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#55ffff',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <rect x="3" y="2" width="10" height="3" fill={color} />
    <rect x="3" y="5" width="4" height="9" fill={color} />
    <rect x="9" y="5" width="4" height="9" fill={color} />
    <rect x="4" y="3" width="2" height="1" fill="#ffffff" opacity={0.5} />
  </svg>
);

// Boots Vector SVG
export const MinecraftBootsSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#55ffff',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <rect x="2" y="8" width="5" height="6" fill={color} />
    <rect x="9" y="8" width="5" height="6" fill={color} />
    <rect x="1" y="11" width="6" height="3" fill={color} />
    <rect x="8" y="11" width="6" height="3" fill={color} />
    <rect x="3" y="9" width="1" height="2" fill="#ffffff" opacity={0.5} />
  </svg>
);

// Trident Vector SVG
export const MinecraftTridentSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#00aaaa',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Prongs */}
    <rect x="4" y="1" width="1" height="4" fill={color} />
    <rect x="8" y="0" width="1" height="5" fill="#55ffff" />
    <rect x="12" y="1" width="1" height="4" fill={color} />
    {/* Base of prongs */}
    <rect x="4" y="4" width="9" height="2" fill={color} />
    {/* Shaft */}
    <rect x="7" y="6" width="3" height="9" fill={color} />
    <rect x="8" y="6" width="1" height="9" fill="#ffffff" opacity={0.3} />
  </svg>
);

// Bow Vector SVG
export const MinecraftBowSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#8b5a2b',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Bow Curve */}
    <rect x="2" y="1" width="3" height="2" fill={color} />
    <rect x="1" y="3" width="2" height="3" fill={color} />
    <rect x="1" y="6" width="2" height="4" fill={color} />
    <rect x="1" y="10" width="2" height="3" fill={color} />
    <rect x="2" y="13" width="3" height="2" fill={color} />
    {/* Bow String */}
    <rect x="5" y="2" width="1" height="12" fill="#ffffff" />
    {/* Arrow resting */}
    <rect x="2" y="7" width="9" height="1" fill="#888888" />
    <rect x="11" y="6" width="2" height="3" fill="#dddddd" />
  </svg>
);

// Crossbow Vector SVG
export const MinecraftCrossbowSVG: React.FC<{ color?: string; className?: string }> = ({
  color = '#e0e0e0',
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Stock */}
    <rect x="2" y="7" width="12" height="3" fill="#8b5a2b" />
    <rect x="2" y="10" width="3" height="3" fill="#5c3a21" />
    {/* Bow Prod */}
    <rect x="10" y="1" width="3" height="14" fill={color} />
    {/* Iron Mechanism */}
    <rect x="6" y="6" width="4" height="5" fill="#a8a8a8" />
    {/* String */}
    <rect x="3" y="3" width="8" height="1" fill="#ffffff" />
    <rect x="3" y="12" width="8" height="1" fill="#ffffff" />
  </svg>
);

// Book and Quill SVG
export const MinecraftBookSVG: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Book Cover */}
    <rect x="2" y="3" width="10" height="11" fill="#8b0000" />
    <rect x="2" y="3" width="2" height="11" fill="#550000" />
    <rect x="4" y="4" width="7" height="9" fill="#ffffd0" />
    <rect x="5" y="6" width="5" height="1" fill="#555555" />
    <rect x="5" y="8" width="5" height="1" fill="#555555" />

    {/* Quill Feather */}
    <path d="M12 1h3v4h-1V4h-1V3h-1V1z" fill="#ffffff" />
    <rect x="11" y="5" width="2" height="2" fill="#d0d0d0" />
    <rect x="10" y="7" width="2" height="2" fill="#101014" />
  </svg>
);

// Totem Vector SVG
export const MinecraftTotemSVG: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    <rect x="5" y="2" width="6" height="12" fill="#ffff55" />
    <rect x="1" y="5" width="14" height="3" fill="#ffff55" />
    <rect x="6" y="3" width="4" height="2" fill="#ffaa00" />
    {/* Eyes */}
    <rect x="3" y="6" width="2" height="2" fill="#55ff55" />
    <rect x="11" y="6" width="2" height="2" fill="#55ff55" />
    <rect x="7" y="10" width="2" height="3" fill="#ffaa00" />
  </svg>
);

// Helper to extract item color from item ID or material tier
const getItemTierColor = (itemId: string | null | undefined): string | null => {
  if (!itemId) return null;
  if (itemId.includes('netherite')) return '#343038';
  if (itemId.includes('diamond')) return '#55ffff';
  if (itemId.includes('iron')) return '#d0d0d0';
  if (itemId.includes('stone')) return '#888888';
  if (itemId.includes('gold')) return '#ffaa00';
  if (itemId.includes('wood') || itemId.includes('leather')) return '#8b5a2b';
  if (itemId === 'hat_iron_helmet') return '#d0d0d0';
  if (itemId === 'hat_diamond_helmet') return '#55ffff';
  if (itemId === 'hat_netherite_helmet') return '#343038';
  if (itemId === 'hat_leather_cap') return '#83522a';
  if (itemId === 'outfit_iron_chestplate') return '#d0d0d0';
  if (itemId === 'outfit_gold_armor') return '#ffaa00';
  if (itemId === 'outfit_diamond_chest') return '#55ffff';
  return null;
};

// Detailed Steve Character Canvas Render SVG
export const MinecraftSteveAvatarSVG: React.FC<{
  equipped?: {
    helmet?: string | null;
    chestplate?: string | null;
    leggings?: string | null;
    boots?: string | null;
    melee?: string | null;
    ranged?: string | null;
  };
  hat?: string | null;
  outfit?: string | null;
  item?: string | null;
  className?: string;
}> = ({ equipped, hat, outfit, item, className = 'w-36 h-48' }) => {
  // Extract equipped IDs with fallback to legacy props
  const helmetId = equipped?.helmet || hat;
  const chestId = equipped?.chestplate || outfit;
  const leggingsId = equipped?.leggings;
  const bootsId = equipped?.boots;
  const meleeId = equipped?.melee || item;
  const rangedId = equipped?.ranged;

  const helmetColor = getItemTierColor(helmetId);
  const chestColor = getItemTierColor(chestId) || '#008080';
  const leggingsColor = getItemTierColor(leggingsId) || '#1e293b';
  const bootsColor = getItemTierColor(bootsId) || '#111115';

  return (
    <svg viewBox="0 0 32 48" className={className} shapeRendering="crispEdges">
      {/* 1. HEAD BASE */}
      {/* Hair */}
      <rect x="10" y="2" width="12" height="4" fill="#4a2e18" />
      {/* Skin */}
      <rect x="10" y="6" width="12" height="8" fill="#c49a6c" />
      {/* Eyes */}
      <rect x="11" y="9" width="3" height="2" fill="#ffffff" />
      <rect x="13" y="9" width="1" height="2" fill="#3b5998" />
      <rect x="18" y="9" width="3" height="2" fill="#ffffff" />
      <rect x="18" y="9" width="1" height="2" fill="#3b5998" />
      {/* Nose & Mouth */}
      <rect x="15" y="11" width="2" height="1" fill="#9c7247" />
      <rect x="14" y="12" width="4" height="1" fill="#7a4622" />

      {/* HELMET OVERLAY IF EQUIPPED */}
      {helmetColor && (
        <>
          <rect x="9" y="1" width="14" height="6" fill={helmetColor} />
          <rect x="9" y="7" width="3" height="6" fill={helmetColor} />
          <rect x="20" y="7" width="3" height="6" fill={helmetColor} />
          <rect x="9" y="1" width="14" height="2" fill="#ffffff" opacity={0.3} />
        </>
      )}

      {/* 2. TORSO / CHEST & ARMS */}
      {/* Left Arm (holds ranged weapon) */}
      <rect x="5" y="14" width="4" height="14" fill={chestColor} />
      <rect x="5" y="22" width="4" height="6" fill="#c49a6c" />

      {/* Chestplate / Shirt */}
      <rect x="10" y="14" width="12" height="14" fill={chestColor} />
      {/* Neck cutout if default shirt */}
      {chestColor === '#008080' && <rect x="14" y="14" width="4" height="3" fill="#c49a6c" />}
      <rect x="10" y="14" width="12" height="2" fill="#ffffff" opacity={0.2} />

      {/* Right Arm (holds melee weapon) */}
      <rect x="23" y="14" width="4" height="14" fill={chestColor} />
      <rect x="23" y="22" width="4" height="6" fill="#c49a6c" />

      {/* 3. LEGS / LEGGINGS */}
      <rect x="10" y="28" width="5.5" height="13" fill={leggingsColor} />
      <rect x="16.5" y="28" width="5.5" height="13" fill={leggingsColor} />
      <rect x="10" y="28" width="12" height="1" fill="#000000" opacity={0.4} />

      {/* 4. BOOTS / SHOES */}
      <rect x="10" y="41" width="5.5" height="3" fill={bootsColor} />
      <rect x="16.5" y="41" width="5.5" height="3" fill={bootsColor} />

      {/* 5. RANGED WEAPON (LEFT HAND OVERLAY) */}
      {rangedId && (
        <g transform="translate(1, 16) scale(0.65)">
          {rangedId.includes('crossbow') ? (
            <MinecraftCrossbowSVG color={getItemTierColor(rangedId) || '#e0e0e0'} className="w-8 h-8" />
          ) : (
            <MinecraftBowSVG color={getItemTierColor(rangedId) || '#8b5a2b'} className="w-8 h-8" />
          )}
        </g>
      )}

      {/* 6. MELEE WEAPON (RIGHT HAND OVERLAY) */}
      {meleeId && (
        <g transform="translate(24, 18) scale(0.7)">
          {meleeId.includes('trident') ? (
            <MinecraftTridentSVG color={getItemTierColor(meleeId) || '#00aaaa'} className="w-8 h-8" />
          ) : meleeId === 'item_diamond_pickaxe' ? (
            <MinecraftPickaxeSVG color="#55ffff" className="w-8 h-8" />
          ) : meleeId === 'item_book_quill' ? (
            <MinecraftBookSVG className="w-8 h-8" />
          ) : meleeId === 'item_totem' ? (
            <MinecraftTotemSVG className="w-8 h-8" />
          ) : (
            <MinecraftSwordSVG color={getItemTierColor(meleeId) || '#8b5a2b'} className="w-8 h-8" />
          )}
        </g>
      )}
    </svg>
  );
};

// Minecraft Anvil Crafting Bench SVG
export const MinecraftAnvilSVG: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
    {/* Anvil Base */}
    <rect x="2" y="13" width="12" height="2" fill="#2a2a35" />
    <rect x="3" y="11" width="10" height="2" fill="#3f3f4e" />
    {/* Middle Neck */}
    <rect x="6" y="7" width="4" height="4" fill="#505062" />
    {/* Top Plate */}
    <rect x="1" y="2" width="14" height="5" fill="#686880" />
    <rect x="1" y="2" width="14" height="1" fill="#8d8da6" />
    <rect x="2" y="3" width="5" height="2" fill="#a0a0be" />
    <rect x="0" y="3" width="1" height="3" fill="#505062" />
    <rect x="15" y="3" width="1" height="2" fill="#505062" />
  </svg>
);

// Minecraft Ore Block SVG Vector Component
export const MinecraftOreBlockSVG: React.FC<{ tier: string; className?: string }> = ({
  tier,
  className = 'w-6 h-6',
}) => {
  let baseColor = '#6d6d75'; // Stone Base
  let oreColor = '#55ffff';  // Ore Speckles

  if (tier === 'wood') {
    baseColor = '#8b5a2b';
    oreColor = '#5c3a21';
  } else if (tier === 'stone') {
    baseColor = '#888899';
    oreColor = '#555566';
  } else if (tier === 'gold') {
    baseColor = '#6d6d75';
    oreColor = '#ffaa00';
  } else if (tier === 'iron') {
    baseColor = '#6d6d75';
    oreColor = '#d0d0d0';
  } else if (tier === 'diamond') {
    baseColor = '#505060';
    oreColor = '#55ffff';
  } else if (tier === 'netherite') {
    baseColor = '#343038';
    oreColor = '#ffaa00';
  }

  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
      {/* Stone / Wood Block Background */}
      <rect x="0" y="0" width="16" height="16" fill={baseColor} />
      {/* Top Highlight border */}
      <rect x="0" y="0" width="16" height="1" fill="#ffffff" opacity={0.25} />
      {/* Shading */}
      <rect x="0" y="15" width="16" height="1" fill="#000000" opacity={0.4} />
      <rect x="15" y="0" width="1" height="16" fill="#000000" opacity={0.3} />

      {/* Ore Speckles / Mineral Flecks */}
      {tier === 'wood' ? (
        <>
          <rect x="3" y="2" width="10" height="12" fill="#754a22" />
          <rect x="6" y="5" width="4" height="6" fill="#a06a38" />
          <rect x="7" y="6" width="2" height="4" fill="#c48a4c" />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="3" height="3" fill={oreColor} />
          <rect x="10" y="2" width="3" height="2" fill={oreColor} />
          <rect x="2" y="9" width="4" height="2" fill={oreColor} />
          <rect x="9" y="8" width="4" height="4" fill={oreColor} />
          <rect x="6" y="12" width="3" height="2" fill={oreColor} />
          <rect x="11" y="11" width="2" height="3" fill={oreColor} />
          {/* Sparkle highlights on mineral */}
          <rect x="4" y="3" width="1" height="1" fill="#ffffff" />
          <rect x="10" y="9" width="1" height="1" fill="#ffffff" />
        </>
      )}
    </svg>
  );
};



