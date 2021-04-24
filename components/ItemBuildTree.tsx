import React from "react";
import { findItemByCode } from "../utils/lumiaIsland";
import { ItemImage } from "./ItemImage";
import { Tree } from "./Tree";

export const ItemBuildTree: React.FC<{
  code: number;
}> = ({ code }) => {
  const item = findItemByCode(code);

  if (item.makeMaterial1 !== 0) {
    return (
      <Tree
        root={<ItemImage code={code} width={50} />}
        leaves={[
          <ItemBuildTree code={item.makeMaterial1} />,
          <ItemBuildTree code={item.makeMaterial2} />,
        ]}
      />
    );
  }

  return <Tree root={<ItemImage code={code} width={50} />} />;
};
