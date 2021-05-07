import Grid from "@material-ui/core/Grid";
import React from "react";
import { Item, ItemCounts } from "../utils/lumiaIsland";
import { ItemImage } from "../components/ItemImage";
import { ItemBadge } from "../components/ItemBadge";
import Typography from "@material-ui/core/Typography";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { ButtonGroupIconButton } from "../components/ButtonGroupIconButton";
import { useTranslation } from "next-i18next";
import { Inventory } from "./Inventory";
import { useTheme } from "@material-ui/core/styles";

interface Props {
  onUp: () => void;
  onDown: () => void;
  areaCode: number;
  resultItemCounts: ItemCounts;
  areaItemCounts: ItemCounts;
  obtainedItemCounts: ItemCounts;
}

export const RouteArea: React.FC<Props> = ({
  onUp,
  onDown,
  areaCode,
  resultItemCounts,
  areaItemCounts,
  obtainedItemCounts,
}) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <div>
      <Grid container>
        <Typography gutterBottom>{t(`areas.${areaCode}`)}</Typography>
        <ButtonGroup size="small">
          <ButtonGroupIconButton onClick={onUp}>
            <ArrowDropUpIcon />
          </ButtonGroupIconButton>
          <ButtonGroupIconButton onClick={onDown}>
            <ArrowDropDownIcon />
          </ButtonGroupIconButton>
        </ButtonGroup>

        <Grid container style={{ padding: spacing(1) }}>
          {[...areaItemCounts].map(([code, count]) => (
            <Grid key={code} item>
              <ItemBadge badgeContent={count} color="primary" key={code}>
                <ItemImage width={60} code={code} />
              </ItemBadge>
            </Grid>
          ))}
        </Grid>

        <Grid container style={{ padding: spacing(1) }}>
          {[...obtainedItemCounts].map(([code, count]) => {
            const item = Item.findByCode(code);
            return (
              <Grid key={code} item>
                <ItemBadge
                  badgeContent={`${count} / ${item.areaItemCounts.get(
                    areaCode
                  )!}`}
                  color="primary"
                >
                  <ItemImage width={60} code={code} />
                </ItemBadge>
              </Grid>
            );
          })}
        </Grid>

        <Inventory itemCounts={resultItemCounts} />
      </Grid>
    </div>
  );
};
