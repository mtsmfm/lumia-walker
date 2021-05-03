import React from "react";
import { WeaponType } from "../utils/lumiaIsland";
import { ImageWithTextButton } from "./ImageWithTextButton";
import { useTranslation } from "next-i18next";
import { WeaponTypeImage } from "./WeaponTypeImage";

interface Props {
  weaponType: WeaponType;
  onClick: (weaponType: WeaponType) => void;
  selected: boolean;
}

export const WeaponTypeButton: React.FC<Props> = ({
  weaponType,
  onClick,
  selected,
}) => {
  const { t } = useTranslation();

  return (
    <ImageWithTextButton
      image={<WeaponTypeImage weaponType={weaponType} />}
      text={t(`weaponTypes.${weaponType}`)}
      onClick={() => onClick(weaponType)}
      selected={selected}
    />
  );
};
