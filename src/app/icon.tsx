import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E1F1A",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 16,
            height: 10,
            border: "2.4px solid #F3FAF5",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#D3F36B",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
