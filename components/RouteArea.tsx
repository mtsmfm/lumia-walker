import React, { useEffect, useRef, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "next-i18next";
import Grid from "@material-ui/core/Grid";
import { ItemBadge } from "./ItemBadge";
import { Item, ItemCounts } from "../utils/lumiaIsland";
import { ItemImage } from "./ItemImage";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";

interface Props {
  areaCode: number;
  requiredItemCounts: ItemCounts;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  index: number;
}

interface DndItem {
  index: number;
}

const calcPosition = (
  elem: HTMLElement | null,
  monitor: DropTargetMonitor
): "top" | "bottom" | undefined => {
  // Determine mouse position
  const clientOffset = monitor.getClientOffset();

  if (!elem || !clientOffset) {
    return;
  }

  // Determine rectangle on screen
  const hoverBoundingRect = elem.getBoundingClientRect();

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  // Get pixels to the top
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  // Dragging downwards
  return hoverClientY < hoverMiddleY ? "top" : "bottom";
};

export const RouteArea: React.FC<Props> = ({
  areaCode,
  requiredItemCounts,
  index,
  onMove,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const [position, setPosition] = useState<"top" | "bottom" | undefined>();

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "ROUTE_AREA",
    item: { index } as DndItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "ROUTE_AREA",
    hover: (_, monitor) => {
      setPosition(calcPosition(ref.current, monitor));
    },
    drop: (item: DndItem, monitor: DropTargetMonitor<DndItem>) => {
      const hoverIndex =
        calcPosition(ref.current, monitor) === "top" ? index - 1 : index + 1;

      if (item.index !== hoverIndex) {
        onMove(item.index, hoverIndex);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  dropRef(ref);
  dragRef(ref);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: "grab",
        borderTop: isOver && position === "top" ? "solid 1px red" : undefined,
        borderBottom:
          isOver && position === "bottom" ? "solid 1px red" : undefined,
      }}
    >
      <Typography gutterBottom>{t(`areas.${areaCode}`)}</Typography>

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
