import React from "react";

export const Tree: React.FC<{
  root: React.ReactNode;
  leaves?: React.ReactNodeArray;
}> = ({ root, leaves = [] }) => {
  return (
    <div style={{ display: "inline-block" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>{root}</div>
      {leaves.length > 0 && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-16px",
              left: "50%",
              width: "1px",
              height: "8px",
              backgroundColor: "black",
            }}
          />
          {leaves.map((l, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: leaves.length - 1 === i ? "25%" : "75%",
                  width: "50%",
                  height: "1px",
                  backgroundColor: "black",
                  transform: "translateX(-50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "50%",
                  width: "1px",
                  height: "8px",
                  backgroundColor: "black",
                }}
              />
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
