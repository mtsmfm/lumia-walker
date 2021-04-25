import AREA_CENTROIDS from "../map/area_centroids.json";
import OBJECT_LOCATIONS from "../map/object_locations.json";
import { useTranslation } from "next-i18next";
import { COLORS } from "../utils/colors";
import { Character } from "../utils/lumiaIsland";
import { useEffect, useReducer } from "react";

interface Props {
  routes: number[][];
  onRoutesChange: (routes: number[][]) => void;
  users: number[];
}

const RATIO = 120 / 25.4;

interface State {
  changedRoutes: number[][];
  selectedUserIndex: number;
}

type Action =
  | {
      type: "SELECT_USER";
      userIndex: number;
    }
  | {
      type: "SELECT_AREA";
      areaCode: number;
      currentRoutes: number[][];
    }
  | {
      type: "SELECT_ROUTE_POINT";
      userIndex: number;
      routeIndex: number;
      currentRoutes: number[][];
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SELECT_USER": {
      return {
        ...state,
        selectedUserIndex: action.userIndex,
      };
    }
    case "SELECT_AREA": {
      return {
        ...state,
        changedRoutes: action.currentRoutes.map((route, i) => {
          if (i === state.selectedUserIndex) {
            return [...route, action.areaCode];
          } else {
            return route;
          }
        }),
      };
    }
    case "SELECT_ROUTE_POINT": {
      return {
        ...state,
        selectedUserIndex: action.userIndex,
        changedRoutes: action.currentRoutes.map((route, i) => {
          if (i === action.userIndex) {
            return route.filter((_, j) => j !== action.routeIndex);
          } else {
            return route;
          }
        }),
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
    }
  }
};

export const LumiaIslandMap: React.FC<Props> = ({
  routes,
  onRoutesChange,
  users,
}) => {
  const { t } = useTranslation();
  const [{ changedRoutes, selectedUserIndex }, dispatch] = useReducer(reducer, {
    selectedUserIndex: 0,
    changedRoutes: routes,
  });

  const routeCentroidsList = routes.map((route) =>
    route.map((r) => AREA_CENTROIDS.find((c) => r === c.areaCode))
  );

  useEffect(() => {
    onRoutesChange(changedRoutes);
  }, [changedRoutes]);

  return (
    <svg
      viewBox="0 0 143.46227 164.99767"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <image x={0} y={0} width="100%" href="map.svg" />

      {users.map((_, i) => (
        <circle
          key={i}
          cx={2}
          cy={3.5 + i * 8}
          r={1.5}
          fill={i === selectedUserIndex ? COLORS[i] : "none"}
          stroke={COLORS[i]}
          strokeWidth={0.4}
        />
      ))}

      {users.map((u, i) => (
        <image
          key={i}
          x={5}
          y={i * 8}
          width="5"
          href={Character.findByCode(u).imageUrl}
          style={{ cursor: "pointer" }}
          onClick={() => dispatch({ type: "SELECT_USER", userIndex: i })}
        />
      ))}

      {OBJECT_LOCATIONS.filter((l) => l.kind === "hyperloop").map((l, i) => (
        <circle key={i} cx={l.x / RATIO} cy={l.y / RATIO} r={2} fill="cyan" />
      ))}

      {routeCentroidsList.map((routeCentroids, i) => {
        if (routeCentroids.length > 1) {
          return (
            <path
              key={i}
              d={`M ${routeCentroids
                .flatMap((c) => [c.x / RATIO + i * 2, c.y / RATIO])
                .join(" ")}`}
              fill="transparent"
              stroke={COLORS[i]}
            />
          );
        }
      })}

      {AREA_CENTROIDS.map((centroid, i) => (
        <text
          key={i}
          x={centroid.x / RATIO}
          y={centroid.y / RATIO}
          style={{
            fontSize: "5px",
            stroke: "#000",
            fill: "#fff",
            strokeWidth: "1",
            paintOrder: "stroke",
            cursor: "pointer",
            userSelect: "none",
          }}
          textAnchor="middle"
          onClick={() => {
            dispatch({
              type: "SELECT_AREA",
              areaCode: centroid.areaCode,
              currentRoutes: routes,
            });
          }}
        >
          {t(`areas.${centroid.areaCode}`)}
        </text>
      ))}

      {AREA_CENTROIDS.map(({ x, y, areaCode }) => (
        <text
          key={areaCode}
          x={x / RATIO}
          y={y / RATIO - 5}
          style={{
            fontSize: "5px",
            stroke: "red",
            fill: "white",
            strokeWidth: "1",
            paintOrder: "stroke",
          }}
          textAnchor="middle"
        >
          {routes.map((route, i) => {
            const numbers = route.flatMap((x, i) =>
              x === areaCode ? [i + 1] : []
            );

            return numbers.map((n) => (
              <tspan
                key={n}
                style={{
                  fontSize: "5px",
                  stroke: COLORS[i],
                  fill: "white",
                  strokeWidth: "1",
                  paintOrder: "stroke",
                  border: "1px solid black",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => {
                  dispatch({
                    type: "SELECT_ROUTE_POINT",
                    userIndex: i,
                    routeIndex: n - 1,
                    currentRoutes: routes,
                  });
                }}
              >
                [{n}]
              </tspan>
            ));
          })}
        </text>
      ))}
    </svg>
  );
};
