import rawItemSpawnData from "../data/item_spawn.json";
import rawItemWeaponData from "../data/item_weapon.json";
import rawItemArmorData from "../data/item_armor.json";
import rawItemConsumableData from "../data/item_consumable.json";
import rawItemMiscData from "../data/item_misc.json";
import rawItemSpecialData from "../data/item_special.json";
import rawCharacterData from "../data/character.json";
import rawCharacterAttributesData from "../data/character_attributes.json";

export const AREA_CODES = [...new Set(rawItemSpawnData.map((d) => d.areaCode))];

export type ItemCounts = Map<number, number>;

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

const ITEM_TYPE = ["Weapon", "Armor", "Consume", "Misc", "Special"] as const;
type ItemType = typeof ITEM_TYPE[number];

const allItemsData = [
  ...rawItemWeaponData,
  ...rawItemArmorData,
  ...rawItemConsumableData,
  ...rawItemMiscData,
  ...rawItemSpecialData,
];

type RawItemData = typeof allItemsData[number];
type RawWeaponItemData = typeof rawItemWeaponData[number];
type RawArmorItemData = typeof rawItemArmorData[number];
export class Item {
  static ALL_ITEMS = allItemsData.reduce((map, data) => {
    const item = new Item(data);
    return map.set(item.code, item);
  }, new Map<number, Item>());

  static findByCode(code: number): Item {
    return Item.ALL_ITEMS.get(code);
  }

  static where(conditions: {
    equipmentType?: EquipmentType;
    areaCode?: number;
  }): Item[] {
    return [...Item.ALL_ITEMS.values()].filter(
      (item) =>
        (conditions.equipmentType === undefined ||
          item.equipmentType === conditions.equipmentType) &&
        (conditions.areaCode === undefined ||
          item.areaCodes.includes(conditions.areaCode))
    );
  }

  constructor(private data: RawItemData) {}

  get code() {
    return this.data.code;
  }

  get areaCodes() {
    return [...this.areaItemCounts.keys()];
  }

  get areaItemCounts() {
    return rawItemSpawnData
      .filter((d) => d.itemCode === this.code)
      .reduce(
        (acc, data) => acc.set(data.areaCode, data.dropCount),
        new Map<number, number>()
      );
  }

  get itemType() {
    return this.data.itemType as ItemType;
  }

  get equipmentType(): EquipmentType | undefined {
    switch (this.itemType) {
      case "Weapon": {
        return "Weapon" as EquipmentType;
      }
      case "Armor": {
        return (this.data as RawArmorItemData).armorType as EquipmentType;
      }
      default: {
        return undefined;
      }
    }
  }

  get weaponType(): WeaponType | undefined {
    switch (this.itemType) {
      case "Weapon": {
        return (this.data as RawWeaponItemData).weaponType as WeaponType;
      }
      default: {
        return undefined;
      }
    }
  }

  get makeMaterial1() {
    return this.data.makeMaterial1;
  }

  get makeMaterial2() {
    return this.data.makeMaterial2;
  }

  get initialCount() {
    return this.data.initialCount;
  }

  get itemGrade() {
    return this.data.itemGrade as ItemGrade;
  }

  get stackable() {
    return this.data.stackable;
  }

  get stats() {
    const fieldNames = [
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
    return fieldNames.reduce((acc, name) => {
      if (this.data[name]) {
        return {
          ...acc,
          [name]: this.data[name],
        };
      } else {
        return acc;
      }
    }, {});
  }

  get imageUrl() {
    return `${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/items/${this.code}.png`;
  }
}

const visitItemBuildTree = (
  item: Item,
  visitor: (i: Item) => "skip" | void
) => {
  if (visitor(item) !== "skip" && item.makeMaterial1 !== 0) {
    visitItemBuildTree(Item.findByCode(item.makeMaterial1), visitor);
    visitItemBuildTree(Item.findByCode(item.makeMaterial2), visitor);
  }
};

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

  const itemCounts: ItemCounts = materials.reduce((acc, item) => {
    return acc.set(item.code, (acc.get(item.code) || 0) + 1);
  }, new Map<number, number>());

  return itemCounts;
};

export const sumStats = (codes: number[]) => {
  const items = codes.map((c) => Item.findByCode(c));

  return EQUIPMENT_TYPES.reduce((acc, type) => {
    const item = items.find((i) => i.equipmentType === type);
    if (item) {
      Object.entries(item.stats).map(([k, v]) => {
        acc[k] ||= 0;
        acc[k] = Number((acc[k] + v).toFixed(5));
      });
    }
    return acc;
  }, {});
};

export class Character {
  static ALL_CHARACTERS = rawCharacterData.map((d) => new Character(d));

  constructor(private data: typeof rawCharacterData[number]) {}

  static findByCode(code: number) {
    return Character.ALL_CHARACTERS.find((c) => c.code === code);
  }

  get code() {
    return this.data.code;
  }

  get name() {
    return this.data.name;
  }

  get imageUrl() {
    return `${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/characters/${this.name}.png`;
  }
}

export const CHARACTERS = rawCharacterData;
