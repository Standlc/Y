import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Button, Icon } from "./UiKit";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { AppUser } from "~/srcs/types";
import { FavoriteBorder, Home } from "@mui/icons-material";
import { useContext, useState } from "react";
import {
  FeedContext,
  PostModalContext,
  StatusPopupContext,
  getClientPos,
  resetClientPos,
  setClientPos,
} from "./Layouts";
import { publicUri, timingFunction } from "../App";
import SearchUsers from "./SearchUsers";
import { NavLink } from "react-router-dom";

export default function SideNavBar({ user }: { user: AppUser }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      {showSearch && <SearchUsers hide={() => setShowSearch(false)} />}
      <div
        className="fixed top-0 z-10 flex h-full min-w-[300px] flex-col justify-end gap-6 border-transparent border-r-border_s bg-transparent p-5 
    pt-[60px]"
      >
        <div className="fixed top-[50%] flex -translate-y-[50%] flex-col justify-center gap-1 rounded-xl border-border_s">
          {/* <div className="absolute h-[35px] w-[3px] rounded-br-lg rounded-tr-lg bg-white" /> */}
          {/* <div className="absolute h-[5px] w-[5px] rounded-full  bg-white opacity-80" /> */}

          <NavLink to="/">
            {({ isActive }) =>
              isActive ? (
                <NavItem title="Home" icon={<HomeIcon fill={true} />} />
              ) : (
                <NavItem title="Home" icon={<HomeIcon fill={false} />} />
              )
            }
          </NavLink>

          <NavLink to={`/${user.username}`}>
            <NavItem
              title="Profile"
              onClick={() => {}}
              icon={
                <Avatar imgUrl={publicUri(user.profilePictureUrl)} size="sm" />
              }
            />
          </NavLink>

          {/* <NavItem
            title="Notifications"
            icon={<FavoriteBorder sx={{ fontSize: 27 }} />}
            onClick={() => {}}
          /> */}

          <NavItem
            title="Search"
            icon={<SearchIcon size={23} />}
            onClick={() => setShowSearch(true)}
          />
        </div>

        {/* <div className="group flex cursor-pointer select-none items-center rounded-xl bg-white bg-opacity-[%] px-1 py-3 [transition:box-shadow_0.2s,border_0.2s,background_0.2s]">
            <Icon IconRef={LogoutIcon} size="md" />
            <span className="ml-3 font-bold opacity-70">Log out</span>
          </div> */}

        <CreateButton />
      </div>
    </>
  );
}

const NavItem = ({
  title,
  onClick,
  icon,
}: {
  title: string;
  onClick?: () => void;
  icon: any;
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex h-[60px] w-[60px] cursor-pointer select-none items-center justify-center rounded-2xl  [transition:transform_0.2s] active:scale-[90%]"
    >
      <div className="absolute h-full w-full scale-[85%] rounded-lg bg-white bg-opacity-10 opacity-0 [transition:opacity_0.2s,transform_0.2s] group-hover:scale-100 group-hover:opacity-100"></div>
      {icon}
    </div>
  );
};

export const showModalButtonTransition = (
  modal: HTMLElement,
  modalContainer: HTMLElement,
) => {
  const modalBtn = document.getElementById("post-modal-btn");
  const btn = document.getElementById("post-btn");
  if (!btn || !modalBtn) {
    return;
  }
  const modalPosBefore = getClientPos(modal);
  const btnPosBefore = getClientPos(btn);
  const modalBtnPosBefore = getClientPos(modalBtn);

  setClientPos(modal, btnPosBefore);
  modalContainer.style.opacity = "0";

  btn.style.opacity = "1";
  btn.style.position = "fixed";
  setClientPos(btn, btnPosBefore);

  window.requestAnimationFrame(() => {
    setClientPos(modal, modalPosBefore);
    modalContainer.style.opacity = "1";

    setClientPos(btn, modalBtnPosBefore);
    btn.style.opacity = `0`;
    btn.style.visibility = `hidden`;
  });
};

export const hideModalButtonTransition = (
  modal: HTMLElement,
  modalContainer: HTMLElement,
) => {
  const btn = document.getElementById("post-btn");
  const modalBtn = document.getElementById("post-modal-btn");
  if (!btn || !modalBtn) {
    return;
  }

  btn.style.position = "unset";
  resetClientPos(btn);
  btn.style.maxWidth = "60px";
  btn.style.minHeight = "60px";

  const ogBtnPos = getClientPos(btn);
  setClientPos(btn, getClientPos(modalBtn));
  btn.style.position = "fixed";

  setClientPos(modal, getClientPos(modal));

  window.requestAnimationFrame(() => {
    setClientPos(modal, ogBtnPos);
    modalContainer.style.opacity = "0";

    setClientPos(btn, ogBtnPos);
    btn.style.opacity = "1";
    btn.style.visibility = `visible`;
  });
};

const CreateButton = () => {
  const postModal = useContext(PostModalContext);
  const { feed, setFeed } = useContext(FeedContext);
  const { setStatusData } = useContext(StatusPopupContext);

  return (
    <div className="relative h-[60px] w-[60px] cursor-pointer">
      <div
        className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-white text-black"
        style={{
          zIndex: 10,
          transition: `opacity 0.5s ${timingFunction}, height 0.5s ${timingFunction}, width 0.5s ${timingFunction}, left 0.5s ${timingFunction}, top 0.5s ${timingFunction}, visibility 0.5s ${timingFunction}, transform 0.2s ${timingFunction}`,
        }}
        onClick={() =>
          postModal.show({
            showHandler: showModalButtonTransition,
            hideHandler: hideModalButtonTransition,
            postReqHander: (data) => {
              setFeed([data, ...feed]);
              setStatusData({
                title: "Post was created",
                isSuccess: true,
              });
            },
          })
        }
        id="post-btn"
      >
        <AddRoundedIcon sx={{ fontSize: 30 }} />
      </div>
    </div>
  );
};

export const SearchIcon = ({ size }: { size?: number }) => {
  const dim = size ?? 26;
  return (
    <svg
      aria-label="Search"
      className="x1lliihq x1n2onr6 x3egl4o"
      fill="transparent"
      height={dim}
      width={dim}
      role="img"
      viewBox={`0 0 ${26} ${26}`}
    >
      <title>Search</title>
      <path
        clipRule="evenodd"
        d="M3.5 11.5C3.5 7.08172 7.08172 3.5 11.5 3.5C15.9183 3.5 19.5 7.08172 19.5 11.5C19.5 15.9183 15.9183 19.5 11.5 19.5C7.08172 19.5 3.5 15.9183 3.5 11.5ZM11.5 1C5.70101 1 1 5.70101 1 11.5C1 17.299 5.70101 22 11.5 22C13.949 22 16.2023 21.1615 17.9883 19.756L22.3661 24.1339C22.8543 24.622 23.6457 24.622 24.1339 24.1339C24.622 23.6457 24.622 22.8543 24.1339 22.3661L19.756 17.9883C21.1615 16.2023 22 13.949 22 11.5C22 5.70101 17.299 1 11.5 1Z"
        fill="currentColor"
        fillRule="evenodd"
      ></path>
    </svg>
  );
};

export const HomeIcon = ({ fill }: { fill: boolean }) => {
  return (
    <svg
      className="x1lliihq x1n2onr6 x3egl4o"
      viewBox="0 0 26 26"
      height="26"
      fill={fill ? "currentColor" : ""}
      width="26"
    >
      <title>Home</title>
      <path
        d="M2.25 12.8855V20.7497C2.25 21.8543 3.14543 22.7497 4.25 22.7497H9.25C9.52614 22.7497 9.75 22.5258 9.75 22.2497V17.6822V16.4997C9.75 14.7048 11.2051 13.2497 13 13.2497C14.7949 13.2497 16.25 14.7048 16.25 16.4997V17.6822V22.2497C16.25 22.5258 16.4739 22.7497 16.75 22.7497H21.75C22.8546 22.7497 23.75 21.8543 23.75 20.7497V12.8855C23.75 11.3765 23.0685 9.94814 21.8954 8.99882L16.1454 4.34539C14.3112 2.86094 11.6888 2.86094 9.85455 4.34539L4.10455 8.99882C2.93153 9.94814 2.25 11.3765 2.25 12.8855Z"
        stroke={fill ? "" : "currentColor"}
        strokeLinecap="round"
        strokeWidth="2"
      ></path>
    </svg>
  );
};
