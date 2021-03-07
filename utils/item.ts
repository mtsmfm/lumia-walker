import weaponData from "../data/item_weapon.json";
import armorData from "../data/item_armor.json";
import consumableData from "../data/item_consumable.json";
import miscData from "../data/item_misc.json";
import specialData from "../data/item_special.json";

export const EQUIPMENT_TYPES = [
  "Weapon",
  "Head",
  "Chest",
  "Arm",
  "Leg",
  "Trinket",
] as const;
export type EquipmentType = typeof EQUIPMENT_TYPES[number];

export const WEAPON_TYPES = [
  "OneHandSword",
  "TwoHandSword",
  "Axe",
  "DualSword",
  "Pistol",
  "AssaultRifle",
  "SniperRifle",
  "Rapier",
  "Spear",
  "Hammer",
  "Bat",
  "HighAngleFire",
  "DirectFire",
  "Bow",
  "CrossBow",
  "Glove",
  "Tonfa",
  "Guitar",
  "Nunchaku",
  "Whip",
] as const;
export type WeaponType = typeof WEAPON_TYPES[number];

export const ITEM_GRADE = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legend",
] as const;
export type ItemGrade = typeof ITEM_GRADE[number];

const allItemsData = [
  ...weaponData,
  ...armorData,
  ...consumableData,
  ...miscData,
  ...specialData,
];

export const findItemByCode = (code: number) => {
  return allItemsData.find((d) => d.code === code);
};

export type Item = typeof allItemsData[number];
type WeaponItem = typeof weaponData[number];
type ArmorItem = typeof armorData[number];

const nonFinalItemCodes = allItemsData.reduce((acc, item) => {
  if (item.makeMaterial1 !== 0) {
    acc.add(item.makeMaterial1);
    acc.add(item.makeMaterial2);
  }
  return acc;
}, new Set<number>());

export const isWeaponItem = (item: Item): item is WeaponItem => {
  return item.itemType === "Weapon";
};

export const isArmorItem = (item: Item): item is ArmorItem => {
  return item.itemType === "Armor";
};

const equipmentTypeFor = (item: Item): EquipmentType | undefined => {
  if (isWeaponItem(item)) {
    return "Weapon";
  } else if (isArmorItem(item)) {
    return item.armorType as EquipmentType;
  }

  return undefined;
};

export const statsFieldNames = (item: Item) => {
  if (isWeaponItem(item)) {
    return [
      "attackPower",
      "defense",
      "maxHp",
      "hpRegenRatio",
      "hpRegen",
      "spRegenRatio",
      "spRegen",
      "attackSpeedRatio",
      "criticalStrikeChance",
      "criticalStrikeDamage",
      "cooldownReduction",
      "lifeSteal",
      "moveSpeed",
      "sightRange",
      "attackRange",
      "increaseBasicAttackDamage",
      "increaseSkillDamage",
      "increaseSkillDamageRatio",
      "decreaseRecoveryToBasicAttack",
      "decreaseRecoveryToSkill",
    ];
  } else if (isArmorItem(item)) {
    return [
      "attackPower",
      "defense",
      "maxHp",
      "maxSp",
      "hpRegenRatio",
      "hpRegen",
      "spRegenRatio",
      "spRegen",
      "attackSpeedRatio",
      "criticalStrikeChance",
      "criticalStrikeDamage",
      "preventCriticalStrikeDamaged",
      "cooldownReduction",
      "lifeSteal",
      "moveSpeed",
      "sightRange",
      "outOfCombatMoveSpeed",
      "attackRange",
      "increaseBasicAttackDamage",
      "preventBasicAttackDamaged",
      "increaseSkillDamage",
      "preventSkillDamaged",
      "increaseSkillDamageRatio",
      "preventSkillDamagedRatio",
      "decreaseRecoveryToBasicAttack",
      "decreaseRecoveryToSkill",
    ];
  } else {
    return [];
  }
};

export const isFinalItem = (item: Item) => {
  return !nonFinalItemCodes.has(item.code);
};

export function findItemsByEquipmentType(equipmentType: EquipmentType): Item[] {
  if (equipmentType === "Weapon") {
    return weaponData;
  } else {
    return armorData.filter((d) => d.armorType === equipmentType);
  }
}

export const sumStats = (codes: number[]) => {
  const items = codes.map((c) => findItemByCode(c));

  return EQUIPMENT_TYPES.reduce((acc, type) => {
    const item = items.find((i) => equipmentTypeFor(i) === type);
    if (item) {
      statsFieldNames(item).forEach((f) => {
        if (item[f] !== 0) {
          acc[f] ||= 0;
          acc[f] = Number((acc[f] + item[f]).toFixed(5));
        }
      });
    }
    return acc;
  }, {});
};
