import Button from "@material-ui/core/Button";
import React from "react";
import {
  calcMissingMakeMaterials,
  Character,
  craftTargetItems,
  Item,
  ItemCounts,
  WeaponType,
} from "../utils/lumiaIsland";
import { mergeMaps } from "../utils/mapHelpers";
import { CharacterImage } from "./CharacterImage";
import { Inventory } from "./Inventory";
import { RouteArea } from "./RouteArea";
import { WeaponTypeImage } from "./WeaponTypeImage";

interface Props {
  onUp: (routeIndex: number) => void;
  onDown: (routeIndex: number) => void;
  route: number[];
  requiredItemCounts: ItemCounts;
  itemCodes: number[];
  onCharacterClick: () => void;
  characterCode: number;
  startWeaponType: WeaponType;
}

const calcData = ({
  items,
  startItemCounts,
  route,
  requiredItemCounts,
}: {
  items: Item[];
  startItemCounts: ItemCounts;
  route: number[];
  requiredItemCounts: ItemCounts;
}) => {
  const data: Array<{
    resultItemCounts: ItemCounts;
    areaItemCounts: ItemCounts;
    obtainedItemCounts: ItemCounts;
    areaCode: number;
  }> = [];

  route.forEach((areaCode, index) => {
    const previousItemCounts = new Map(
      data[index - 1]?.resultItemCounts || startItemCounts
    );

    const areaItemCounts = new Map(
      [...requiredItemCounts].filter(([code, _]) =>
        Item.findByCode(code).areaCodes.includes(areaCode)
      )
    );

    const obtainedItemCounts = new Map(
      [...calcMissingMakeMaterials(items, previousItemCounts)]
        .filter(([code, _]) => areaItemCounts.has(code))
        .map(([code, count]) => [
          code,
          Math.min(areaItemCounts.get(code)!, count),
        ])
    );

    const resultItemCounts = craftTargetItems(
      items,
      mergeMaps(
        [previousItemCounts, obtainedItemCounts],
        (_, v1, v2) => v1 + v2
      )
    );

    data.push({
      resultItemCounts,
      areaItemCounts,
      obtainedItemCounts,
      areaCode,
    });
  });

  return data;
};

export const RoutePlan: React.FC<Props> = ({
  onUp,
  onDown,
  route,
  requiredItemCounts,
  itemCodes,
  onCharacterClick,
  characterCode,
  startWeaponType,
}) => {
  const items = itemCodes.map((i) => Item.findByCode(i));

  const startItemCounts = Character.findByCode(characterCode).startItemCounts(
    startWeaponType
  );

  const data = calcData({
    items,
    requiredItemCounts,
    route,
    startItemCounts,
  });

  return (
    <>
      <Button onClick={onCharacterClick}>
        <CharacterImage code={characterCode} />
        <WeaponTypeImage weaponType={startWeaponType} />
      </Button>

      <Inventory itemCounts={startItemCounts} />

      {data.map((d, i) => (
        <RouteArea
          key={i}
          onUp={() => {
            onUp(i);
          }}
          onDown={() => {
            onDown(i);
          }}
          {...d}
        />
      ))}
    </>
  );
};
