import { useAtomValue, useSetAtom } from "jotai";
import { CgSun } from "react-icons/cg";
import { CgMoon } from "react-icons/cg";
import { dayThemeAtom } from "../utilities/utilities";

export const ThemeToggle = () => {
  //   const [dayTheme, setDayTheme] = useState(true);
  const dayTheme = useAtomValue(dayThemeAtom);
  const setDayTheme = useSetAtom(dayThemeAtom);
  return (
    <div
      className="toggle-container"
      onClick={() => setDayTheme((prev) => !prev)}
    >
      {dayTheme ? <CgSun className="icon" /> : <CgMoon className="icon" />}
    </div>
  );
};
