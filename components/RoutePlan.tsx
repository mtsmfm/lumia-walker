import React from "react";
import { ItemCounts } from "../utils/lumiaIsland";
import { RouteArea } from "./RouteArea";

interface Props {
  onUp: (routeIndex: number) => void;
  onDown: (routeIndex: number) => void;
  route: number[];
  requiredItemCounts: ItemCounts;
}

export const RoutePlan: React.FC<Props> = ({
  onUp,
  onDown,
  route,
  requiredItemCounts,
}) => {
  return (
    <>
      {route.map((areaCode, i) => (
        <RouteArea
          key={i}
          areaCode={areaCode}
          onUp={() => {
            onUp(i);
          }}
          onDown={() => {
            onDown(i);
          }}
          requiredItemCounts={requiredItemCounts}
        />
      ))}
    </>
  );
};
