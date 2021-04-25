import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import { Item } from "../utils/lumiaIsland";
import { useTranslation } from "next-i18next";
import { ItemBuildTree } from "./ItemBuildTree";
import Typography from "@material-ui/core/Typography";

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

  const item = Item.findByCode(code);

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
            <Typography variant="h6">{t(`items.${item.code}`)}</Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {Object.entries(item.stats).map(([k, v]) => {
                    return (
                      <TableRow key={k}>
                        <TableCell>{t(`stats.${k}`)}</TableCell>
                        <TableCell>{v}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <ItemBuildTree code={code} />
            <Typography variant="body2">
              {[...item.areaItemCounts].map(([areaCode, count]) => {
                return (
                  <React.Fragment key={areaCode}>
                    {t(`areas.${areaCode}`)}({count})
                  </React.Fragment>
                );
              })}
            </Typography>
          </Paper>
        </React.Fragment>
      }
    >
      <img
        src={item.imageUrl}
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
