import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ItemButton } from "../components/ItemButton";
import { Character } from "../utils/lumiaIsland";
import Divider from "@material-ui/core/Divider";
import { LumiaIslandMap } from "../components/LumiaIslandMap";
import { ItemImage } from "../components/ItemImage";
import { ItemBadge } from "../components/ItemBadge";
import { CharacterImage } from "../components/CharacterImage";
import Dialog from "@material-ui/core/Dialog";
import { CharacterSelectorForm } from "../components/CharacterSelectorForm";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import { BuildSelectForm } from "../components/BuildSelectForm";
import { WeaponTypeImage } from "../components/WeaponTypeImage";
import { useHomeState } from "../hooks/useHomeState";
import { useQueryParamStore } from "../hooks/useQueryParamStore";
import SearchIcon from "@material-ui/icons/Search";
import { RouteSuggestionForm } from "../components/RouteSuggestionForm";
import { GetStaticProps } from "next";
import Badge from "@material-ui/core/Badge";
import CloseIcon from "@material-ui/icons/Close";
import { RouteArea } from "../components/RouteArea";
import { RoutePlan } from "../components/RoutePlan";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ["common"])),
  },
});

export default function Home() {
  const { t } = useTranslation();

  const [
    {
      users,
      requiredItemCounts,
      allItemCounts,
      characterSelectForm,
      buildSelectForm,
      missingItemCounts,
      routeSuggestionForm,
    },
    dispatch,
  ] = useHomeState();

  useQueryParamStore(users, (newUsers) =>
    dispatch({ type: "LOAD", users: newUsers })
  );

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
                      <Badge
                        overlap="circle"
                        badgeContent={
                          <IconButton
                            color="primary"
                            onClick={() => {
                              dispatch({
                                type: "REMOVE_USER",
                                userIndex: i,
                              });
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        }
                      >
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
                      </Badge>
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
                      <IconButton
                        color="primary"
                        onClick={() => {
                          dispatch({
                            type: "OPEN_ROUTE_SUGGESTION_FORM",
                            userIndex: i,
                          });
                        }}
                      >
                        <SearchIcon />
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
              {[...missingItemCounts].length > 0 && (
                <>
                  <HelpIcon />
                  <Grid container alignItems="center">
                    {[...missingItemCounts].map(([code, count]) => (
                      <ItemBadge
                        key={code}
                        badgeContent={count}
                        color="primary"
                      >
                        <ItemImage width={60} key={code} code={Number(code)} />
                      </ItemBadge>
                    ))}
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
          {users.map((u, i) => {
            const character = Character.findByCode(u.selectedCharacterCode);

            return (
              <Grid key={i} container>
                <Grid item xs={12}>
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
                  <RoutePlan
                    route={u.selectedRoute}
                    requiredItemCounts={requiredItemCounts}
                    onUp={(routeIndex) => {
                      dispatch({
                        type: "UP_ROUTE_AREA",
                        userIndex: i,
                        routeIndex,
                      });
                    }}
                    onDown={(routeIndex) => {
                      dispatch({
                        type: "DOWN_ROUTE_AREA",
                        userIndex: i,
                        routeIndex,
                      });
                    }}
                  />
                </Grid>
              </Grid>
            );
          })}
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
              itemCounts={allItemCounts}
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
          <Dialog
            onClose={() => {
              dispatch({ type: "CLOSE_ROUTE_SUGGESTION_FORM" });
            }}
            open={routeSuggestionForm.open}
          >
            <RouteSuggestionForm
              requiredItemCounts={requiredItemCounts}
              users={users.map((u) => ({
                characterCode: u.selectedCharacterCode,
                startWeaponType: u.selectedStartWeaponType,
              }))}
              onSelectRoute={(route) => {
                dispatch({
                  type: "CHANGE_ROUTES",
                  routes: users.map((u) => route),
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
