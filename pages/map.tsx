import Container from "@material-ui/core/Container";
import Head from "next/head";
import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Divider from "@material-ui/core/Divider";
import dynamic from "next/dynamic";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Button from "@material-ui/core/Button";

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

const eachSlice = <T extends unknown>(
  xs: Uint32Array,
  size: number
): Array<Array<T>> => {
  return xs.reduce((acc, x, i) => {
    if (i % size == 0) {
      return [...acc, [x]];
    } else {
      acc[acc.length - 1].push(x);
      return acc;
    }
  }, []);
};

const eachCons = <T extends unknown>(
  xs: Array<T>,
  size: number
): Array<Array<T>> => {
  return Array.from({ length: xs.length - size + 1 }, (_, i) =>
    xs.slice(i, i + size)
  );
};

const DPI = 120;
const INCH_IN_MM = 25.4;
const RATIO = DPI / INCH_IN_MM;
const OFFSET_X = 29.6991;
const OFFSET_Y = 35.462307;

const MapComponent = dynamic<{ route: number[] }>({
  loader: async () => {
    const { calcRoute } = await import("../wasm/pkg/wasm");

    return React.memo(({ route }) => (
      <div>
        <svg
          width="210mm"
          height="297mm"
          viewBox="0 0 210 297"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          {eachCons(route, 2).map(([a, b], i, xs) => (
            <path
              key={i}
              d={`M ${eachSlice<number>(calcRoute(a, b), 2)
                .map(
                  ([x, y]) => `${x / RATIO + OFFSET_X} ${y / RATIO + OFFSET_Y}`
                )
                .join(" ")}`}
              stroke={`rgba(255, 0, 0, ${(i + 1) / xs.length})`}
              fill="transparent"
            />
          ))}
          <image x={0} y={0} width="100%" height="100%" href="map.svg" />
        </svg>
      </div>
    ));
  },
});

export default function Map() {
  const { t } = useTranslation();

  const [route, setRoute] = useState([
    298,
    263,
    293,
    560,
    538,
    180,
    562,
    639,
    431,
    414,
    372,
    329,
    316,
    334,
    67,
    92,
    155,
    217,
    259,
    230,
  ]);

  const [text, setText] = useState(JSON.stringify(route, null, 2));

  return (
    <div>
      <Head>
        <title>Lumia Walker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container maxWidth="xl">
          <TextareaAutosize
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              try {
                setRoute(JSON.parse(text));
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Show
          </Button>
          <Divider />
          <MapComponent route={route} />
          <Divider />
          {t("footer.copyright")}
        </Container>
      </main>
    </div>
  );
}
