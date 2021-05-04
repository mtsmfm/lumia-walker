import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import React, { useEffect, useReducer } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ItemButton } from "../components/ItemButton";
import {
  Item,
  calcMakeMaterials,
  WeaponType,
  Character,
} from "../utils/lumiaIsland";
import Divider from "@material-ui/core/Divider";
import { LumiaIslandMap } from "../components/LumiaIslandMap";
import { ItemImage } from "../components/ItemImage";
import { ItemBadge } from "../components/ItemBadge";
import { CharacterImage } from "../components/CharacterImage";
import { ItemCounts } from "../utils/lumiaIsland";
import Dialog from "@material-ui/core/Dialog";
import { CharacterSelectorForm } from "../components/CharacterSelectorForm";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useRouter } from "next/router";
import AddIcon from "@material-ui/icons/Add";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import { BuildSelectForm } from "../components/BuildSelectForm";
import { WeaponTypeImage } from "../components/WeaponTypeImage";

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

interface State {
  users: Array<{
    selectedCharacterCode: number;
    selectedStartWeaponType: WeaponType;
    selectedItemsCodes: number[];
    selectedRoute: number[];
  }>;
  requiredItemCounts: ItemCounts;
  missingItemCounts: ItemCounts;
  characterSelectForm: {
    open: boolean;
    userIndex: number;
  };
  buildSelectForm: {
    open: boolean;
    userIndex: number;
    filter: React.ComponentProps<typeof BuildSelectForm>["filter"];
  };
}

type Action =
  | {
      type: "INIT";
      users: State["users"];
    }
  | {
      type: "SELECT_CHARACTER";
      characterCode: number;
      weaponType: WeaponType;
    }
  | {
      type: "OPEN_CHARACTER_SELECT_FORM";
      userIndex: number;
    }
  | {
      type: "CLOSE_CHARACTER_SELECT_FORM";
    }
  | {
      type: "ADD_NEW_USER";
    }
  | {
      type: "OPEN_BUILD_SELECT_FORM";
      userIndex: number;
    }
  | {
      type: "CLOSE_BUILD_SELECT_FORM";
    }
  | {
      type: "SELECT_ITEMS";
      itemCodes: number[];
    }
  | {
      type: "CHANGE_ROUTES";
      routes: number[][];
    }
  | {
      type: "TOGGLE_BUILD_SELECT_FORM_FILTER";
      filterType: keyof React.ComponentProps<typeof BuildSelectForm>["filter"];
    };

const calcItemCounts = (users: State["users"]) => {
  const allTargetItems = users
    .flatMap((u) => u.selectedItemsCodes)
    .map((code) => Item.findByCode(code));

  const requiredItemCounts = calcMakeMaterials(allTargetItems);
  const allAreaCodes = new Set(users.flatMap((u) => u.selectedRoute));
  const missingItemCounts = [...requiredItemCounts]
    .filter(
      ([itemCode, _]) =>
        !Item.findByCode(itemCode).areaCodes.some((c) => allAreaCodes.has(c))
    )
    .reduce(
      (acc, [code, count]) => acc.set(code, count),
      new Map<number, number>()
    );

  return {
    requiredItemCounts,
    missingItemCounts,
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "INIT": {
      return {
        ...state,
        ...calcItemCounts(action.users),
        users: action.users,
      };
    }
    case "SELECT_CHARACTER": {
      return {
        ...state,
        users: state.users.map((u, i) => {
          if (i == state.characterSelectForm.userIndex) {
            return {
              ...u,
              selectedCharacterCode: action.characterCode,
              selectedStartWeaponType: action.weaponType,
            };
          } else {
            return u;
          }
        }),
      };
    }
    case "OPEN_CHARACTER_SELECT_FORM": {
      return {
        ...state,
        characterSelectForm: {
          ...state.characterSelectForm,
          open: true,
          userIndex: action.userIndex,
        },
      };
    }
    case "CLOSE_CHARACTER_SELECT_FORM": {
      return {
        ...state,
        characterSelectForm: {
          ...state.characterSelectForm,
          open: false,
        },
      };
    }
    case "ADD_NEW_USER": {
      const c = Character.all()[0];

      return {
        ...state,
        users: [
          ...state.users,
          {
            selectedCharacterCode: c.code,
            selectedStartWeaponType: c.weaponTypes[0],
            selectedItemsCodes: [],
            selectedRoute: [],
          },
        ],
        characterSelectForm: {
          open: true,
          userIndex: state.users.length,
        },
      };
    }
    case "OPEN_BUILD_SELECT_FORM": {
      return {
        ...state,
        buildSelectForm: {
          ...state.buildSelectForm,
          open: true,
          userIndex: action.userIndex,
        },
      };
    }
    case "CLOSE_BUILD_SELECT_FORM": {
      return {
        ...state,
        buildSelectForm: {
          ...state.buildSelectForm,
          open: false,
        },
      };
    }
    case "SELECT_ITEMS": {
      const nextUsers = state.users.map((u, i) => {
        if (i === state.buildSelectForm.userIndex) {
          return {
            ...u,
            selectedItemsCodes: action.itemCodes,
          };
        } else {
          return {
            ...u,
          };
        }
      });

      return {
        ...state,
        ...calcItemCounts(nextUsers),
        users: nextUsers,
      };
    }
    case "CHANGE_ROUTES": {
      const nextUsers = state.users.map((u, i) => {
        return { ...u, selectedRoute: action.routes[i] || [] };
      });
      return {
        ...state,
        ...calcItemCounts(nextUsers),
        users: nextUsers,
      };
    }
    case "TOGGLE_BUILD_SELECT_FORM_FILTER": {
      return {
        ...state,
        buildSelectForm: {
          ...state.buildSelectForm,
          filter: {
            ...state.buildSelectForm.filter,
            [action.filterType]: !state.buildSelectForm.filter[
              action.filterType
            ],
          },
        },
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
    }
  }
};

const calcAllItemCounts = (users: State["users"]) => {
  const allItemCounts = new Map<number, number>();

  users.forEach((u) => {
    [
      ...Character.findByCode(u.selectedCharacterCode).startItemCounts(
        u.selectedStartWeaponType
      ),
    ].forEach(([code, count]) =>
      allItemCounts.set(code, (allItemCounts.get(code) || 0) + count)
    );
  });

  [...new Set(users.flatMap((u) => u.selectedRoute))].forEach((areaCode) => {
    Item.where({ areaCode }).forEach((item) => {
      allItemCounts.set(
        item.code,
        (allItemCounts.get(item.code) || 0) +
          item.areaItemCounts.get(areaCode) * item.initialCount
      );
    });
  });

  return allItemCounts;
};

const initialState: State = {
  users: [],
  requiredItemCounts: new Map(),
  missingItemCounts: new Map(),
  characterSelectForm: {
    open: false,
    userIndex: 0,
  },
  buildSelectForm: {
    open: false,
    userIndex: 0,
    filter: {
      showCommon: false,
      onlyFinal: true,
      showBuiltFromTreeOfLife: false,
      showBuiltFromMeteorite: false,
      showBuiltFromVfBloodSample: false,
      showBuiltFromMithril: false,
      onlyBuildable: false,
    },
  },
};

export default function Home() {
  const { t } = useTranslation();

  const [
    {
      users,
      requiredItemCounts,
      characterSelectForm,
      buildSelectForm,
      missingItemCounts,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const router = useRouter();

  const usersJson = JSON.stringify(users);

  useEffect(() => {
    if (router.query.data) {
      const queryUsersJson = decodeURIComponent(router.query.data as string);
      if (queryUsersJson !== usersJson) {
        const users = router.query.data ? JSON.parse(queryUsersJson) : [];
        dispatch({ type: "INIT", users });
      }
    } else {
      dispatch({ type: "INIT", users: [] });
    }
  }, [router.query.data]);

  useEffect(() => {
    if (users.length > 0) {
      router.push(`?data=${encodeURIComponent(usersJson)}`);
    }
  }, [usersJson]);

  return (
    <div>
      <main>
        <Container maxWidth="xl">
          <Grid container>
            <Grid item xs={3}>
              <LumiaIslandMap
                routes={users.map((u) => u.selectedRoute)}
                users={users.map((u) => u.selectedCharacterCode)}
                onRoutesChange={(routes) =>
                  dispatch({
                    type: "CHANGE_ROUTES",
                    routes,
                  })
                }
              />
            </Grid>
            <Grid item xs={9}>
              <Grid container>
                {users.map((u, i) => {
                  return (
                    <Grid item xs={4} key={i}>
                      <Button
                        onClick={() => {
                          dispatch({
                            type: "OPEN_CHARACTER_SELECT_FORM",
                            userIndex: i,
                          });
                        }}
                      >
                        <CharacterImage code={u.selectedCharacterCode} />
                      </Button>
                      {u.selectedItemsCodes.map((c) => (
                        <ItemButton
                          key={c}
                          code={c}
                          onClick={() => {
                            dispatch({
                              type: "OPEN_BUILD_SELECT_FORM",
                              userIndex: i,
                            });
                          }}
                        />
                      ))}
                      <IconButton
                        color="primary"
                        onClick={() => {
                          dispatch({
                            type: "OPEN_BUILD_SELECT_FORM",
                            userIndex: i,
                          });
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  );
                })}
                {users.length < 3 && (
                  <IconButton
                    color="primary"
                    onClick={() => {
                      dispatch({ type: "ADD_NEW_USER" });
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid container alignItems="center">
                {[...requiredItemCounts].map(([code, count]) => (
                  <ItemBadge key={code} badgeContent={count} color="primary">
                    <ItemImage width={60} key={code} code={Number(code)} />
                  </ItemBadge>
                ))}
              </Grid>
              <HelpIcon />
              <Grid container alignItems="center">
                {[...missingItemCounts].map(([code, count]) => (
                  <ItemBadge key={code} badgeContent={count} color="primary">
                    <ItemImage width={60} key={code} code={Number(code)} />
                  </ItemBadge>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid container>
            {users.map((u, i) => {
              const character = Character.findByCode(u.selectedCharacterCode);

              return (
                <Grid item xs={4} key={i}>
                  <Button
                    key={i}
                    onClick={() => {
                      dispatch({
                        type: "OPEN_CHARACTER_SELECT_FORM",
                        userIndex: i,
                      });
                    }}
                  >
                    <CharacterImage code={u.selectedCharacterCode} />
                    <WeaponTypeImage weaponType={u.selectedStartWeaponType} />
                  </Button>
                  <Grid container>
                    {[
                      ...character.startItemCounts(u.selectedStartWeaponType),
                    ].map(([code, count]) => (
                      <ItemBadge
                        key={code}
                        badgeContent={count}
                        color="primary"
                      >
                        <ItemImage width={60} code={code} />
                      </ItemBadge>
                    ))}
                  </Grid>
                  {u.selectedRoute.map((r, j) => (
                    <div key={`${i}-${j}`}>
                      <Typography gutterBottom>{t(`areas.${r}`)}</Typography>

                      <Grid container>
                        {[...requiredItemCounts.keys()]
                          .map((c) => Item.findByCode(c))
                          .filter(({ areaCodes }) => areaCodes.includes(r))
                          .map(({ code }) => (
                            <Grid key={`${i}-${code}`} item>
                              <ItemBadge
                                key={`${i}-${code}`}
                                badgeContent={requiredItemCounts.get(code)}
                                color="primary"
                              >
                                <ItemImage width={60} code={code} />
                              </ItemBadge>
                            </Grid>
                          ))}
                      </Grid>
                    </div>
                  ))}
                </Grid>
              );
            })}
          </Grid>
          <Dialog
            onClose={() => {
              dispatch({ type: "CLOSE_CHARACTER_SELECT_FORM" });
            }}
            open={characterSelectForm.open}
          >
            <CharacterSelectorForm
              selectedCharacterCode={
                users[characterSelectForm.userIndex]?.selectedCharacterCode
              }
              onSelect={(characterCode, weaponType) => {
                dispatch({
                  type: "SELECT_CHARACTER",
                  characterCode,
                  weaponType,
                });
              }}
              selectedWeaponType={
                users[characterSelectForm.userIndex]?.selectedStartWeaponType
              }
            />
          </Dialog>
          <Dialog
            maxWidth="lg"
            fullWidth
            onClose={() => {
              dispatch({ type: "CLOSE_BUILD_SELECT_FORM" });
            }}
            open={buildSelectForm.open}
          >
            <BuildSelectForm
              itemCounts={calcAllItemCounts(users)}
              weaponTypes={
                users[buildSelectForm.userIndex]
                  ? Character.findByCode(
                      users[buildSelectForm.userIndex].selectedCharacterCode
                    ).weaponTypes
                  : []
              }
              itemCodes={
                users[buildSelectForm.userIndex]?.selectedItemsCodes || []
              }
              onSelectedItemCodesChange={(itemCodes) => {
                dispatch({
                  type: "SELECT_ITEMS",
                  itemCodes,
                });
              }}
              filter={buildSelectForm.filter}
              onToggleFilter={(f) => {
                dispatch({
                  type: "TOGGLE_BUILD_SELECT_FORM_FILTER",
                  filterType: f,
                });
              }}
            />
          </Dialog>
          <Divider />
          {t("footer.copyright")}
        </Container>
      </main>
    </div>
  );
}
