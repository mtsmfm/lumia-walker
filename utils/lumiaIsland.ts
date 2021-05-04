import rawItemSpawnData from "../data/item_spawn.json";
import rawItemWeaponData from "../data/item_weapon.json";
import rawItemArmorData from "../data/item_armor.json";
import rawItemConsumableData from "../data/item_consumable.json";
import rawItemMiscData from "../data/item_misc.json";
import rawItemSpecialData from "../data/item_special.json";
import rawCharacterData from "../data/character.json";
import rawCharacterAttributesData from "../data/character_attributes.json";
import rawStartItemData from "../data/start_item.json";
import rawRecommendedListData from "../data/recommended_list.json";
import rawObjectLocationsData from "../map/object_locations.json";

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

export const ITEM_TYPES = [
  "Weapon",
  "Armor",
  "Consume",
  "Misc",
  "Special",
] as const;
export type ItemType = typeof ITEM_TYPES[number];

export const ARMOR_TYPES = ["Head", "Chest", "Arm", "Leg", "Trinket"] as const;
export type ArmorType = typeof ARMOR_TYPES[number];

export const CONSUMABLE_TYPES = ["Food", "Beverage"] as const;
export type ConsumableType = typeof CONSUMABLE_TYPES[number];

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
type RawConsumableItemData = typeof rawItemConsumableData[number];
export class Item {
  static ALL_ITEMS = allItemsData.reduce((map, data) => {
    const item = new Item(data);
    return map.set(item.code, item);
  }, new Map<number, Item>());

  static METEORITE_ITEM_CODE = 401209;
  static TREE_OF_LIFE_ITEM_CODE = 401208;
  static VF_BLOOD_SAMPLE_ITEM_CODE = 401401;
  static MITHRIL_ITEM_CODE = 401304;

  static WATER_ITEM_CODE = 301102;
  static BRANCH_ITEM_CODE = 108101;
  static STONE_ITEM_CODE = 112101;
  static LEATHER_ITEM_CODE = 401103;
  static CARP_ITEM_CODE = 302109;
  static POTATO_ITEM_CODE = 302102;
  static COD_ITEM_CODE = 302104;

  static findByCode(code: number): Item {
    return Item.ALL_ITEMS.get(code);
  }

  static where(conditions: {
    equipmentType?: EquipmentType;
    areaCode?: number;
    itemType?: ItemType;
    weaponType?: WeaponType;
    armorType?: ArmorType;
    consumableType?: ConsumableType;
  }): Item[] {
    return [...Item.ALL_ITEMS.values()].filter(
      (item) =>
        (conditions.equipmentType === undefined ||
          item.equipmentType === conditions.equipmentType) &&
        (conditions.areaCode === undefined ||
          item.areaCodes.includes(conditions.areaCode)) &&
        (conditions.itemType === undefined ||
          item.itemType === conditions.itemType) &&
        (conditions.weaponType === undefined ||
          item.weaponType === conditions.weaponType) &&
        (conditions.armorType === undefined ||
          item.armorType === conditions.armorType) &&
        (conditions.consumableType === undefined ||
          item.consumableType === conditions.consumableType)
    );
  }

  constructor(private data: RawItemData) {}

  get code() {
    return this.data.code;
  }

  get areaCodes() {
    return [...this.areaItemCounts.keys()];
  }

  get areaItemCounts(): ItemCounts {
    const objectLocationKind = ({
      [Item.METEORITE_ITEM_CODE]: "meteorite",
      [Item.TREE_OF_LIFE_ITEM_CODE]: "tree of life",
      [Item.WATER_ITEM_CODE]: "water",
      [Item.BRANCH_ITEM_CODE]: "branch",
      [Item.STONE_ITEM_CODE]: "stone",
      [Item.LEATHER_ITEM_CODE]: "leather",
      [Item.CARP_ITEM_CODE]: "carp",
      [Item.POTATO_ITEM_CODE]: "potato",
      [Item.COD_ITEM_CODE]: "cod",
    } as const)[this.code];

    if (objectLocationKind) {
      if (objectLocationKind === "leather") {
        return AREA_CODES.reduce(
          (acc, areaCode) => acc.set(areaCode, 100),
          new Map<number, number>()
        );
      } else {
        return rawObjectLocationsData
          .filter(({ kind }) => kind === objectLocationKind)
          .reduce(
            (acc, { areaCode }) =>
              acc.set(areaCode, (acc.get(areaCode) || 0) + 1),
            new Map<number, number>()
          );
      }
    } else {
      return rawItemSpawnData
        .filter((d) => d.itemCode === this.code)
        .reduce(
          (acc, data) => acc.set(data.areaCode, data.dropCount),
          new Map<number, number>()
        );
    }
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

  get armorType(): ArmorType | undefined {
    switch (this.itemType) {
      case "Armor": {
        return (this.data as RawArmorItemData).armorType as ArmorType;
      }
      default: {
        return undefined;
      }
    }
  }

  get consumableType(): ConsumableType | undefined {
    switch (this.itemType) {
      case "Consume": {
        return (this.data as RawConsumableItemData)
          .consumableType as ConsumableType;
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

  get isFinalItemInSameType(): boolean {
    let items: Item[];

    switch (this.itemType) {
      case "Weapon": {
        items = Item.where({
          itemType: this.itemType,
          weaponType: this.weaponType,
        });
        break;
      }
      case "Armor": {
        items = Item.where({
          itemType: this.itemType,
          armorType: this.armorType,
        });
        break;
      }
      case "Consume": {
        items = Item.where({
          itemType: this.itemType,
          armorType: this.armorType,
        });
        break;
      }
      case "Special": {
        items = Item.where({
          itemType: this.itemType,
          armorType: this.armorType,
        });
        break;
      }
      default: {
        return true;
      }
    }

    return !items.some(
      (i) => i.makeMaterial1 === this.code || i.makeMaterial2 === this.code
    );
  }

  get isBuiltFromMeteorite(): boolean {
    return calcMakeMaterials([this]).has(Item.METEORITE_ITEM_CODE);
  }

  get isBuiltFromTreeOfLife(): boolean {
    return calcMakeMaterials([this]).has(Item.TREE_OF_LIFE_ITEM_CODE);
  }

  get isBuiltFromVfBloodSample(): boolean {
    return calcMakeMaterials([this]).has(Item.VF_BLOOD_SAMPLE_ITEM_CODE);
  }

  get isBuiltFromMithril(): boolean {
    return calcMakeMaterials([this]).has(Item.MITHRIL_ITEM_CODE);
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
  static COMMON_START_ITEM_COUNTS = rawStartItemData.reduce(
    (acc, d) => acc.set(d.itemCode, d.count),
    new Map<number, number>()
  );

  constructor(private data: typeof rawCharacterData[number]) {}

  static all() {
    return Character.ALL_CHARACTERS;
  }

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

  get weaponTypes() {
    return rawCharacterAttributesData
      .filter((d) => d.characterCode === this.code)
      .map((d) => d.mastery as WeaponType);
  }

  get startWeaponTypes() {
    return rawRecommendedListData
      .filter((d) => d.characterCode === this.code)
      .map((d) => d.mastery as WeaponType);
  }

  startItemCounts(wt: WeaponType): ItemCounts {
    const result = new Map(Character.COMMON_START_ITEM_COUNTS);
    const startWeaponCode = rawRecommendedListData.find(
      (d) => d.characterCode === this.code && d.mastery === wt
    ).startWeapon;

    result.set(startWeaponCode, 1);

    return result;
  }
}
