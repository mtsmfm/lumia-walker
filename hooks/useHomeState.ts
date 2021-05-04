import {
  Item,
  calcMakeMaterials,
  WeaponType,
  Character,
} from "../utils/lumiaIsland";
import { ItemCounts, sumItemCounts } from "../utils/lumiaIsland";
import { BuildSelectForm } from "../components/BuildSelectForm";
import { useReducer } from "react";

interface State {
  users: Array<{
    selectedCharacterCode: number;
    selectedStartWeaponType: WeaponType;
    selectedItemsCodes: number[];
    selectedRoute: number[];
  }>;
  requiredItemCounts: ItemCounts;
  missingItemCounts: ItemCounts;
  allItemCounts: ItemCounts;
  characterSelectForm: {
    open: boolean;
    userIndex: number;
  };
  buildSelectForm: {
    open: boolean;
    userIndex: number;
    filter: React.ComponentProps<typeof BuildSelectForm>["filter"];
  };
  routeSuggestionForm: {
    open: boolean;
    userIndex: number;
  };
}

type Action =
  | {
      type: "LOAD";
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
      type: "OPEN_ROUTE_SUGGESTION_FORM";
      userIndex: number;
    }
  | {
      type: "CLOSE_ROUTE_SUGGESTION_FORM";
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
  const allItemCounts = sumItemCounts(
    users.map((u) => ({
      characterCode: u.selectedCharacterCode,
      startWeaponType: u.selectedStartWeaponType,
      route: u.selectedRoute,
    }))
  );
  const missingItemCounts = [...requiredItemCounts]
    .filter(([itemCode, count]) => (allItemCounts.get(itemCode) || 0) < count)
    .reduce(
      (acc, [code, count]) => acc.set(code, count),
      new Map<number, number>()
    );

  return {
    requiredItemCounts,
    missingItemCounts,
    allItemCounts,
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOAD": {
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
    case "OPEN_ROUTE_SUGGESTION_FORM": {
      return {
        ...state,
        routeSuggestionForm: {
          ...state.routeSuggestionForm,
          open: true,
          userIndex: action.userIndex,
        },
      };
    }
    case "CLOSE_ROUTE_SUGGESTION_FORM": {
      return {
        ...state,
        routeSuggestionForm: {
          ...state.routeSuggestionForm,
          open: false,
        },
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  }
};

const initialState: State = {
  users: [],
  ...calcItemCounts([]),
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
  routeSuggestionForm: {
    open: false,
    userIndex: 0,
  },
};

export const useHomeState = () => {
  return useReducer(reducer, initialState);
};
