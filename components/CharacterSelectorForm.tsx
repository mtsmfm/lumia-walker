import { CHARACTERS } from "../utils/lumiaIsland";
import Button from "@material-ui/core/Button";
import { CharacterImage } from "../components/CharacterImage";
import Grid from "@material-ui/core/Grid";

interface Props {
  selectedCharacterCode: number | undefined;
  onSelect: (c: number) => void;
  onUnselect: (c: number) => void;
}

export const CharacterSelectorForm: React.FC<Props> = ({
  selectedCharacterCode,
  onSelect,
  onUnselect,
}) => {
  return (
    <Grid container justify="space-evenly">
      {CHARACTERS.map((c) => {
        const isSelected = selectedCharacterCode === c.code;

        return (
          <Button
            key={c.code}
            onClick={() => {
              isSelected ? onUnselect(c.code) : onSelect(c.code);
            }}
            style={{
              opacity: isSelected ? "" : "0.1",
            }}
          >
            <CharacterImage code={c.code} />
          </Button>
        );
      })}
    </Grid>
  );
};
