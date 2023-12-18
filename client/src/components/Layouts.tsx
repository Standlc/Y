import LinkIcon from "@mui/icons-material/Link";
import { Navigate, Outlet } from "react-router";
import {
  ClientRect,
  CurrUserContextType,
  StatusDataType,
  UnidentifiedUserContextType,
} from "../types";
import { AppPost, AppUser } from "~/srcs/types";
import SideNavBar, {
  hideModalButtonTransition,
  showModalButtonTransition,
} from "./SideNavBar";
import CreatePost from "./CreatePost";
import React, { useEffect, useState } from "react";
import StatusPopup from "./StatusPopup";
import { ScrollRestoration } from "react-router-dom";

export const getClientPos = (element: HTMLElement): ClientRect => {
  return {
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    top: element.getBoundingClientRect().top,
    left: element.getBoundingClientRect().left,
  };
};

export const setClientPos = (element: HTMLElement, clientRect: ClientRect) => {
  element.style.width = `${clientRect.width}px`;
  element.style.height = `${clientRect.height}px`;
  element.style.top = `${clientRect.top}px`;
  element.style.left = `${clientRect.left}px`;
};

export const resetClientPos = (element: HTMLElement) => {
  element.style.setProperty("width", null);
  element.style.setProperty("height", null);
  element.style.setProperty("top", null);
  element.style.setProperty("left", null);
};

export function PrivateLayout({
  context,
}: {
  context: UnidentifiedUserContextType;
}) {
  if (!context.user) {
    return <Navigate to={"/login"} />;
  }

  const [feed, setFeed] = useState<AppPost[]>([]);
  const [showLoadingLine, setShowLoadingLine] = useState(true);
  const [statusData, setStatusData] = useState<StatusDataType>({
    title: undefined,
    isSuccess: true,
  });
  const [postModal, setpostModal] = useState<{
    isTransitioning?: boolean;
    isDisplayed: boolean;
    trigerHide?: boolean;
    showHandler: (modal: HTMLElement, modalContainer: HTMLElement) => void;
    hideHandler: (modal: HTMLElement, modalContainer: HTMLElement) => void;
    postReqHander: (data: AppPost) => void;
    targetId?: number;
  }>({
    isTransitioning: false,
    isDisplayed: false,
    trigerHide: false,
    showHandler: () => {},
    hideHandler: () => {},
    postReqHander: () => {},
  });

  const executeTransition = (
    transitionHandler: (modal: any, container: any) => void,
  ) => {
    const modal = document.getElementById("post-modal");
    const modalContainer = document.getElementById("post-create-wrapper");
    if (modal && modalContainer) {
      const transitions = modal.style.getPropertyValue("transition");
      modal.style.transition = "none";
      const containerTransitions =
        modalContainer.style.getPropertyValue("transition");
      modalContainer.style.transition = "none";

      transitionHandler(modal, modalContainer);

      window.requestAnimationFrame(() => {
        modal.style.transition = transitions;
        modalContainer.style.transition = containerTransitions;
      });
    }
  };

  useEffect(() => {
    if (postModal.isDisplayed) {
      executeTransition(postModal.showHandler);
    }
  }, [postModal.isDisplayed]);

  useEffect(() => {
    const modal = document.getElementById("post-modal");

    if (postModal.isDisplayed && modal) {
      const timer = setTimeout(() => {
        resetClientPos(modal);
        postModal.isTransitioning = false;
        setpostModal({ ...postModal });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [postModal.isDisplayed]);

  useEffect(() => {
    if (postModal.isDisplayed && postModal.trigerHide) {
      executeTransition(postModal.hideHandler);

      const timer = setTimeout(() => {
        postModal.isDisplayed = false;
        postModal.isTransitioning = false;
        postModal.trigerHide = false;
        setpostModal({ ...postModal });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [postModal.isDisplayed, postModal.trigerHide]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "/") {
        // setpostModal({
        //   isDisplayed: true,
        //   isTransitioning: true,
        //   showHandler: showModalButtonTransition,
        //   hideHandler: hideModalButtonTransition,
        // });
      }
    };
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, []);

  return (
    <PostModalContext.Provider
      value={{
        state: postModal.isDisplayed,
        isHidding: postModal.isTransitioning,
        targetId: postModal.targetId,
        finish: postModal.postReqHander,
        show: ({ showHandler, hideHandler, postReqHander, targetId }) => {
          postModal.isDisplayed = true;
          postModal.isTransitioning = true;
          postModal.showHandler = showHandler;
          postModal.hideHandler = hideHandler;
          postModal.postReqHander = postReqHander;
          postModal.targetId = targetId;
          setpostModal({ ...postModal });
        },
        hide: () => {
          postModal.trigerHide = true;
          postModal.isTransitioning = true;
          setpostModal({ ...postModal });
        },
      }}
    >
      <FeedContext.Provider value={{ feed, setFeed }}>
        <LoadingLineContext.Provider
          value={{ show: () => setShowLoadingLine(true) }}
        >
          <StatusPopupContext.Provider value={{ statusData, setStatusData }}>
            {/* <ScrollRestoration /> */}
            <div className="relative z-0 h-full bg-bg_primary">
              <Header />
              <div className="relative flex h-full min-w-full">
                {/* {showLoadingLine && <LoadingLine />} */}
                <SideNavBar user={context.user} />
                <div className="flex-1 px-[300px]">
                  <Outlet
                    context={
                      context as CurrUserContextType satisfies CurrUserContextType
                    }
                  />

                  {postModal.isDisplayed && <CreatePost user={context.user} />}
                  {/* <CreatePost user={context.user} /> */}
                </div>
                <StatusPopup />
              </div>
            </div>
          </StatusPopupContext.Provider>
        </LoadingLineContext.Provider>
      </FeedContext.Provider>
    </PostModalContext.Provider>
  );
}

const LoadingLine = () => {
  return (
    <div className="fixed left-0 top-0 z-20 h-[1px] w-full bg-white opacity-80"></div>
  );
};

// ᴎ
const Header = () => {
  return (
    <div className="fixed top-0 z-10 flex h-[55px] w-full items-center justify-between bg-bg_primary bg-opacity-80 px-5 py-2 backdrop-blur-3xl">
      <div className="flex items-center text-3xl [font-weight:900]">
        <div className="flex items-end text-white">
          <div className="mr-2 -rotate-[60deg]">
            <LinkIcon sx={{ fontSize: 35 }} />
          </div>
          {/* <span className="first-letter:text-5xl">N</span>
          <span className="">O</span>
          <span>W</span>
          <span>.</span> */}
        </div>
      </div>
    </div>
  );
};

interface LoadingLineContextType {
  show: () => void;
}

export const LoadingLineContext = React.createContext<LoadingLineContextType>(
  undefined as unknown as LoadingLineContextType,
);

interface StatusPopupContextType {
  statusData: StatusDataType;
  setStatusData: React.Dispatch<React.SetStateAction<StatusDataType>>;
}

export const StatusPopupContext = React.createContext<StatusPopupContextType>(
  undefined as unknown as StatusPopupContextType,
);

interface FeedContextType {
  feed: AppPost[];
  setFeed: React.Dispatch<React.SetStateAction<AppPost[]>>;
}

export const FeedContext = React.createContext<FeedContextType>(
  undefined as unknown as FeedContextType,
);

interface PostModalContextType {
  state: boolean;
  isHidding?: boolean;
  targetId?: number;
  finish: (data: AppPost) => void;
  show: ({
    showHandler,
    hideHandler,
    postReqHander,
    targetId,
  }: {
    showHandler: (modal: HTMLElement, modalContainer: HTMLElement) => void;
    hideHandler: (modal: HTMLElement, modalContainer: HTMLElement) => void;
    postReqHander: (data: AppPost) => void;
    targetId?: number;
  }) => void;
  hide: () => void;
}

export const PostModalContext = React.createContext<PostModalContextType>(
  undefined as unknown as PostModalContextType,
);

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
            setUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>;
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

export const requestAnimationFrame = (
  element: HTMLElement,
  beforeHandler: (element: HTMLElement) => number,
  afterHandler: (element: HTMLElement, d: any) => void,
) => {
  const data = beforeHandler(element);
  window.requestAnimationFrame(() => afterHandler(element, data));
};

// const showModal = () => {
//   const modal = document.getElementById("post-modal");
//   const modalBtn = document.getElementById("post-modal-btn");
//   const btn = document.getElementById("post-btn");
//   const btnTemp = document.getElementById("post-btn-tmp");
//   const modalContainer = document.getElementById("post-create-wrapper");
//   if (!modal || !btn || !btnTemp || !modalBtn || !modalContainer) {
//     return;
//   }
//   const modalClient = getClientPos(modal);
//   const ogBtnClient = getClientPos(btn);
//   const modalBtnClient = getClientPos(modalBtn);

//   const transitions = modal.style.getPropertyValue("transition");
//   modal.style.transition = "none";
//   setClientPos(modal, ogBtnClient);
//   modalContainer.style.opacity = "0";
//   btnTemp.style.visibility = `visible`;
//   setClientPos(btnTemp, ogBtnClient);
//   btn.style.visibility = "hidden";
//   btn.style.opacity = "0";
//   window.requestAnimationFrame(() => {
//     modal.style.transition = transitions;
//     setClientPos(modal, modalClient);
//     modalContainer.style.opacity = "1";
//     setClientPos(btnTemp, modalBtnClient);
//     btnTemp.style.opacity = `0`;
//     btnTemp.style.visibility = `hidden`;
//   });
// };

// const hideModal = () => {
//   const modal = document.getElementById("post-modal");
//   const modalBtn = document.getElementById("post-modal-btn");
//   const btn = document.getElementById("post-btn");
//   const btnTemp = document.getElementById("post-btn-tmp");
//   const modalContainer = document.getElementById("post-create-wrapper");
//   if (!modal || !btn || !btnTemp || !modalBtn || !modalContainer) {
//     return;
//   }
//   const modalClient = getClientPos(modal);
//   const ogBtnClient = getClientPos(btn);
//   const modalBtnClient = getClientPos(modalBtn);

//   setClientPos(modal, modalClient);
//   modalContainer.style.opacity = "1";
//   btnTemp.style.visibility = `hidden`;
//   setClientPos(btnTemp, modalBtnClient);
//   window.requestAnimationFrame(() => {
//     setClientPos(modal, ogBtnClient);
//     modalContainer.style.opacity = "0";
//     setClientPos(btnTemp, ogBtnClient);
//     btnTemp.style.opacity = `1`;
//     btnTemp.style.visibility = `visible`;
//   });
// };
