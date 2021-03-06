import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import { findItemByCode } from "../utils/item";
import { ItemBuildTree } from "./ItemBuildTree";

const CustomTooltip = withStyles(() => ({
  tooltip: {
    maxWidth: 1000,
    backgroundColor: "white",
  },
}))(Tooltip);

export const ItemImage: React.FC<{
  width?: number;
  code: number;
}> = ({ code, width }) => {
  let color: string;

  const item = findItemByCode(code);

  switch (item.itemGrade) {
    case "Common":
      color = "rgba(69, 69, 69, 0.6)";
      break;
    case "Uncommon":
      color = "rgba(81, 142, 92, 0.6)";
      break;
    case "Rare":
      color = "rgba(61, 78, 119, 0.7)";
      break;
    case "Epic":
      color = "rgba(102, 72, 136, 0.7)";
      break;
    case "Legend":
      color = "rgba(234, 191, 63, 0.5)";
      break;
  }

  return (
    <CustomTooltip
      title={
        <React.Fragment>
          <ItemBuildTree code={code} />
        </React.Fragment>
      }
    >
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/items/${code}.png`}
        style={{
          display: "block",
          width,
          maxHeight: "100%",
          backgroundColor: color,
        }}
      />
    </CustomTooltip>
  );
};
