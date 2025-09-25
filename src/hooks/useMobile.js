import { useEffect, useState } from "react";

const REFERENCE_WIDTH = 414;
const MOBILE_THRESHOLD = 1366;

export const useMobile = () => {
  const [scaleFactor, setScaleFactor] = useState(
    window.innerWidth / REFERENCE_WIDTH
  );
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_THRESHOLD
  );

  useEffect(() => {
    const handleResize = () => {
      setScaleFactor(window.innerWidth / REFERENCE_WIDTH);
      if (window.innerWidth <= MOBILE_THRESHOLD) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    scaleFactor,
    isMobile,
  };
};
