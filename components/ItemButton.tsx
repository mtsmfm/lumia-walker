import { useTranslation } from "next-i18next";
import React from "react";
import { ImageWithTextButton } from "./ImageWithTextButton";
import { ItemImage } from "./ItemImage";

export const ItemButton: React.FC<{
  code: number;
  onClick: () => void;
  selected?: boolean;
}> = ({ code, onClick, selected = false }) => {
  const { t } = useTranslation();

  const text = t(`items.${code}`);

  return (
    <ImageWithTextButton
      text={text}
      image={<ItemImage code={code} />}
      onClick={onClick}
      selected={selected}
    />
  );
};
