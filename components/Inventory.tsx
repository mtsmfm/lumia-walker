import Grid from "@material-ui/core/Grid";
import React from "react";
import {
  EQUIPMENT_TYPES,
  Item,
  ItemCounts,
  ITEM_GRADE,
} from "../utils/lumiaIsland";
import { ItemImage } from "../components/ItemImage";
import { ItemBadge } from "../components/ItemBadge";
import { updateMap } from "../utils/mapHelpers";
import { BlankItemImage } from "./BlankItemImage";
import { useTheme } from "@material-ui/core/styles";

interface Props {
  itemCounts: ItemCounts;
}

const sliceEvenly = <T extends any>(xs: Array<T>, n: number) => {
  return [...Array(Math.ceil(xs.length / n))].map((_, i) => {
    return xs.slice(n * i, n * (i + 1));
  });
};

const EQUIPMENT_COLUMN_COUNT = EQUIPMENT_TYPES.length / 2;
const INVENTORY_COLUMN_COUNT = 5;

export const Inventory: React.FC<Props> = ({ itemCounts }) => {
  const sortedItemCounts = new Map(
    [...itemCounts].sort(
      ([code1], [code2]) =>
        ITEM_GRADE.findIndex((g) => g === Item.findByCode(code2).itemGrade) -
        ITEM_GRADE.findIndex((g) => g === Item.findByCode(code1).itemGrade)
    )
  );

  const equipments = EQUIPMENT_TYPES.map(
    (t) =>
      [...sortedItemCounts].find(
        ([code, _]) => Item.findByCode(code).equipmentType === t
      )?.[0]
  );

  const remainsItemCounts = new Map(sortedItemCounts);
  equipments.forEach((e) => {
    if (e) {
      updateMap(
        remainsItemCounts,
        e,
        (v) => v! - 1,
        (v) => v === 0
      );
    }
  });

  const { spacing } = useTheme();

  return (
    <Grid container>
      <Grid item style={{ padding: spacing(1) }}>
        {sliceEvenly(equipments, EQUIPMENT_COLUMN_COUNT).map((codes, i) => (
          <Grid container key={i}>
            {codes.map((code, j) => (
              <Grid key={`${j}-${code}`} item>
                {code && <ItemImage width={60} code={code} />}
                {!code && (
                  <BlankItemImage
                    equipmentType={
                      EQUIPMENT_TYPES[i * EQUIPMENT_COLUMN_COUNT + j]
                    }
                    width={60}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>

      <Grid item style={{ padding: spacing(1) }}>
        {sliceEvenly([...remainsItemCounts], INVENTORY_COLUMN_COUNT).map(
          (xs, i) => (
            <Grid container key={i}>
              {xs.map(([code, count]) => (
                <Grid key={`${i}-${code}`} item>
                  <ItemBadge badgeContent={count} color="primary">
                    <ItemImage width={60} code={code} />
                  </ItemBadge>
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Grid>
    </Grid>
  );
};
