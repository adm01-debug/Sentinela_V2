import { useState, useEffect } from "react";

type Status = "idle" | "loading" | "ready" | "error";

export function useScript(src: string) {
  const [status, setStatus] = useState<Status>(src ? "loading" : "idle");

  useEffect(() => {
    if (!src) { setStatus("idle"); return; }

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }

    const setReady = () => setStatus("ready");
    const setError = () => setStatus("error");

    script.addEventListener("load", setReady);
    script.addEventListener("error", setError);

    return () => {
      script.removeEventListener("load", setReady);
      script.removeEventListener("error", setError);
    };
  }, [src]);

  return status;
}
