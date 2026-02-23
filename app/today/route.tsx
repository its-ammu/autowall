import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHONE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  iphone16promax: { width: 1320, height: 2868 },
  iphone16pro: { width: 1206, height: 2622 },
  iphone16plus: { width: 1290, height: 2796 },
  iphone16: { width: 1170, height: 2532 },
  iphone15promax: { width: 1290, height: 2796 },
  iphone15pro: { width: 1179, height: 2556 },
  iphone15: { width: 1170, height: 2532 },
  iphone14promax: { width: 1290, height: 2796 },
  iphone14pro: { width: 1179, height: 2556 },
  iphone14: { width: 1170, height: 2532 },
  iphonese: { width: 750, height: 1334 },
  pixel9pro: { width: 1344, height: 2992 },
  pixel9: { width: 1080, height: 2400 },
  pixel8pro: { width: 1344, height: 2992 },
  pixel8: { width: 1080, height: 2400 },
  galaxys24ultra: { width: 1440, height: 3120 },
  galaxys24: { width: 1080, height: 2340 },
  galaxys23ultra: { width: 1440, height: 3088 },
  galaxys23: { width: 1080, height: 2340 },
};

type Shape = "circle" | "blob" | "square";

type DotStyleConfig = {
  bg: string;
  past: string;
  today: string;
  future: string;
  text: string;
  shape: Shape;
  blobRadius?: number;
};

const DOT_STYLES: Record<string, DotStyleConfig> = {
  flowers: {
    bg: "#FAF8F9",
    past: "#8E8E93",
    today: "#E8A0B0",
    future: "#C4C4C6",
    text: "#6D6D72",
    shape: "circle",
  },
  squares: {
    bg: "#2C2C2E",
    past: "#FFFFFF",
    today: "#0A84FF",
    future: "#48484A",
    text: "#0A84FF",
    shape: "square",
  },
  ink: {
    bg: "#F4F1EA",
    past: "#2D2A26",
    today: "#2D2A26",
    future: "#C4BDB4",
    text: "#2D2A26",
    shape: "circle",
  },
};

const FILL_STYLES = ["cloud", "ink"] as const;

// TTF from Google Fonts repo (Satori accepts TTF only)
const DELIUS_TTF_URL =
  "https://github.com/google/fonts/raw/main/ofl/delius/Delius-Regular.ttf";

const INK_CALLIGRAPHY_FONT_URL =
  "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf";

const INK_DEFAULT_TEXT =
  "Every day is a fresh page. Write something worth reading.";

const INK_MAX_CHARS = 200;

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getTotalDays(): number {
  return isLeapYear(new Date().getFullYear()) ? 366 : 365;
}

const COLS = 20;
const EXTRA_ROWS = 2;
const TOP_INSET_RATIO = 0.40;
/** Flowers: each flower represents 2 days to reduce image count and speed up generation */
const FLOWERS_DAYS_PER_FLOWER = 2;

function getDotColor(
  index: number,
  dayOfYear: number,
  style: DotStyleConfig
): string {
  if (index < dayOfYear - 1) return style.past;
  if (index === dayOfYear - 1) return style.today;
  return style.future;
}

// Deterministic "random" for brushstroke variation (same day = same image)
function seeded(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function getBrushstrokeStyle(index: number, baseSize: number) {
  const t = seeded(index);
  const t2 = seeded(index + 101);
  const widthMul = 0.7 + 0.6 * t;
  const strokeW = Math.floor(baseSize * widthMul);
  const strokeH = Math.max(3, Math.floor(baseSize * (0.22 + 0.12 * t2)));
  const angle = (t - 0.5) * 12;
  return { strokeW, strokeH, angle };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = request.nextUrl.origin;
  const modelParam = (searchParams.get("model") || "iphone16pro")
    .toLowerCase()
    .replace(/[\s\-_]/g, "");
  const styleKey = (searchParams.get("style") || "squares")
    .toLowerCase()
    .replace(/[\s\-_]/g, "");

  const dimensions =
    PHONE_DIMENSIONS[modelParam] || PHONE_DIMENSIONS["iphone16pro"];
  const { width, height } = dimensions;

  const totalDays = getTotalDays();
  const simulateParam = searchParams.get("simulate");
  const progress =
    simulateParam != null
      ? Math.min(1, Math.max(0, parseFloat(simulateParam) || 0))
      : getDayOfYear() / totalDays;
  const dayOfYear = Math.round(progress * totalDays);
  const daysLeft = totalDays - dayOfYear;
  const percentage = Math.round(progress * 100);
  const fontSize = Math.round(width * 0.03);

  const isFillStyle = FILL_STYLES.includes(styleKey as (typeof FILL_STYLES)[number]);
  const dotStyle = DOT_STYLES[styleKey] ?? DOT_STYLES.squares;

  if (isFillStyle && styleKey === "cloud") {
    const skyColor = "#B8D8EB";
    const cloudColor = "#FFFFFF";
    const fillColor = "#7BA7C4";
    const textColor = "#4A6D8C";

    const boardW = Math.floor(width * 0.72);
    const boardH = Math.floor(height * 0.36);
    const borderR = Math.floor(boardW * 0.018);

    // Scallop dimensions for cloud bumps
    const scallopDiam = Math.floor(boardW * 0.105);
    const scallopStep = Math.floor(scallopDiam * 0.58);
    const scallopCount = Math.ceil(boardW / scallopStep) + 2;
    const scallopHeadroom = Math.floor(scallopDiam * 0.65);

    // Below 100%: fill leaves headroom so cloud bumps sit fully above fill. At 100%: complete the box and draw clouds on top edge.
    const isFull = progress >= 1;
    const fillH = isFull
      ? boardH
      : Math.max(0, Math.floor((boardH - scallopHeadroom) * progress));

    const scallops =
      fillH > 0
        ? Array.from({ length: scallopCount }, (_, i) => {
            const sizeMul = 0.82 + 0.18 * Math.sin(i * 2.3 + 0.9);
            const size = Math.floor(scallopDiam * sizeMul);
            const x = i * scallopStep - Math.floor(scallopDiam * 0.25);
            const yShift = Math.floor(
              size * 0.14 * Math.sin(i * 1.7 + 0.5)
            );
            return { size, x, yShift };
          })
        : [];

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: skyColor,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: Math.floor(height * TOP_INSET_RATIO),
          }}
        >
          {/* Cloud shape */}
          <div
            style={{
              width: boardW,
              height: boardH,
              borderRadius: borderR,
              overflow: "hidden",
              display: "flex",
              position: "relative",
              backgroundColor: cloudColor,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            {/* Cloud fill progress */}
            {fillH > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: fillH,
                  backgroundColor: fillColor,
                  display: "flex",
                }}
              />
            )}
            {/* Scalloped cloud edge */}
            {scallops.map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  bottom: fillH - Math.floor(s.size / 2) + s.yShift,
                  left: s.x,
                  width: s.size,
                  height: s.size,
                  borderRadius: Math.floor(s.size / 2),
                  backgroundColor: fillColor,
                  display: "flex",
                }}
              />
            ))}
          </div>
          {/* Progress text */}
          <div
            style={{
              marginTop: Math.floor(height * 0.04),
              fontSize: fontSize,
              color: textColor,
              fontWeight: 500,
              letterSpacing: "0.04em",
              display: "flex",
            }}
          >
            {`${daysLeft}d left \u00b7 ${percentage}%`}
          </div>
        </div>
      ),
      {
        width,
        height,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
          "Content-Disposition": `inline; filename="year-progress-${modelParam}-cloud.png"`,
        },
      }
    );
  }

  // Ink calligraphy style
  if (styleKey === "ink") {
    const inkFont = await fetch(INK_CALLIGRAPHY_FONT_URL)
      .then((r) => r.arrayBuffer())
      .catch(() => null);

    const bg = "#F4F1EA";
    const darkInk = "#0F0D0A";
    const fadedInk = "#D5D0C7";
    const textColor = "#2D2A26";
    const ruleColor = "#B8B0A4";

    const rawText = searchParams.get("text");
    const inkText = rawText
      ? rawText.slice(0, INK_MAX_CHARS).trim()
      : INK_DEFAULT_TEXT;

    const words = inkText.split(/\s+/).filter(Boolean);
    const totalChars = inkText.length;
    const filledChars = Math.round(progress * totalChars);

    const wordCount = words.length;
    const sizeRatio = wordCount <= 12 ? 0.065 : wordCount <= 30 ? 0.050 : 0.040;
    const calligraphySize = Math.round(width * sizeRatio);
    const boardW = Math.floor(width * 0.82);
    const wordSpacing = Math.round(calligraphySize * 0.45);
    const lineSpacing = Math.round(calligraphySize * 0.50);
    const ruleH = Math.max(2, Math.round(width * 0.002));
    const ruleMargin = Math.floor(calligraphySize * 0.9);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: Math.floor(height * TOP_INSET_RATIO),
          }}
        >
          {/* Top decorative rule */}
          <div
            style={{
              width: boardW,
              height: ruleH,
              backgroundColor: ruleColor,
              marginBottom: ruleMargin,
              display: "flex",
            }}
          />
          {/* Calligraphy text */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              width: boardW,
              fontFamily: "InkCalligraphy",
              fontSize: calligraphySize,
              lineHeight: 1.6,
            }}
          >
            {(() => {
              let charPos = 0;
              return words.map((word, i) => {
                const wordStart = charPos;
                const wordEnd = charPos + word.length;
                charPos = wordEnd + 1;

                const allFilled = filledChars >= wordEnd;
                const noneFilled = filledChars <= wordStart;

                if (allFilled || noneFilled) {
                  return (
                    <div
                      key={i}
                      style={{
                        color: allFilled ? darkInk : fadedInk,
                        display: "flex",
                        marginRight: wordSpacing,
                        marginBottom: lineSpacing,
                      }}
                    >
                      {word}
                    </div>
                  );
                }

                const splitAt = filledChars - wordStart;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      marginRight: wordSpacing,
                      marginBottom: lineSpacing,
                    }}
                  >
                    <div style={{ color: darkInk, display: "flex" }}>
                      {word.slice(0, splitAt)}
                    </div>
                    <div style={{ color: fadedInk, display: "flex" }}>
                      {word.slice(splitAt)}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          {/* Bottom decorative rule */}
          <div
            style={{
              width: boardW,
              height: ruleH,
              backgroundColor: ruleColor,
              marginTop: ruleMargin,
              display: "flex",
            }}
          />
          {/* Progress text */}
          <div
            style={{
              marginTop: Math.floor(height * 0.035),
              fontSize: fontSize,
              color: textColor,
              fontWeight: 500,
              letterSpacing: "0.04em",
              display: "flex",
              fontFamily: "InkCalligraphy",
            }}
          >
            {`${daysLeft}d left \u00b7 ${percentage}%`}
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: inkFont
          ? [
              {
                name: "InkCalligraphy",
                data: inkFont,
                style: "normal" as const,
                weight: 400,
              },
            ]
          : undefined,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
          "Content-Disposition": `inline; filename="year-progress-${modelParam}-ink.png"`,
        },
      }
    );
  }

  // Dot-grid styles
  const gridWidthRatio = 0.78;
  const gridWidth = Math.floor(width * gridWidthRatio);
  const gapRatio = 0.35;
  const dotSize = Math.floor(
    gridWidth / (COLS * (1 + gapRatio) - gapRatio)
  );
  const gap = Math.floor(dotSize * gapRatio);
  const actualGridWidth = COLS * dotSize + (COLS - 1) * gap;

  const useFlowers = styleKey === "flowers";
  const flowerCount = useFlowers
    ? Math.ceil(totalDays / FLOWERS_DAYS_PER_FLOWER)
    : 0;
  const totalRows = useFlowers
    ? Math.ceil(flowerCount / COLS) + EXTRA_ROWS
    : Math.ceil(totalDays / COLS) + EXTRA_ROWS;
  const totalCells = totalRows * COLS;

  const [flowersFont, flowerUrls] = useFlowers
    ? await Promise.all([
        fetch(DELIUS_TTF_URL)
          .then((r) => r.arrayBuffer())
          .catch(() => null),
        Promise.resolve({
          completed: `${origin}/assets/Completed.svg`,
          today: `${origin}/assets/Today.svg`,
          pending: `${origin}/assets/Pending.svg`,
        }),
      ])
    : [null as ArrayBuffer | null, null as { completed: string; today: string; pending: string } | null];

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const color =
      i < (useFlowers ? flowerCount * FLOWERS_DAYS_PER_FLOWER : totalDays)
        ? getDotColor(
            useFlowers ? Math.min(i * FLOWERS_DAYS_PER_FLOWER, totalDays - 1) : i,
            dayOfYear,
            dotStyle
          )
        : dotStyle.future;
    if (useFlowers && flowerUrls) {
      const daysStart = i * FLOWERS_DAYS_PER_FLOWER;
      const flowerType =
        i >= flowerCount
          ? "pending"
          : dayOfYear <= daysStart
            ? "pending"
            : dayOfYear <= daysStart + FLOWERS_DAYS_PER_FLOWER
              ? "today"
              : "completed";
      const src = flowerUrls[flowerType];
      return (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={src}
            width={dotSize}
            height={dotSize}
            alt=""
            style={{ display: "flex" }}
          />
        </div>
      );
    }
    const isBlob = dotStyle.shape === "blob";
    const isSquare = dotStyle.shape === "square";
    const radius = dotStyle.blobRadius ?? 0.5;
    const borderRadius = isSquare
      ? 0
      : isBlob
        ? Math.floor(dotSize * radius)
        : dotSize / 2;
    return (
      <div
        key={i}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: borderRadius,
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
    );
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: dotStyle.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: Math.floor(height * TOP_INSET_RATIO),
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: actualGridWidth,
            gap: gap,
          }}
        >
          {cells}
        </div>
        <div
          style={{
            marginTop: Math.floor(height * 0.035),
            fontSize: fontSize,
            color: dotStyle.text,
            display: "flex",
            fontWeight: 500,
            letterSpacing: "0.02em",
            ...(flowersFont && { fontFamily: "Delius" }),
          }}
        >
          {`${daysLeft}d left · ${percentage}%`}
        </div>
      </div>
    ),
    {
      width,
      height,
      ...(flowersFont && {
        fonts: [
          {
            name: "Delius",
            data: flowersFont,
            style: "normal",
            weight: 400,
          },
        ],
      }),
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Disposition": `inline; filename="year-progress-${modelParam}-${styleKey}.png"`,
      },
    }
  );
}
