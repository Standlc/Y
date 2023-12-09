import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useOutletContext } from "react-router";
import { CurrUserContextType } from "../types";
import { AppPost } from "~/srcs/types";
import { Avatar, Icon } from "../components/UiKit";
import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { useMakeRequest } from "../customHooks";
import InfiniteSlotMachine from "../components/InfiniteSlotMachine";

export default function Feed() {
  const { user } = useOutletContext<CurrUserContextType>();

  const { isPending, data } = useQuery({
    queryKey: ["feed"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get<AppPost[]>(`/api/posts/feed`);
      return res.data;
    },
  });

  if (isPending) {
    return "loading...";
  }

  return (
    <div className="flex w-[450px] flex-col gap-4 self-start py-4 text-left">
      {data?.map((post) => {
        return <Post key={post.id} post={post} />;
      })}
    </div>
  );
}

const Post = ({ post }: { post: AppPost }) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border_s bg-white bg-opacity-[5%] p-1 shadow-[0_5px_10px_rgba(0,0,0,0.4)]">
      <PostContentSection post={post} />
      <div className="mx-2 h-[1px] bg-white opacity-[6%]" />
      <ReplySection post={post} />
    </div>
  );
};

const PostContentSection = ({ post }: { post: AppPost }) => {
  return (
    <>
      <div className="flex items-center p-2">
        <div className="group h-min cursor-pointer">
          <Avatar
            imgUrl={post.authorPP ? `/public/${post.authorPP}` : null}
            size="md"
          />
        </div>
        <div className="ml-4 flex flex-col">
          <span className="text-base font-extrabold">
            {post.authorUsername}
          </span>
          <span className="text-xs opacity-40">
            {DateTime.fromISO(post.createdAt as unknown as string).toRelative()}
          </span>
        </div>
      </div>

      <span className="-mb-2 -mt-5 whitespace-pre-wrap p-2 text-[15px] leading-snug opacity-80 [font-weight:400]">
        {post.caption}
      </span>

      {post.photoUrl && (
        <div className="relative">
          <img
            src={`public/${post.photoUrl}`}
            alt=""
            className="absolute top-0 -z-10 scale-100 rounded-lg border border-border_s opacity-50 blur-3xl"
          />
          <img
            src={`public/${post.photoUrl}`}
            alt=""
            className="relative rounded-xl border border-border_s"
          />
        </div>
      )}
    </>
  );
};

const ReplySection = ({ post }: { post: AppPost }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const [reply, setReply] = useState("");

  const animateWrapperHeight = () => {
    if (!wrapperRef || !wrapperRef.current) return;

    const heightBefore = wrapperRef.current.getBoundingClientRect().height;
    wrapperRef.current.style.height = "auto";
    const heightAfter = wrapperRef.current.getBoundingClientRect().height;
    wrapperRef.current.style.height = `${heightBefore}px`;

    window.requestAnimationFrame(() => {
      if (wrapperRef && wrapperRef.current)
        wrapperRef.current.style.height = `${heightAfter}px`;
    });
  };

  useEffect(() => {
    animateWrapperHeight();
  }, [wrapperRef, showReplyInput]);

  useEffect(() => {
    if (!replyRef || !replyRef.current) return;

    replyRef.current.style.height = "0px";
    const height = `${replyRef.current.scrollHeight}px`;
    replyRef.current.style.height = height;

    window.requestAnimationFrame(animateWrapperHeight);
  }, [replyRef, reply, showReplyInput]);

  const replyQuery = useMakeRequest(["replyPost", post.id], async () => {
    const res = await axios.post(`/api/posts/like/${post.id}`);
    return res.data;
  });
  const [repliesCount, setRepliesCount] = useState(post.repliesCount);

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col overflow-hidden  rounded-xl border-border_s bg-white bg-opacity-[7%] [transition:height_0.2s]"
    >
      <div className="flex h-[38px] min-h-min items-center gap-3 p-2">
        <LikeInfos post={post} />
        <div className="h-full w-[1px] bg-border_s"></div>

        <div className="flex h-full items-center">
          <div
            className={`group flex cursor-pointer items-center rounded-lg [transition:all_0.2s] hover:text-sky-500 hover:shadow-[0_0_10px_0_rgba(0,150,255,0.2)]`}
            onClick={() => {
              setShowReplyInput(!showReplyInput);
            }}
          >
            <Icon IconRef={"⤷"} size="md" iconFontSize={15} />
          </div>

          <InfiniteSlotMachine state={repliesCount} />
        </div>
      </div>

      {showReplyInput && (
        <>
          <div className="min-h-[1px] w-full bg-border_s" />
          <div className="flex p-2">
            <textarea
              autoFocus={true}
              onChange={(e) => setReply(e.target.value)}
              ref={replyRef}
              placeholder="Post your reply..."
              className="ml-0 w-full resize-none bg-transparent text-[15px] placeholder:opacity-50 focus:outline-none"
            ></textarea>
          </div>
        </>
      )}
    </div>
  );
};

const LikeInfos = ({ post }: { post: AppPost }) => {
  const [likeCount, setLikeCount] = useState(post.likes.likesCount);
  const [isLikedByUser, setIsLikedByUser] = useState(
    post.likes.isPostLikedByUser,
  );

  const likeQuery = useMakeRequest(["likePost", post.id], async () => {
    const res = await axios.post(`/api/like/${post.id}`);
    return res.data;
  });

  const unlikeQuery = useMakeRequest(["unlikePost", post.id], async () => {
    const res = await axios.post(`/api/like/undo/${post.id}`);
    return res.data;
  });

  const handleLikePost = () => {
    if (isLikedByUser) {
      unlikeQuery.refetch();
      setLikeCount(likeCount - 1);
    } else {
      likeQuery.refetch();
      setLikeCount(likeCount + 1);
    }
    setIsLikedByUser(isLikedByUser ? 0 : 1);
  };

  return (
    <div className="flex h-full items-center">
      <div
        className={`group flex cursor-pointer items-center rounded-lg [transition:all_0.2s] hover:text-pink-700 hover:shadow-[0_0_10px_0_rgba(255,0,100,0.2)] ${
          isLikedByUser ? "text-pink-700" : ""
        }`}
        onClick={handleLikePost}
      >
        <Icon
          IconRef={isLikedByUser ? FavoriteIcon : FavoriteBorderIcon}
          size="md"
        />
      </div>

      <InfiniteSlotMachine state={likeCount} />
    </div>
  );
};
