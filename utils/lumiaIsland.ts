import itemSpawnData from "../data/item_spawn.json";
import weaponData from "../data/item_weapon.json";
import armorData from "../data/item_armor.json";
import consumableData from "../data/item_consumable.json";
import miscData from "../data/item_misc.json";
import specialData from "../data/item_special.json";
import { Combination } from "js-combinatorics/commonjs/combinatorics";
import characterData from "../data/character.json";
import characterAttributesData from "../data/character_attributes.json";

export const AREA_CODES = [...new Set(itemSpawnData.map((d) => d.areaCode))];

const COMMON_ITEM_SPAWN = {
  401103: 1, // Leather
  108101: 1, // Branch
  301102: 2, // Water
  112101: 2, // Stone
  302102: 2, // Potato
  302104: 2, // Cod
  302111: 1, // Meat
  302109: 2, // Carp
};

export interface ItemCounts {
  [code: number]: number;
}

export const filterItemCodesByAreaCode = (
  itemCodes: number[],
  areaCode: number
): number[] => {
  const result = itemCodes.filter((itemCode) => {
    return itemSpawnData.some(
      (data) => data.areaCode === areaCode && data.itemCode === itemCode
    );
  });
  return result;
};

export const satisfies = (
  itemCounts: ItemCounts,
  areaCodes: number[],
  possibilities: number[] = []
) => {
  const dropCounts = areaCodes.reduce(
    (acc, areaCode, i) => {
      const possibility = possibilities[i] === undefined ? 1 : possibilities[i];

      itemSpawnData.forEach((d) => {
        if (d.areaCode === areaCode && itemCounts[d.itemCode]) {
          acc[d.itemCode] += Math.floor(
            findItemByCode(d.itemCode).initialCount * d.dropCount * possibility
          );
        }
      });

      return acc;
    },
    Object.keys(itemCounts).reduce((acc, code) => ({ ...acc, [code]: 0 }), {})
  );

  return Object.keys(itemCounts).every(
    (code) => COMMON_ITEM_SPAWN[code] || dropCounts[code] >= itemCounts[code]
  );
};

const possibleAreaCombinations = [
  ...Array(AREA_CODES.length - 1),
].flatMap((_, i) => [...Combination.of(AREA_CODES, i + 1)]);

export const findRoutes = (
  itemCounts: ItemCounts,
  possibilities: number[] = []
) => {
  return possibleAreaCombinations.filter((route) =>
    satisfies(itemCounts, route, possibilities)
  );
};

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
    ];
  } else {
    return [];
  }
};

const RARE_MATERIAL_CODES = [
  401208, // Tree of Life
  401209, // Meteorite
  401304, // Mithril
  401401, // VF Blood Sample
];

export const isFinalItemInSameType = (item: Item) => {
  if (item.makeMaterial1 === 0) {
    return false;
  }

  return !allItemsData.some(
    (i) =>
      (i.makeMaterial1 === item.code || i.makeMaterial2 === item.code) &&
      equipmentTypeFor(i) === equipmentTypeFor(item)
  );
};

export const isFinalNonRareItemInSameType = (item: Item) => {
  if (item.makeMaterial1 === 0) {
    return false;
  }

  if (requiresRareMaterial(item)) {
    return false;
  }

  return !allItemsData.some(
    (i) =>
      (i.makeMaterial1 === item.code || i.makeMaterial2 === item.code) &&
      equipmentTypeFor(i) === equipmentTypeFor(item) &&
      !requiresRareMaterial(i)
  );
};

const visitItemBuildTree = (
  item: Item,
  visitor: (i: Item) => "skip" | void
) => {
  if (visitor(item) !== "skip" && item.makeMaterial1 !== 0) {
    visitItemBuildTree(findItemByCode(item.makeMaterial1), visitor);
    visitItemBuildTree(findItemByCode(item.makeMaterial2), visitor);
  }
};

export const requiresRareMaterial = (item: Item) => {
  let result = false;
  visitItemBuildTree(item, (i) => {
    if (RARE_MATERIAL_CODES.includes(i.code)) {
      result = true;
    }
  });

  return result;
};

export const allNonRareFinalEquipments = allItemsData.filter(
  (i) => (isWeaponItem(i) || isArmorItem(i)) && isFinalNonRareItemInSameType(i)
);

export const calcMakeMaterials = (items: Item[]) => {
  const materials: Item[] = [];
  const leftoverItems: Item[] = [];

  items.forEach((item) => {
    visitItemBuildTree(item, (i) => {
      if (i.makeMaterial1 === 0) {
        materials.push(i);
      }

      let leftoverItemIndex = leftoverItems.findIndex(
        (li) => li.code === i.code
      );

      if (leftoverItemIndex !== -1) {
        leftoverItems.splice(leftoverItemIndex, 1);
        return "skip";
      }

      if (i.makeMaterial1 !== 0) {
        [...Array(i.initialCount - 1)].forEach(() => {
          leftoverItems.push(i);
        });
      }
    });
  });

  const itemCounts: ItemCounts = materials.reduce(
    (acc, item) => ({ ...acc, [item.code]: (acc[item.code] || 0) + 1 }),
    {}
  );

  return itemCounts;
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

export type Character = typeof characterData[number];
export const CHARACTERS = characterData;

export const findCharacterByCode = (code: number) => {
  return characterData.find((c) => c.code === code);
};
export const findCharacterByName = (name: string) => {
  return characterData.find((c) => c.name === name);
};
export const findWeaponTypesByCharacterCode = (code: number) => {
  return characterAttributesData
    .filter((a) => a.characterCode === code)
    .map((a) => a.mastery as WeaponType);
};
