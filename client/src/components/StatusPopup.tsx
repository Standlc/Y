import CheckIcon from "@mui/icons-material/Check";
import { useContext, useEffect } from "react";
import { StatusPopupContext } from "./Layouts";
import { Icon } from "./UiKit";
import { Close } from "@mui/icons-material";

const styles = {
  success: {
    border: "rgba(255,255,255,0.15)",
    icon: CheckIcon,
    bg: "black",
  },
  error: {
    border: "rgba(255,100,50,0.3)",
    icon: Close,
    bg: "black",
  },
};

export default function StatusPopup() {
  const { statusData, setStatusData } = useContext(StatusPopupContext);

  useEffect(() => {
    if (statusData.title) {
      const timer = setTimeout(() => {
        setStatusData({ ...statusData, title: undefined });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [statusData.title]);

  if (!statusData.title) {
    return null;
  }

  const style = styles[statusData.isSuccess ? "success" : "error"];

  return (
    <div className="pointer-events-none fixed top-0 z-10 flex h-full w-full justify-center">
      <div
        style={{
          animationFillMode: "forwards",
          borderColor: style.border,
          backgroundColor: style.bg,
        }}
        className={`animate-statusPopup fixed bottom-10 flex select-none items-center rounded-xl border bg-black bg-opacity-30 px-5 py-3 shadow-[0_5px_20px_0_rgba(0,0,0,0.5)] backdrop-blur-3xl
        `}
      >
        <span className="mr-3 font-bold opacity-80">{statusData.title}</span>
        <Icon
          style={{ borderRadius: "100px" }}
          iconFontSize={12}
          IconRef={style.icon}
          size="sm"
        />
      </div>
    </div>
  );
}
