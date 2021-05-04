import {
  AREA_CODES,
  ItemCounts,
  satisfies,
  sumItemCounts,
  WeaponType,
} from "../utils/lumiaIsland";
import { Combination } from "js-combinatorics";

export interface RequestData {
  requiredItemCounts: ItemCounts;
  users: Array<{
    characterCode: number;
    startWeaponType: WeaponType;
  }>;
}

export type ResponseData =
  | {
      type: "START";
      total: bigint;
    }
  | {
      type: "PROGRESS";
      current: bigint;
      total: bigint;
    }
  | {
      type: "FINISH";
      routes: number[][];
    };

const newArray = ({ from, to }: { from: number; to: number }) => {
  return [...new Array(to - from + 1)].map((_, i) => i + from);
};

addEventListener(
  "message",
  ({ data: { requiredItemCounts, users } }: MessageEvent<RequestData>) => {
    const total = newArray({ from: 1, to: AREA_CODES.length }).reduce(
      (acc, n) => acc + BigInt(new Combination(AREA_CODES, n).length),
      BigInt(0)
    );

    postMessage({ type: "START", total } as ResponseData);

    let current = BigInt(0);
    const step = total / BigInt(300);

    for (const n of newArray({ from: 1, to: AREA_CODES.length })) {
      const suggestedRoutes = [];

      for (const route of new Combination(AREA_CODES, n)) {
        if (
          satisfies({
            requirements: requiredItemCounts,
            current: sumItemCounts(users.map((u) => ({ ...u, route }))),
          })
        ) {
          suggestedRoutes.push(route);
        }

        current++;

        if (current % step === BigInt(0)) {
          postMessage({ type: "PROGRESS", total, current } as ResponseData);
        }
      }

      if (suggestedRoutes.length > 0) {
        postMessage({
          type: "FINISH",
          routes: suggestedRoutes,
        } as ResponseData);

        return;
      }
    }

    postMessage({ type: "FINISH", routes: [] } as ResponseData);
  }
);
