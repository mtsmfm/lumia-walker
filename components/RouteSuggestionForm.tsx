import React, { useEffect, useReducer } from "react";
import { ItemCounts, WeaponType } from "../utils/lumiaIsland";
import Container from "@material-ui/core/Container";
import { useTranslation } from "next-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { useRouteSuggester } from "../hooks/useRouteSuggester";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ResponseData } from "../workers/routeSuggester";
import Typography from "@material-ui/core/Typography";
import { LumiaIslandMap } from "./LumiaIslandMap";

interface Props {
  requiredItemCounts: ItemCounts;
  users: Array<{
    characterCode: number;
    startWeaponType: WeaponType;
  }>;
  onSelectRoute: (route: number[]) => void;
}

interface State {
  suggestedRoutes: number[][] | undefined;
  total: bigint;
  current: bigint;
  inProgress: boolean;
  previewRoute: number[];
}

type Action =
  | {
      type: "RECEIVE_MESSAGE";
      response: ResponseData;
    }
  | {
      type: "PREVIEW_ROUTE";
      route: number[];
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "RECEIVE_MESSAGE": {
      switch (action.response.type) {
        case "START": {
          return {
            ...state,
            total: action.response.total,
            current: BigInt(0),
            inProgress: true,
          };
        }
        case "PROGRESS": {
          return {
            ...state,
            total: action.response.total,
            current: action.response.current,
          };
        }
        case "FINISH": {
          return {
            ...state,
            suggestedRoutes: action.response.routes,
            inProgress: false,
          };
        }
      }
    }
    case "PREVIEW_ROUTE": {
      return { ...state, previewRoute: action.route };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  }
};

const initialState: State = {
  suggestedRoutes: undefined,
  total: BigInt(0),
  current: BigInt(0),
  inProgress: false,
  previewRoute: [],
};

export const RouteSuggestionForm: React.FC<Props> = ({
  users,
  requiredItemCounts,
  onSelectRoute,
}) => {
  const [
    { suggestedRoutes, inProgress, current, total, previewRoute },
    dispatch,
  ] = useReducer(reducer, initialState);

  const { t } = useTranslation();

  const start = useRouteSuggester((response) => {
    dispatch({ type: "RECEIVE_MESSAGE", response });
  });

  useEffect(() => {
    start({
      requiredItemCounts,
      users,
    });
  }, []);

  return (
    <Container>
      {inProgress && (
        <CircularProgress
          variant="determinate"
          value={Number((current * BigInt(100)) / total)}
        />
      )}
      {suggestedRoutes !== undefined && (
        <>
          {suggestedRoutes.length === 0 && <>Not found</>}
          {suggestedRoutes.length > 0 && (
            <>
              <LumiaIslandMap route={previewRoute} />
              <Typography>
                {t("routeSuggestionForm.result.combinations", {
                  count: suggestedRoutes.length,
                })}
              </Typography>
              <Typography>
                {t("routeSuggestionForm.result.atLeast", {
                  count: suggestedRoutes[0].length,
                })}
              </Typography>
              <List>
                {suggestedRoutes.map((route, i) => (
                  <ListItem
                    key={i}
                    button
                    selected={route === previewRoute}
                    onMouseEnter={() => {
                      dispatch({
                        type: "PREVIEW_ROUTE",
                        route,
                      });
                    }}
                    onClick={() => {
                      onSelectRoute(route);
                    }}
                  >
                    <ListItemText
                      primary={route
                        .map((areaCode) => t(`areas.${areaCode}`))
                        .join(" -> ")}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </>
      )}
    </Container>
  );
};
