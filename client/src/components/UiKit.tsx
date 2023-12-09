import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

export const Input = (
  args: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
) => {
  return (
    <input
      {...args}
      className={`rounded-xl border border-border_s bg-white bg-opacity-5 px-5 py-3 text-base ease-in-out [transition:box-shadow_0.2s,border_0.2s] hover:border-border_p hover:shadow-shadow_hover focus:shadow-shadow_focus focus:outline-0`}
    />
  );
};

const buttonFullPrimaryStyles =
  "bg-primary border-border_s backdrop-blur-2xl shadow-shadow hover:bg-secondary hover:shadow-shadow_hover relative flex w-auto flex-col justify-center overflow-hidden rounded-xl border text-lg font-extrabold transition duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[100%] active:scale-[97%]";

const buttonOutlinedPrimaryStyles =
  "bg-transparent border-border_s shadow-shadow hover:bg-secondary hover:shadow-shadow_hover relative flex w-auto flex-col justify-center overflow-hidden rounded-xl border text-lg font-extrabold transition duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[100%] active:scale-[97%]";

const buttonStyles = {
  outlinedPrimary: buttonOutlinedPrimaryStyles,
  secondaryFull: buttonFullPrimaryStyles,
};

export const Button = (
  args: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    isLoading?: boolean;
    variant?: "outlinedPrimary" | "secondaryFull";
  },
) => {
  const { isLoading, variant, ...ogButtonProps } = args;
  const styles = buttonStyles[variant ?? "secondaryFull"];

  return (
    <div className={styles}>
      <button
        {...ogButtonProps}
        className={`px-3 py-[10px] [transition:color_0.2s] disabled:text-transparent`}
        disabled={isLoading}
      />
      <Spinner isLoading={isLoading ?? false} />
    </div>
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
      <Icon
        IconRef={ChevronLeftIcon}
        className="group-hover:-translate-x-0.0 transition-transform"
        size="sm"
      />
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
    dim: 20,
  },
  md: {
    radius: 8,
    dim: 27,
  },
  lg: {
    radius: 10,
    dim: 35,
  },
  xl: {
    radius: 12,
    dim: 50,
  },
};

type sizes = "xs" | "sm" | "md" | "lg" | "xl";

export const Icon = ({
  IconRef,
  size,
  className,
  iconFontSize,
  style,
}: {
  IconRef:
    | (OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
        muiName: string;
      })
    | string;
  size: sizes;
  className?: string;
  iconFontSize?: number;
  style?: React.CSSProperties;
}) => {
  const dimensions = iconSizes[size];

  return (
    <div
      style={{
        height: `${dimensions.dim}px`,
        width: `${dimensions.dim}px`,
        borderRadius: `${dimensions.radius}px`,
        ...style,
      }}
      className={`pointer-events-none flex items-center justify-center border border-border_s bg-bg_secondary_trans backdrop-blur-xl [transition:all_0.1s] group-hover:border-border_p ${className} select-none group-active:scale-[92%]`}
    >
      {typeof IconRef == "string" ? (
        <span
          style={{
            fontSize: iconFontSize
              ? `${iconFontSize}px`
              : `${(dimensions.dim * 2) / 3}px`,
          }}
        >
          {IconRef}
        </span>
      ) : (
        <IconRef sx={{ fontSize: iconFontSize ?? (dimensions.dim * 2) / 3 }} />
      )}
    </div>
  );
};

const avatarSizes = {
  xs: 25,
  sm: 35,
  md: 45,
  lg: 55,
  xl: 60,
};

export const Avatar = ({
  imgUrl,
  size,
}: {
  imgUrl: string | null | undefined;
  size: sizes;
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
      className="flex items-center justify-center overflow-hidden rounded-full border border-border_s bg-white bg-opacity-[5%] [transition:border_0.2s,box-shadow_0.2s,transform_0.2s] hover:shadow-shadow_hover group-hover:border-border_p group-active:scale-[92%]"
    >
      {imgUrl ? (
        <img src={imgUrl} className="h-full w-full rounded-full object-cover" />
      ) : (
        <AccountCircleIcon sx={{ fontSize: `${dimension}px` }} />
      )}
    </div>
  );
};
