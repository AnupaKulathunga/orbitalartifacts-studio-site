import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/ogFonts";
import { getSceneBySlug } from "@/lib/scenes";

export const runtime = "nodejs";
export const alt = "Orbital Artifacts — a scene from the archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scene = await getSceneBySlug(slug);
  const fonts = await loadOgFonts();

  // Sanity CDN URL → fetch at bigger size so the OG image is sharp.
  const heroUrl = scene?.imageUrl
    ? `${scene.imageUrl}${scene.imageUrl.includes("?") ? "&" : "?"}w=1600&q=85&fit=clip`
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

        {/* Dark gradient mask bottom for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0) 40%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.78) 100%)",
          }}
        />

        {/* Top-left corner brackets */}
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

        {/* Top bar: wordmark + catalogue number */}
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
            mixBlendMode: "difference",
          }}
        >
          <span>Orbital Artifacts</span>
          <span>{scene?.catalogueNumber ?? "OA"}</span>
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
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
              fontSize: 82,
              letterSpacing: -1,
              lineHeight: 1.02,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>{scene?.title ?? "Orbital Artifacts"}</span>
            <span
              style={{
                fontStyle: "italic",
                color: "#c94f2a",
                fontSize: 48,
                marginTop: 4,
              }}
            >
              {scene?.subtitle ?? "Earth data, reimagined as art."}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 28,
              fontFamily: "JetBrainsMono",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            <span>
              {scene
                ? `${scene.sensor} · ${scene.bandCombo}`
                : "Satellite · Archive"}
            </span>
            <span>{scene?.coords.formatted ?? ""}</span>
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
