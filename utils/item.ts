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
