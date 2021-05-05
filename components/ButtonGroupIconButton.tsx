import React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

// https://github.com/mui-org/material-ui/issues/17226
export const ButtonGroupIconButton: React.FC<
  React.ComponentProps<typeof Button>
> = (props) => {
  const {
    disableElevation,
    fullWidth,
    variant,
    href,
    ...iconButtonProps
  } = props;
  return (
    <IconButton
      {...(iconButtonProps as React.ComponentProps<typeof IconButton>)}
    />
  );
};
