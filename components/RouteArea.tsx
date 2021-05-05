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

interface Props {
  onUp: () => void;
  onDown: () => void;
  requiredItemCounts: ItemCounts;
  areaCode: number;
}

export const RouteArea: React.FC<Props> = ({
  onUp,
  onDown,
  requiredItemCounts,
  areaCode,
}) => {
  const { t } = useTranslation();

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
      </Grid>

      <Grid container>
        {[...requiredItemCounts.keys()]
          .map((c) => Item.findByCode(c))
          .filter(({ areaCodes }) => areaCodes.includes(areaCode))
          .map(({ code }) => (
            <Grid key={code} item>
              <ItemBadge
                badgeContent={requiredItemCounts.get(code)}
                color="primary"
              >
                <ItemImage width={60} code={code} />
              </ItemBadge>
            </Grid>
          ))}
      </Grid>
    </div>
  );
};
