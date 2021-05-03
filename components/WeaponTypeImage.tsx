import React from "react";
import { WeaponType } from "../utils/lumiaIsland";

interface Props {
  weaponType: WeaponType;
}

export const WeaponTypeImage: React.FC<Props> = ({ weaponType }) => {
  return (
    <img
      src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/weapons/${weaponType}.png`}
      style={{ height: 50 }}
    />
  );
};
