import Grid from "@material-ui/core/Grid";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React, { useEffect, useReducer } from "react";
import { TabPanel } from "../components/TabPanel";
import { useTranslation } from "next-i18next";
import { ItemButton } from "../components/ItemButton";
import {
  EQUIPMENT_TYPES,
  Item,
  sumStats,
  WeaponType,
  WEAPON_TYPES,
} from "../utils/lumiaIsland";
import Divider from "@material-ui/core/Divider";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { WeaponTypeButton } from "./WeaponTypeButton";

interface State {
  selectedEquipmentTypeIndex: number;
  selectedWeaponType: WeaponType;
  nextSelectedItemCodes: number[];
}

type Action =
  | {
      type: "SELECT_EQUIPMENT_TYPE";
      equipmentTypeIndex: number;
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
    case "SELECT_EQUIPMENT_TYPE":
      return {
        ...state,
        selectedEquipmentTypeIndex: action.equipmentTypeIndex,
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
      throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
  }
};

const initialState: State = {
  selectedEquipmentTypeIndex: 0,
  selectedWeaponType: WEAPON_TYPES[0],
  nextSelectedItemCodes: [],
};

interface Props {
  itemCodes: number[];
  weaponTypes: WeaponType[];
  onSelectedItemCodesChange: (itemCodes: number[]) => void;
}

export const BuildSelectForm: React.FC<Props> = ({
  itemCodes,
  weaponTypes,
  onSelectedItemCodesChange,
}) => {
  const [
    { selectedEquipmentTypeIndex, nextSelectedItemCodes, selectedWeaponType },
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
          value={selectedEquipmentTypeIndex}
          onChange={(_, v) =>
            dispatch({ type: "SELECT_EQUIPMENT_TYPE", equipmentTypeIndex: v })
          }
          variant="scrollable"
        >
          {EQUIPMENT_TYPES.map((et) => (
            <Tab key={et} label={t(`equipmentTypes.${et}`)} wrapped />
          ))}
        </Tabs>
        {EQUIPMENT_TYPES.map((et, i) => (
          <TabPanel key={i} value={selectedEquipmentTypeIndex} index={i}>
            <>
              {et === "Weapon" && (
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

              {Item.where({ equipmentType: et })
                .filter(
                  (i) =>
                    i.itemGrade !== "Common" &&
                    (et !== "Weapon" || i.weaponType === selectedWeaponType)
                )
                .map((item) => (
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
        ))}
      </Grid>
    </Grid>
  );
};
