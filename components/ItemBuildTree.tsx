import React from "react";
import { Item } from "../utils/lumiaIsland";
import { ItemBadge } from "./ItemBadge";
import { ItemImage } from "./ItemImage";
import { Tree } from "./Tree";

export const ItemBuildTree: React.FC<{
  code: number;
}> = ({ code }) => {
  const item = Item.findByCode(code);

  if (item.makeMaterial1 !== 0) {
    return (
      <Tree
        root={
          item.initialCount > 1 ? (
            <ItemBadge badgeContent={item.initialCount} color="primary">
              <ItemImage code={code} width={50} />
            </ItemBadge>
          ) : (
            <ItemImage code={code} width={50} />
          )
        }
        leaves={[
          <ItemBuildTree code={item.makeMaterial1} />,
          <ItemBuildTree code={item.makeMaterial2} />,
        ]}
      />
    );
  }

  return <Tree root={<ItemImage code={code} width={50} />} />;
};
