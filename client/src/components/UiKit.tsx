import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useEffect, useRef, useState } from "react";
import { timingFunction } from "../App";
import { MoreMenuType } from "../types";

export const Input = (
  args: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
) => {
  return (
    <input
      {...args}
      className={`rounded-xl border border-border_s bg-white bg-opacity-5 px-5 py-[10px] text-base ease-in-out [transition:box-shadow_0.2s,border_0.2s] hover:border-border_p hover:shadow-shadow_hover focus:shadow-shadow_focus focus:outline-0`}
    />
  );
};

const moreOptionStyles = {
  base: "white",
  red: "#ff3915",
};

export const MoreMenu = ({ data }: { data: MoreMenuType[] }) => {
  const [show, setShow] = useState(false);
  const [dataCopy, setDataCopy] = useState<MoreMenuType[] | undefined>(
    undefined,
  );

  useEffect(() => {
    if (show) {
      setDataCopy([...data]);

      const handler = (e: MouseEvent) => {
        const element = e.target as HTMLElement;
        if (element.role != "open") {
          setShow(false);
        }
      };
      addEventListener("mouseup", handler);
      return () => removeEventListener("mouseup", handler);
    }
  }, [show]);

  return (
    <div className="absolute left-0 top-0 z-[8] flex -translate-x-[100%] cursor-pointer items-center justify-center">
      <div
        role="open"
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        className="group"
      >
        <Icon size="sm" IconRef={MoreHorizIcon} />
      </div>
      <div
        style={{
          transition: `opacity ${timingFunction} 0.2s, visibility 0.2s ${timingFunction}, transform 0.2s ${timingFunction}`,
          transform: show
            ? `scale(100%) translateX(-100%)`
            : "scale(90%) translateX(-100%)",
          opacity: show ? 1 : 0,
          visibility: show ? "visible" : "hidden",
          transformOrigin: "top",
        }}
        className={`absolute left-[8px] top-[22px] z-[8] flex flex-col gap-[1px] overflow-hidden rounded-lg font-bold shadow-2xl backdrop-blur-3xl`}
      >
        {dataCopy?.map((data, i) => <MoreMenuElement key={i} data={data} />)}
      </div>
    </div>
  );
};

const MoreMenuElement = ({ data }: { data: MoreMenuType }) => {
  const styles = moreOptionStyles[data.theme ? "red" : "base"];
  return (
    <div
      style={{
        color: styles,
      }}
      onClick={(e) => {
        e.stopPropagation();
        data.action();
      }}
      className={`flex cursor-pointer select-none items-center justify-start whitespace-nowrap bg-white bg-opacity-10 px-[20px] py-[5px] [transition:background_0.2s] hover:bg-opacity-20`}
    >
      {data.title}
    </div>
  );
};

const buttonDimensions = {
  sm: {
    paddingX: 10,
    paddingY: 1,
    fontSize: 14,
    borderRadius: 8,
  },
  lg: {
    paddingX: 25,
    paddingY: 8,
    fontSize: 19,
    borderRadius: 13,
  },
};

const bgVariants = {
  primary: {
    bg: "bg-primary",
    hover:
      "hover:-translate-y-[1px] hover:scale-[100%] hover:shadow-shadow_hover active:scale-[97%]",
  },
  secondary: {
    bg: "bg-secondary",
    hover:
      "hover:-translate-y-[1px] hover:scale-[100%] hover:bg-primary hover:shadow-shadow_hover active:scale-[97%]",
  },
  monochrome: {
    bg: "bg-white bg-opacity-10",
    hover:
      "hover:-translate-y-[1px] hover:scale-[100%] hover:bg-opacity-20 hover:shadow-shadow_hover active:scale-[97%]",
  },
};

export const Button = (
  args: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    size?: "sm" | "lg";
    isLoading?: boolean;
    active?: boolean;
    variant?: "primary" | "secondary" | "monochrome";
  },
) => {
  const {
    isLoading,
    style,
    active,
    variant,
    children,
    size,
    ...ogButtonProps
  } = args;
  const styles = bgVariants[variant ?? "primary"];
  const isActive = active || active == undefined;
  const dim = buttonDimensions[size ?? "lg"];

  return (
    <button
      {...ogButtonProps}
      style={{
        ...style,
        // fontSize: `${dim.fontSize}px`,
        // padding: `${dim.paddingY}px ${dim.paddingX}px  ${dim.paddingY}px  ${dim.paddingX}px`,
      }}
      className={`relative flex w-auto select-none flex-col items-center justify-center overflow-hidden rounded-xl text-lg font-extrabold text-black shadow-shadow duration-300 ease-in-out [transition:color_0.2s,transform_0.2s,box-shadow_0.2s,background-color_0.2s] ${
        isActive ? styles.hover : "opacity-50"
      } ${styles.bg} px-5 py-2`}
      disabled={isLoading}
    >
      {children}
      <Spinner isLoading={isLoading ?? false} />
    </button>
  );
};

export const PostButton = (
  args: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    size?: "sm" | "lg";
    isLoading?: boolean;
    active?: boolean;
    commands?: string[];
  },
) => {
  const { commands, children, ...others } = args;

  return (
    <Button {...others}>
      <div className="relative flex items-center gap-3">
        <div className="absolute -left-[100%] flex items-center gap-1">
          {commands &&
            commands.map((command, i) => {
              return <Icon key={i} IconRef={command} size="xs" />;
            })}
        </div>
        {children}
      </div>
    </Button>
  );
};

export const Spinner = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute z-10 flex h-full w-full animate-fadein items-center justify-center bg-transparent transition-all">
      <div className="absolute z-10 flex h-full w-full animate-pulse bg-secondary opacity-100" />
      <div className="z-10 h-[30px] w-[30px] animate-spin rounded-full border-4 border-transparent [border-left:4px_solid_white]" />
    </div>
  );
};

export const ArrowButton = ({
  children,
  onClick,
  dir,
}: {
  children: string;
  onClick?: () => void;
  dir: "left" | "right";
}) => {
  return (
    <div
      className="group flex cursor-pointer items-center"
      onClick={onClick ?? undefined}
    >
      {dir == "right" && (
        <span className="ml-2 text-sm opacity-50">{children}</span>
      )}
      <Icon IconRef={ChevronLeftIcon} size="sm" />
      {dir == "left" && (
        <span className="ml-2 text-sm opacity-50">{children}</span>
      )}
    </div>
  );
};

const iconSizes = {
  xs: {
    radius: 4,
    dim: 15,
  },
  sm: {
    radius: 6,
    dim: 25,
  },
  md: {
    radius: 8,
    dim: 30,
  },
  lg: {
    radius: 10,
    dim: 40,
  },
  xl: {
    radius: 12,
    dim: 50,
  },
};

const iconStyles = {
  pink: "rgb(255,24,93)",
  blue: "rgb(50,110,255)",
  green: "rgb(20,255,100)",
  base: "white",
};

export const Icon = ({
  IconRef,
  size,
  iconFontSize,
  style,
  variant,
}: {
  IconRef:
    | (OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
        muiName: string;
      })
    | string;
  size: "xs" | "sm" | "md" | "lg" | "xl";
  iconFontSize?: number;
  style?: React.CSSProperties;
  variant?: "pink" | "blue" | "green" | "base";
}) => {
  const dimensions = iconSizes[size];
  const styles = iconStyles[variant ?? "base"];

  return (
    <div
      style={{
        height: `${dimensions.dim}px`,
        width: `${dimensions.dim}px`,
        borderRadius: `${50}px`,
        ...style,
      }}
      className={`group pointer-events-none relative flex select-none items-center justify-center [transition:all_0.1s] group-active:scale-[92%]`}
    >
      <div className="z-[1] flex items-center justify-center">
        {typeof IconRef == "string" ? (
          <span
            style={{
              fontSize: iconFontSize
                ? `${iconFontSize}px`
                : `${(dimensions.dim * 5) / 7}px`,
            }}
          >
            {IconRef}
          </span>
        ) : (
          <IconRef
            sx={{
              fontSize: iconFontSize ?? Math.round((dimensions.dim * 6) / 7),
            }}
          />
        )}
      </div>
      <div
        style={{
          backgroundColor: styles,
        }}
        className="absolute z-[0] h-[130%] w-[130%] scale-0 rounded-full opacity-10 [transition:transform_0.2s] group-hover:scale-100"
      ></div>
    </div>
  );
};

const avatarSizes = {
  xs: 18,
  sm: 30,
  md: 40,
  lg: 55,
  xl: 60,
  "2xl": 150,
};

export const Avatar = ({
  imgUrl,
  size,
}: {
  imgUrl: string | null | undefined;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}) => {
  const dimension = avatarSizes[size];

  return (
    <div
      style={{
        height: `${dimension}px`,
        minHeight: `${dimension}px`,
        width: `${dimension}px`,
        minWidth: `${dimension}px`,
      }}
      className="group-[avatar]-hover:border-border_p group-[avatar]-hover:shadow-[0_0_0_5px_rgba(255,255,255,0.1)] group-[avatar]-active:scale-[92%] flex select-none items-center justify-center overflow-hidden rounded-full border border-border_s bg-white bg-opacity-[5%] [transition:border_0.2s,box-shadow_0.2s,transform_0.2s]"
    >
      {imgUrl ? (
        <img src={imgUrl} className="h-full w-full rounded-full object-cover" />
      ) : (
        <AccountCircleIcon sx={{ fontSize: `${dimension + 7}px` }} />
      )}
    </div>
  );
};
