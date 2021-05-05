import { useCallback, useEffect, useRef } from "react";
import { RequestData, ResponseData } from "../workers/routeSuggester";

export const useRouteSuggester = (onMessage: (data: ResponseData) => void) => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/routeSuggester", import.meta.url)
    );
    workerRef.current.onmessage = (evt: MessageEvent<ResponseData>) =>
      onMessage(evt.data);

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const postMessage = useCallback((data: RequestData) => {
    if (workerRef.current) {
      workerRef.current.postMessage(data);
    }
  }, []);

  return postMessage;
};
