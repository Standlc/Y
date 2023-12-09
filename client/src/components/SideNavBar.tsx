import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Button, Icon, Input } from "./UiKit";
import { NewUser } from "~/srcs/types";
import { FavoriteBorder, Home } from "@mui/icons-material";
// border border-border_s bg-white bg-opacity-[5%]
export default function SideNavBar({ user }: { user: NewUser }) {
  return (
    <div
      className="sticky top-0 flex h-[100vh] w-[250px] flex-col justify-between gap-6 border-transparent border-r-border_s bg-transparent 
    py-5"
    >
      <div className="flex flex-col justify-center gap-3 rounded-2xl">
        <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border-border_s">
          <div className="absolute h-[35px] w-[3px] rounded-br-lg rounded-tr-lg bg-white" />
          <div className="group flex cursor-pointer select-none items-center bg-white bg-opacity-5 p-5 py-4 [transition:box-shadow_0.2s,border_0.2s,background_0.2s] hover:border-border_p hover:bg-opacity-10">
            <Icon IconRef={Home} size="md" />
            <span className="ml-3 font-bold opacity-70">Home</span>
          </div>

          <div className="h-[1px] bg-white opacity-0" />
          <div className="group flex cursor-pointer select-none items-center bg-white bg-opacity-5 p-5 py-4 [transition:box-shadow_0.2s,border_0.2s,background_0.2s] hover:border-border_p hover:bg-opacity-10">
            <Avatar imgUrl={user.profilePictureUrl} size="xs" />
            <span className="ml-3 font-bold opacity-70">Profile</span>
          </div>
          <div className="h-[1px] bg-white opacity-0" />

          <div className="group flex cursor-pointer select-none items-center bg-white bg-opacity-5 p-5 py-4 [transition:box-shadow_0.2s,border_0.2s,background_0.2s] hover:border-border_p hover:bg-opacity-10">
            <Icon IconRef={FavoriteBorder} size="md" />
            <span className="ml-3 font-bold opacity-70">Notifications</span>
          </div>
          <div className="h-[1px] bg-white opacity-0" />

          <div className="group flex cursor-pointer select-none items-center bg-white bg-opacity-5 p-5 py-4 [transition:box-shadow_0.2s,border_0.2s,background_0.2s] hover:border-border_p hover:bg-opacity-10">
            <Icon IconRef={SearchIcon} size="md" />
            <span className="ml-3 font-bold opacity-70">Search</span>
          </div>
        </div>

        <div className="group flex cursor-pointer select-none items-center rounded-2xl bg-white bg-opacity-5 p-5 py-4 [transition:box-shadow_0.2s,border_0.2s,background_0.2s] hover:border-border_p hover:bg-opacity-10">
          <Icon IconRef={LogoutIcon} size="md" iconFontSize={15} />
          <span className="ml-3 font-bold opacity-70">Log out</span>
        </div>
      </div>
      <Button>Post</Button>
    </div>
  );
}

const NavItem = () => {
  return (
    <div>
      <div></div>
    </div>
  );
};
