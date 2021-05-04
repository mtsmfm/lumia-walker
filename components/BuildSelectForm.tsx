import Grid from "@material-ui/core/Grid";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React, { useEffect, useReducer } from "react";
import { TabPanel } from "../components/TabPanel";
import { useTranslation } from "next-i18next";
import { ItemButton } from "../components/ItemButton";
import {
  Item,
  sumStats,
  WeaponType,
  WEAPON_TYPES,
  ARMOR_TYPES,
  CONSUMABLE_TYPES,
} from "../utils/lumiaIsland";
import Divider from "@material-ui/core/Divider";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { WeaponTypeButton } from "./WeaponTypeButton";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

interface State {
  selectedTabIndex: number;
  selectedWeaponType: WeaponType;
  nextSelectedItemCodes: number[];
}

type Action =
  | {
      type: "SELECT_TAB";
      tabIndex: number;
    }
  | {
      type: "SELECT_WEAPON_TYPE";
      weaponType: WeaponType;
    }
  | {
      type: "TOGGLE_ITEM";
      itemCode: number;
      currentItemCodes: number[];
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SELECT_TAB":
      return {
        ...state,
        selectedTabIndex: action.tabIndex,
      };
    case "SELECT_WEAPON_TYPE":
      return {
        ...state,
        selectedWeaponType: action.weaponType,
      };
    case "TOGGLE_ITEM":
      return {
        ...state,
        nextSelectedItemCodes: action.currentItemCodes.includes(action.itemCode)
          ? action.currentItemCodes.filter((c) => c !== action.itemCode)
          : [...action.currentItemCodes, action.itemCode],
      };
    default:
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
  }
};

const TAB_TYPES = [
  {
    itemType: "Weapon",
  },
  ...ARMOR_TYPES.map((t) => ({
    itemType: "Armor" as const,
    armorType: t,
  })),
  ...CONSUMABLE_TYPES.map((t) => ({
    itemType: "Consume" as const,
    consumableType: t,
  })),
  {
    itemType: "Special",
  },
] as const;

type TabType = typeof TAB_TYPES[number];

const initialState: State = {
  selectedTabIndex: 0,
  selectedWeaponType: WEAPON_TYPES[0],
  nextSelectedItemCodes: [],
};

interface Filter {
  showCommon: boolean;
  onlyFinal: boolean;
  showBuiltFromMeteorite: boolean;
  showBuiltFromTreeOfLife: boolean;
  showBuiltFromVfBloodSample: boolean;
  showBuiltFromMithril: boolean;
}

type FilterType = keyof Filter;

interface Props {
  itemCodes: number[];
  weaponTypes: WeaponType[];
  onSelectedItemCodesChange: (itemCodes: number[]) => void;
  filter: Filter;
  onToggleFilter: (f: FilterType) => void;
}

const itemsFor = (
  tabType: TabType,
  filter: Filter,
  selectedWeaponType: WeaponType
) => {
  let items: Item[];

  switch (tabType.itemType) {
    case "Weapon":
      items = Item.where({
        itemType: tabType.itemType,
        weaponType: selectedWeaponType,
      });
      break;
    case "Armor":
      items = Item.where(tabType);
      break;
    case "Consume":
      items = Item.where(tabType);
      break;
    case "Special":
      items = Item.where(tabType);
      break;
    default:
      const exhaustiveCheck: never = tabType;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
  }

  if (!filter.showCommon) {
    items = items.filter((i) => i.itemGrade !== "Common");
  }

  if (filter.onlyFinal) {
    items = items.filter((i) => i.isFinalItemInSameType);
  }

  if (!filter.showBuiltFromMeteorite) {
    items = items.filter((i) => !i.isBuiltFromMeteorite);
  }

  if (!filter.showBuiltFromTreeOfLife) {
    items = items.filter((i) => !i.isBuiltFromTreeOfLife);
  }

  if (!filter.showBuiltFromVfBloodSample) {
    items = items.filter((i) => !i.isBuiltFromVfBloodSample);
  }

  if (!filter.showBuiltFromMithril) {
    items = items.filter((i) => !i.isBuiltFromMithril);
  }

  return items;
};

const labelI18nKeyFor = (tabType: TabType) => {
  switch (tabType.itemType) {
    case "Weapon":
      return "itemTypes.Weapon";
    case "Armor":
      return `armorTypes.${tabType.armorType}`;
    case "Consume":
      return `consumableTypes.${tabType.consumableType}`;
    case "Special":
      return "itemTypes.Special";
    default:
      const exhaustiveCheck: never = tabType;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
  }
};

export const BuildSelectForm: React.FC<Props> = ({
  itemCodes,
  weaponTypes,
  onSelectedItemCodesChange,
  filter,
  onToggleFilter,
}) => {
  const [
    { selectedTabIndex, nextSelectedItemCodes, selectedWeaponType },
    dispatch,
  ] = useReducer(reducer, {
    ...initialState,
    selectedWeaponType: weaponTypes[0],
    nextSelectedItemCodes: itemCodes,
  });

  const { t } = useTranslation();

  const stats = sumStats(itemCodes);

  useEffect(() => {
    if (nextSelectedItemCodes !== itemCodes) {
      onSelectedItemCodesChange(nextSelectedItemCodes);
    }
  }, [nextSelectedItemCodes, itemCodes]);

  const selectedTabType = TAB_TYPES[selectedTabIndex];

  return (
    <Grid container>
      <Grid item xs={3}>
        <TableContainer>
          <Table size="small">
            <TableBody>
              {Object.keys(stats).map((k) => {
                return (
                  <TableRow key={k}>
                    <TableCell>{t(`stats.${k}`)}</TableCell>
                    <TableCell>{stats[k]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {itemCodes.map((code) => (
          <ItemButton
            key={code}
            code={code}
            onClick={() =>
              dispatch({
                type: "TOGGLE_ITEM",
                itemCode: code,
                currentItemCodes: itemCodes,
              })
            }
          />
        ))}
      </Grid>
      <Grid item xs={9}>
        <FormGroup row>
          {Object.keys(filter).map((k: keyof Filter) => {
            return (
              <FormControlLabel
                key={k}
                control={
                  <Checkbox
                    checked={filter[k]}
                    onClick={() => onToggleFilter(k)}
                  />
                }
                label={t(`buildSelectForm.filters.${k}`)}
              />
            );
          })}
        </FormGroup>
        <Tabs
          value={selectedTabIndex}
          onChange={(_, v) => dispatch({ type: "SELECT_TAB", tabIndex: v })}
          variant="scrollable"
        >
          {TAB_TYPES.map((tabType, i) => (
            <Tab key={i} label={t(labelI18nKeyFor(tabType))} wrapped />
          ))}
        </Tabs>
        <TabPanel value={selectedTabIndex} index={selectedTabIndex}>
          {selectedTabType.itemType === "Weapon" && (
            <>
              <Grid container>
                {weaponTypes.map((wt) => (
                  <Grid
                    key={wt}
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    style={{ display: "flex" }}
                  >
                    <WeaponTypeButton
                      weaponType={wt}
                      onClick={() =>
                        dispatch({
                          type: "SELECT_WEAPON_TYPE",
                          weaponType: wt,
                        })
                      }
                      selected={selectedWeaponType === wt}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider />
            </>
          )}

          {itemsFor(selectedTabType, filter, selectedWeaponType).map((item) => (
            <Grid container key={item.code}>
              <ItemButton
                code={item.code}
                onClick={() => {
                  dispatch({
                    type: "TOGGLE_ITEM",
                    itemCode: item.code,
                    currentItemCodes: itemCodes,
                  });
                }}
                selected={itemCodes.includes(item.code)}
              />
            </Grid>
          ))}
        </TabPanel>
      </Grid>
    </Grid>
  );
};
