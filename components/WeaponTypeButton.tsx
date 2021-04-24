import React from "react";
import { WeaponType } from "../utils/lumiaIsland";
import { ImageWithTextButton } from "./ImageWithTextButton";
import { useTranslation } from "next-i18next";

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
      image={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/weapons/${weaponType}.png`}
      text={t(`weaponTypes.${weaponType}`)}
      onClick={() => onClick(weaponType)}
      selected={selected}
    />
  );
};
