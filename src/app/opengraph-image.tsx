import { ImageResponse } from "next/og";

export const alt = "Kiungo — verified delivery for Kenya housing and construction";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0E1F1A",
          color: "#F3FAF5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(14,31,26,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(14,31,26,0.22) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.35,
          }}
        />

        <div
          style={{
            width: 720,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#0A1712",
                border: "1px solid rgba(243,250,245,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 16,
                  border: "3px solid #F3FAF5",
                  borderRadius: 999,
                  display: "flex",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#D3F36B",
                  display: "flex",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>Kiungo</div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: 2.4,
                  textTransform: "uppercase",
                  color: "#D3F36B",
                }}
              >
                Kenya · Housing
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                width: 48,
                height: 6,
                background: "#D3F36B",
                borderRadius: 99,
                display: "flex",
              }}
            />
            <div
              style={{
                marginTop: 28,
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1.6,
                maxWidth: 600,
              }}
            >
              Verified delivery for Kenya housing.
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: 24,
                lineHeight: 1.35,
                color: "rgba(243,250,245,0.72)",
                maxWidth: 560,
              }}
            >
              Who supplied what, with GPS and photo evidence. Settlement follows the work.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {["Registry", "Evidence", "Review", "Settlement"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  background: "rgba(211,243,107,0.12)",
                  color: "#D3F36B",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: 0.4,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: 480,
            height: "100%",
            display: "flex",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=960&q=70"
            alt=""
            width={480}
            height={630}
            style={{ width: 480, height: 630, objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background:
                "linear-gradient(105deg, #0E1F1A 0%, rgba(14,31,26,0.15) 42%, rgba(14,31,26,0.45) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 36,
              bottom: 36,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 999,
              background: "#D3F36B",
              color: "#0E1F1A",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            Affordable Housing Programme
          </div>
        </div>
      </div>
    ),
    size,
  );
}
