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

interface Props {
  itemCodes: number[];
  weaponTypes: WeaponType[];
  onSelectedItemCodesChange: (itemCodes: number[]) => void;
}

const itemsFor = (state: State, tabType: TabType) => {
  let items: Item[];

  switch (tabType.itemType) {
    case "Weapon":
      items = Item.where({
        itemType: tabType.itemType,
        weaponType: state.selectedWeaponType,
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

  return items.filter((i) => i.itemGrade !== "Common");
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
}) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    selectedWeaponType: weaponTypes[0],
    nextSelectedItemCodes: itemCodes,
  });

  const { selectedTabIndex, nextSelectedItemCodes, selectedWeaponType } = state;

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
          <>
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

            {itemsFor(state, selectedTabType).map((item) => (
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
          </>
        </TabPanel>
      </Grid>
    </Grid>
  );
};
