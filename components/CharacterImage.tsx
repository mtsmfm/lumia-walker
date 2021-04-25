import { Character } from "../utils/lumiaIsland";

export const CharacterImage: React.FC<{
  code: number;
}> = ({ code }) => {
  return (
    <img
      src={Character.findByCode(code).imageUrl}
      style={{
        display: "block",
        maxHeight: "100%",
      }}
    />
  );
};
