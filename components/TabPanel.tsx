import React from "react";

export const TabPanel: React.FC<{ value: number; index: number }> = ({
  children,
  value,
  index,
}) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  );
};
