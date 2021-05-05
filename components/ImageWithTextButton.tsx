import ButtonBase from "@material-ui/core/ButtonBase";
import Typography from "@material-ui/core/Typography";
import React from "react";

export const ImageWithTextButton: React.FC<{
  text: string;
  image: string | React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}> = ({ text, image, onClick, selected }) => {
  const imageElem =
    typeof image === "string" ? <img src={image} width={50} /> : image;

  return (
    <ButtonBase
      style={{
        height: 50,
        display: "flex",
        flex: 1,
        justifyContent: "start",
        border: selected ? "1px solid red" : undefined,
      }}
      onClick={onClick}
    >
      {imageElem}
      <Typography style={{ paddingLeft: 10 }} align="justify">
        {text}
      </Typography>
    </ButtonBase>
  );
};
