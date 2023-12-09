import { Navigate, Outlet } from "react-router";
import { CurrUserContextType, UnidentifiedUserContextType } from "../types";
import { NewUser } from "~/srcs/types";
import SideNavBar from "./SideNavBar";

export function PrivateLayout({
  context,
}: {
  context: UnidentifiedUserContextType;
}) {
  if (!context.user) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="relative -z-0 flex min-h-screen min-w-full justify-center gap-10 bg-bg_primary">
      <SideNavBar user={context.user} />
      <Outlet
        context={context as CurrUserContextType satisfies CurrUserContextType}
      />
    </div>
  );
}

export function PublicLayout({
  context,
}: {
  context: UnidentifiedUserContextType;
}) {
  if (context.user) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="flex min-h-screen min-w-full items-center justify-center bg-bg_primary">
      <Outlet
        context={
          { setUser: context.setUser } satisfies {
            setUser: React.Dispatch<React.SetStateAction<NewUser | undefined>>;
          }
        }
      />
    </div>
  );
}

export const LoadingLayout = () => {
  return (
    <div className="flex min-h-screen min-w-full items-center justify-center bg-bg_primary"></div>
  );
};
