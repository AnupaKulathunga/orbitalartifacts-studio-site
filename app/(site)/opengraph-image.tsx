import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/ogFonts";
import { getFeaturedScenes } from "@/lib/scenes";

export const runtime = "nodejs";
export const alt = "Orbital Artifacts — Earth data, reimagined as art.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const [hero] = await getFeaturedScenes(1);
  const fonts = await loadOgFonts();

  const heroUrl = hero?.imageUrl
    ? `${hero.imageUrl}${hero.imageUrl.includes("?") ? "&" : "?"}w=1600&q=85&fit=clip`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#ebe5d6",
          position: "relative",
        }}
      >
        {heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.1) 45%, rgba(10,10,10,0.85) 100%)",
          }}
        />

        {/* Corner brackets */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 24,
            height: 24,
            borderTop: "2px solid #ebe5d6",
            borderLeft: "2px solid #ebe5d6",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 24,
            height: 24,
            borderTop: "2px solid #ebe5d6",
            borderRight: "2px solid #ebe5d6",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 24,
            height: 24,
            borderBottom: "2px solid #ebe5d6",
            borderLeft: "2px solid #ebe5d6",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 24,
            height: 24,
            borderBottom: "2px solid #ebe5d6",
            borderRight: "2px solid #ebe5d6",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 84,
            right: 84,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "JetBrainsMono",
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: 6,
            color: "#ebe5d6",
          }}
        >
          <span>Orbital Artifacts</span>
          <span>Satellite Imagery · Art Prints</span>
        </div>

        {/* Main headline */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 84,
            right: 84,
            display: "flex",
            flexDirection: "column",
            color: "#ebe5d6",
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces",
              fontWeight: 500,
              fontSize: 96,
              letterSpacing: -1,
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Earth data,</span>
            <span
              style={{
                fontStyle: "italic",
                color: "#c94f2a",
              }}
            >
              reimagined as art.
            </span>
          </div>

          <div
            style={{
              marginTop: 24,
              fontFamily: "JetBrainsMono",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            orbitalartifacts.shop
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
    },
  );
}
