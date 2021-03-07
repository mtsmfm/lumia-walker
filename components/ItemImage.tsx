import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import { findItemByCode, statsFieldNames } from "../utils/item";
import { useTranslation } from "next-i18next";
import { ItemBuildTree } from "./ItemBuildTree";

const CustomTooltip = withStyles(() => ({
  tooltip: {
    maxWidth: 1000,
  },
}))(Tooltip);

export const ItemImage: React.FC<{
  width?: number;
  code: number;
}> = ({ code, width }) => {
  const { t } = useTranslation();
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
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {statsFieldNames(item)
                    .filter((f) => item[f] !== 0)
                    .map((f) => {
                      return (
                        <TableRow key={f}>
                          <TableCell>{t(`stats.${f}`)}</TableCell>
                          <TableCell>{item[f]}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <ItemBuildTree code={code} />
          </Paper>
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
