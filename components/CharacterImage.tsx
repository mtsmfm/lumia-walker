import { findCharacterByCode } from "../utils/lumiaIsland";

export const CharacterImage: React.FC<{
  code: number;
}> = ({ code }) => {
  return (
    <img
      src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/images/characters/${
        findCharacterByCode(code).name
      }.png`}
      style={{
        display: "block",
        maxHeight: "100%",
      }}
    />
  );
};
