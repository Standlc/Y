import LinkIcon from "@mui/icons-material/Link";
import { UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { CurrUserContextType } from "../../types";
import { AppPost, NewReply } from "~/srcs/types";
import { Avatar, Icon, MoreMenu } from "../../components/UiKit";
import { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useMakeRequest } from "../../customHooks";
import InfiniteSlotMachine from "../../components/InfiniteSlotMachine";
import LikeInfos from "./LikeInfos";
import { PostModalContext, StatusPopupContext } from "../../components/Layouts";
import { Link } from "react-router-dom";
import { publicUri } from "../../App";

export default function Post({
  post,
  isThread,
}: {
  post: AppPost;
  isThread?: boolean;
}) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const { user } = useOutletContext<CurrUserContextType>();
  const navigate = useNavigate();
  const [isFollowedByUser, setIsFollowedByUser] = useState(
    post.isAuthorFollowedByUser as unknown as boolean,
  );
  const { setStatusData } = useContext(StatusPopupContext);
  const params = useParams();
  const isPostPage = (params.postid ?? 0) == post.id;
  const [mouseDownPos, setMouseDownPos] = useState({
    x: 0,
    y: 0,
  });

  const unfollowQuery = useMakeRequest(
    ["unfollow", post.authorId],
    async () => {
      const res = await axios.delete(`/api/following/${post.authorId}`);
      setStatusData({
        title: "User was unfollowed",
        isSuccess: true,
      });
      setIsFollowedByUser(false);
      return res.data;
    },
  );

  const followQuery = useMakeRequest(["follow", post.authorId], async () => {
    const res = await axios.post(`/api/following/${post.authorId}`);
    setStatusData({
      title: "User was followed",
      isSuccess: true,
    });
    setIsFollowedByUser(true);
    return res.data;
  });

  const deleteQuery = useMakeRequest(["delete", post.authorId], async () => {
    if (post.photoUrl) {
      await axios.delete(`/api/public/${post.photoUrl}`);
    }
    const res = await axios.delete(`/api/posts/${post.id}`);
    setStatusData({
      title: "Post was deleted",
      isSuccess: true,
    });
    setIsDeleted(true);
    return res.data;
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({
      x: e.pageX,
      y: e.pageY,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const mouseMoved =
      Math.abs(e.pageX - mouseDownPos.x) > 1 ||
      Math.abs(e.pageY - mouseDownPos.y) > 1;

    if (!mouseMoved) {
      navigate(`/${post.authorUsername}/${post.id}`);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={!isPostPage ? handleMouseUp : undefined}
      style={{
        opacity: isDeleted ? 0.4 : 1,
        pointerEvents: isDeleted ? "none" : "unset",
        // backgroundColor: highlight ? "rgba(255,255,255,0.1)" : "transparent",
      }}
      className="relative flex w-full max-w-[600px] cursor-pointer flex-col items-start gap-3 pt-4 [transition:opacity_0.2s] "
    >
      <PostContentSection
        isPostPage={isPostPage}
        post={post}
        isThread={isThread}
        setHighlight={setHighlight}
      />

      <div className="absolute right-0 top-3">
        <MoreMenu
          data={[
            post.authorId != user.id
              ? isFollowedByUser
                ? { title: "Unfollow", action: unfollowQuery.refetch }
                : { title: "Follow", action: followQuery.refetch }
              : {
                  title: "Delete",
                  theme: "red",
                  action: deleteQuery.refetch,
                },
            {
              title: "Go to profile",
              action: () => navigate(`/${post.authorUsername}`),
            },
          ]}
        />
      </div>
    </div>
  );
}

const PostContentSection = ({
  post,
  isPostPage,
  isThread,
  setHighlight,
}: {
  post: AppPost;
  isPostPage: boolean;
  isThread?: boolean;
  setHighlight: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="w-full items-start gap-3">
      <div className="flex flex-1 gap-3">
        <div className="flex h-auto flex-col items-center gap-2">
          <Link
            className="group"
            role="link"
            to={`/${post.authorUsername}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar imgUrl={publicUri(post.authorPP)} size="md" />
          </Link>
          {isThread ? (
            <div className="flex h-full flex-col gap-2">
              <div className="relative flex h-full min-h-[2px] justify-center">
                <div className="absolute top-0 h-[calc(100%+8px)] min-w-[2px] origin-top rounded-full bg-white opacity-10"></div>
              </div>
            </div>
          ) : !isPostPage && post.repliesCount ? (
            <div className="flex h-full flex-col gap-2">
              <div className="relative flex h-full min-h-[2px] justify-center">
                <div className="absolute top-0 h-full min-w-[2px] origin-top rounded-full bg-white opacity-10"></div>
              </div>
              <div className="relative -mt-1 mr-1 flex min-h-[25px] select-none items-center justify-center">
                <div className="absolute flex">
                  {post.repliesUsersPP?.map((pp, i) => {
                    return (
                      <div key={i} className="-mr-1 rounded-full">
                        <Avatar size="xs" imgUrl={publicUri(pp.value)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-1">
            <Link
              onClick={(e) => e.stopPropagation()}
              role="link"
              className="text-md font-extrabold leading-none"
              to={`/${post.authorUsername}`}
            >
              {post.authorUsername}
            </Link>
            <span className="text-[13px] leading-none opacity-50">
              •{" "}
              {DateTime.fromISO(post.createdAt as unknown as string)
                .toLocal()
                .toRelative()}
            </span>
          </div>

          <span className="-mt-2 whitespace-pre-wrap text-start text-md leading-snug opacity-100 [font-weight:400]">
            {post.caption}
          </span>

          {post.photoUrl && (
            <div className="relative w-full flex-1">
              <img
                src={publicUri(post.photoUrl) ?? ""}
                alt=""
                className="0 absolute top-0 -z-[10] h-full scale-[100%] border border-border_s object-cover opacity-30 blur-3xl"
              />
              <img
                src={publicUri(post.photoUrl) ?? ""}
                alt=""
                className="relative max-h-[500px] rounded-lg border border-border_s bg-transparent object-contain"
              />
            </div>
          )}

          <Interactions
            post={post}
            isPostPage={isPostPage}
            setHighlight={setHighlight}
          />
        </div>
      </div>
    </div>
  );
};

const Interactions = ({
  post,
  isPostPage,
  setHighlight,
}: {
  post: AppPost;
  isPostPage: boolean;
  setHighlight: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const inputModal = useContext(PostModalContext);
  const { setStatusData } = useContext(StatusPopupContext);
  const [repliesCount, setRepliesCount] = useState(post.repliesCount ?? 0);

  useEffect(() => {
    setRepliesCount(post.repliesCount ?? 0);
  }, [post.repliesCount]);

  const handleCopyToClipBoard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.host}/${post.authorUsername}/${post.id}`,
    );
    setStatusData({
      title: "Copied",
      isSuccess: true,
    });
  };

  const handleReplyButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHighlight(true);
    inputModal.show({
      showHandler: (modal, modalContainer) => {
        modalContainer.style.opacity = "0";
        modal.style.transform = "scale(90%)";
        modal.style.transformOrigin = "bottom";

        window.requestAnimationFrame(() => {
          modalContainer.style.opacity = "1";
          modal.style.transform = "scale(100%)";
        });
      },
      hideHandler: (modal, modalContainer) => {
        setHighlight(false);
        modalContainer.style.opacity = "1";

        window.requestAnimationFrame(() => {
          modalContainer.style.opacity = "0";
          modal.style.transform = "scale(90%)";
        });
      },
      postReqHander: () => {
        setRepliesCount(repliesCount + 1);
        setHighlight(false);
        setStatusData({
          title: "Reply was sent",
          isSuccess: true,
        });
      },
      targetId: post.id,
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-2">
      <div className="flex items-center gap-7">
        <LikeInfos post={post} />
        <PostInteraction
          value={repliesCount}
          onClick={handleReplyButtonClick}
          variant="blue"
          IconRef={"⤷"}
        />
        <div
          className="group flex -rotate-[60deg] cursor-pointer items-center justify-center"
          onClick={handleCopyToClipBoard}
        >
          <Icon IconRef={LinkIcon} size="sm" />
        </div>
      </div>
    </div>
  );
};

export const PostInteraction = ({
  onClick,
  IconRef,
  value,
  style,
  variant,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement> | undefined;
  IconRef: any;
  value: number;
  style?: React.CSSProperties;
  variant?: "blue" | "green" | "base" | "pink";
}) => {
  return (
    <div className="flex h-full items-center gap-1 text-sm text-white">
      <div className={`group cursor-pointer`} onClick={onClick}>
        <Icon style={style} variant={variant} IconRef={IconRef} size="sm" />
      </div>
      <InfiniteSlotMachine state={value} />
    </div>
  );
};
