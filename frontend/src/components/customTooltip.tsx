import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#2a2a2a",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{label}</p>
        <p style={{ margin: 0 }}>
          <strong>Total:</strong> €{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
