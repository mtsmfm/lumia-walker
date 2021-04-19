import AREA_CENTROIDS from "../map/area_centroids.json";
import OBJECT_LOCATIONS from "../map/object_locations.json";
import { useTranslation } from "next-i18next";

interface Props {
  route?: number[];
}

const RATIO = 120 / 25.4;

export const LumiaIslandMap: React.FC<Props> = ({ route = [] }) => {
  const { t } = useTranslation();

  const routeCentroids = route.map((r) =>
    AREA_CENTROIDS.find((c) => r === c.areaCode)
  );

  return (
    <svg
      width="143.46227mm"
      height="164.99767mm"
      viewBox="0 0 143.46227 164.99767"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <image x={0} y={0} width="100%" href="map.svg" />

      {OBJECT_LOCATIONS.filter((l) => l.kind === "hyperloop").map((l, i) => (
        <circle key={i} cx={l.x / RATIO} cy={l.y / RATIO} r={2} fill="cyan" />
      ))}

      {route.length > 1 && (
        <path
          d={`M ${routeCentroids
            .flatMap((c) => [c.x / RATIO, c.y / RATIO])
            .join(" ")} Z`}
          fill="transparent"
          stroke="blue"
        />
      )}

      {AREA_CENTROIDS.map((centroid, i) => (
        <text
          key={i}
          x={centroid.x / RATIO}
          y={centroid.y / RATIO}
          style={{
            fontSize: "5px",
            stroke: "#000",
            fill: "#fff",
            strokeWidth: "1",
            paintOrder: "stroke",
          }}
          textAnchor="middle"
        >
          {t(`areas.${centroid.areaCode}`)}
        </text>
      ))}

      {routeCentroids.map(({ x, y }, i) => (
        <text
          key={i}
          x={x / RATIO}
          y={y / RATIO - 4}
          style={{
            fontSize: "5px",
            stroke: "red",
            fill: "white",
            strokeWidth: "1",
            paintOrder: "stroke",
          }}
          textAnchor="middle"
        >
          {i + 1}
        </text>
      ))}
    </svg>
  );
};
