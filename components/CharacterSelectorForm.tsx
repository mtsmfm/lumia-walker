import { Character, WeaponType } from "../utils/lumiaIsland";
import Button from "@material-ui/core/Button";
import { CharacterImage } from "../components/CharacterImage";
import Grid from "@material-ui/core/Grid";
import { WeaponTypeButton } from "./WeaponTypeButton";

interface Props {
  selectedCharacterCode: number | undefined;
  selectedWeaponType: WeaponType | undefined;
  onSelect: (characterCode: number, weaponType: WeaponType) => void;
}

export const CharacterSelectorForm: React.FC<Props> = ({
  selectedCharacterCode,
  selectedWeaponType,
  onSelect,
}) => {
  const selectedCharacter =
    selectedCharacterCode !== undefined
      ? Character.findByCode(selectedCharacterCode)
      : undefined;

  return (
    <Grid container>
      <Grid item xs={8}>
        <Grid container justify="space-evenly">
          {Character.all().map((c) => {
            const isSelected = selectedCharacterCode === c.code;

            return (
              <Button
                key={c.code}
                onClick={() => {
                  onSelect(c.code, c.startWeaponTypes[0]);
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
      </Grid>
      <Grid item xs={4}>
        {selectedCharacter &&
          selectedCharacter.startWeaponTypes.map((wt) => (
            <WeaponTypeButton
              key={wt}
              weaponType={wt}
              onClick={() => {
                onSelect(selectedCharacter.code, wt);
              }}
              selected={selectedWeaponType === wt}
            />
          ))}
      </Grid>
    </Grid>
  );
};
