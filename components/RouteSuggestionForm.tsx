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

interface Props {
  requiredItemCounts: ItemCounts;
  users: Array<{
    characterCode: number;
    startWeaponType: WeaponType;
  }>;
}

interface State {
  suggestedRoutes: number[][] | undefined;
  total: bigint;
  current: bigint;
  inProgress: boolean;
}

type Action = {
  type: "RECEIVE_MESSAGE";
  response: ResponseData;
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
  }
};

const initialState: State = {
  suggestedRoutes: undefined,
  total: BigInt(0),
  current: BigInt(0),
  inProgress: false,
};

export const RouteSuggestionForm: React.FC<Props> = ({
  users,
  requiredItemCounts,
}) => {
  const [
    { suggestedRoutes, inProgress, current, total },
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
                  <ListItem key={i}>
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
