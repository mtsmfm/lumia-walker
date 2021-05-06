import { EquipmentType } from "../utils/lumiaIsland";

interface Props {
  width?: number;
  equipmentType?: EquipmentType;
}

export const BlankItemImage: React.FC<Props> = ({ equipmentType, width }) => {
  return (
    <img
      draggable={false}
      style={{
        backgroundColor: "rgba(69, 69, 69, 1)",
        display: "block",
        width,
        maxHeight: "100%",
      }}
      src={
        equipmentType
          ? `images/blank-items/${equipmentType}.svg`
          : "images/blank-items/item.svg"
      }
    />
  );
};
