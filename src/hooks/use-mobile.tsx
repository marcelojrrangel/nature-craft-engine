const MOBILE_BREAKPOINT = 768;

function hasMobileParam(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('mobile') === '1';
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => hasMobileParam() || (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT));

  React.useEffect(() => {
    if (hasMobileParam()) {
      setIsMobile(true);
      return;
    }
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
