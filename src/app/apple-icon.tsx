import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          position: "relative",
        }}
      >
        <div
          style={{
            width: 88,
            height: 52,
            border: "10px solid #F3FAF5",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#D3F36B",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
