import { useRouter } from "next/router";
import { useEffect } from "react";

export const useQueryParamStore = <T extends {}>(
  data: T,
  onChanged: (data: T) => void
) => {
  const router = useRouter();

  const json = JSON.stringify(data);

  useEffect(() => {
    if (router.query.data) {
      const queryJson = decodeURIComponent(router.query.data as string);
      if (queryJson !== json) {
        const data = router.query.data ? JSON.parse(queryJson) : [];
        onChanged(data);
      }
    }
  }, [router.query.data]);

  useEffect(() => {
    if (router.query.data) {
      router.push(`?data=${encodeURIComponent(json)}`);
    }
  }, [json]);
};
