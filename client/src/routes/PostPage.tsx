import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar } from "../components/UiKit";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { AppPost, NewReply } from "~/srcs/types";
import {
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Post from "./feed/Post";
import { publicUri, timingFunction } from "../App";
import { useMakeRequest } from "../customHooks";
import {
  PostModalContext,
  StatusPopupContext,
  getClientPos,
  resetClientPos,
  setClientPos,
} from "../components/Layouts";
import { CurrUserContextType } from "../types";

export const ErrorPage = ({ title }: { title?: string }) => {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      <h1 className="text-3xl font-extrabold">
        {title ?? "Oops, nothing to see here :/"}
      </h1>
    </div>
  );
};

export default function PostPage() {
  const postWrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { username, postid } = useParams();
  const [post, setPost] = useState<AppPost | undefined>(undefined);

  const { data, isPending, isError } = useQuery({
    queryKey: ["getPost", username, postid],
    retry: false,
    queryFn: async () => {
      const res = await axios.get<AppPost>(`/api/posts/${postid}`);
      return res.data;
    },
  });

  useEffect(() => {
    setPost(data);
  }, [data]);

  if (isError) {
    return <ErrorPage />;
  }

  if (isPending || !post) {
    return null;
  }

  return (
    <div className="flex flex-col items-center py-[55px]">
      <Suspense fallback={"HELLO!!!"}>
        <div className="min-w-600px w-[600px]">
          <div className="fixed top-0 z-50 flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div onClick={() => navigate(-1)} className="cursor-pointer">
                <ArrowBackIcon />
              </div>
              <div className="h-[30px] w-[1px] rotate-12 bg-white opacity-10"></div>
              <span className="text-lg font-extrabold">
                @{post.authorUsername}'s post
              </span>
            </div>
          </div>

          <PreviousPosts post={post} postRef={postWrapperRef} />
          <div ref={postWrapperRef} className="min-h-[calc(100vh-110px)]">
            <Post post={post} isThread={true} />
            <RepliesSection post={post} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

const PreviousPosts = ({
  post,
  postRef,
}: {
  post: AppPost;
  postRef: React.RefObject<HTMLDivElement>;
}) => {
  if (post.replyTargetId == null) {
    return null;
  }

  const threadQuery = useQuery({
    queryKey: ["getThread", post.id],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const res = await axios.get<AppPost[]>(`/api/thread/${post.id}`);
      console.log(res.data);
      return res.data;
    },
  });

  useLayoutEffect(() => {
    if (threadQuery.data && !threadQuery.isPending) {
      if (!postRef.current) return;
      postRef.current?.scrollIntoView();
    }
  }, [threadQuery.data, threadQuery.isPending]);

  if (threadQuery.isError) {
    return <ErrorPage />;
  }

  if (threadQuery.isPending) {
    return null;
  }

  return (
    <div>
      {threadQuery.data.map((post) => {
        return <Post key={post.id} post={post} isThread={true} />;
      })}
    </div>
  );
};

const RepliesSection = ({ post }: { post: AppPost }) => {
  const inputModal = useContext(PostModalContext);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const placeholderWrapperRef = useRef<HTMLDivElement>(null);
  const { user } = useOutletContext<CurrUserContextType>();
  const { setStatusData } = useContext(StatusPopupContext);
  const [replies, setReplies] = useState<AppPost[]>([]);
  const [newReply, setNewReply] = useState<NewReply>({
    caption: "",
    replyTargetId: post.id,
  });

  const replyQuery = useMakeRequest(
    ["replyPost", post.id, newReply],
    async () => {
      const res = await axios.post(`/api/reply`, newReply);
      return res.data;
    },
  ) as UseQueryResult<AppPost, Error>;
  const [repliesCount, setRepliesCount] = useState(post.repliesCount ?? 0);

  useEffect(() => {
    if (replyQuery.isFetching || !replyQuery.isFetched || !replyQuery.data) {
      return;
    }
    setRepliesCount(repliesCount + 1);
    setNewReply({
      caption: "",
      replyTargetId: post.id,
    });
    setReplies([...replies, replyQuery.data]);
    setStatusData({
      title: "Reply was sent",
      isSuccess: true,
    });
  }, [replyQuery.isFetched, replyQuery.isFetching, replyQuery.data]);

  const showInput = () => {
    inputModal.show({
      showHandler: (modal, modalContainer) => {
        if (placeholderRef.current && placeholderWrapperRef.current) {
          const transitions =
            placeholderRef.current.style.getPropertyValue("transition");
          placeholderRef.current.style.transition = "none";
          placeholderRef.current.style.visibility = "visible";
          placeholderRef.current.style.opacity = "1";

          const inputModalPosBefore = getClientPos(modal);
          const placeholderPos = getClientPos(placeholderRef.current);
          console.log(placeholderPos);

          placeholderRef.current.style.position = "fixed";
          setClientPos(placeholderRef.current, placeholderPos);
          setClientPos(modal, placeholderPos);

          modalContainer.style.opacity = "0";

          window.requestAnimationFrame(() => {
            if (placeholderRef.current) {
              placeholderRef.current.style.transition = transitions;
              modalContainer.style.opacity = "1";
              placeholderRef.current.style.opacity = "0";
              placeholderRef.current.style.visibility = "hidden";

              setClientPos(placeholderRef.current, inputModalPosBefore);
              setClientPos(modal, inputModalPosBefore);
            }
          });
        }
      },
      hideHandler: (modal, modalContainer) => {
        if (placeholderRef.current && placeholderWrapperRef.current) {
          const transitions =
            placeholderRef.current.style.getPropertyValue("transition");
          placeholderRef.current.style.transition = "none";
          placeholderRef.current.style.visibility = "visible";
          placeholderRef.current.style.opacity = "1";

          resetClientPos(placeholderRef.current);

          const inputModalPos = getClientPos(modal);
          const placeholderPos = getClientPos(placeholderWrapperRef.current);

          setClientPos(placeholderRef.current, inputModalPos);
          setClientPos(modal, inputModalPos);

          window.requestAnimationFrame(() => {
            if (placeholderRef.current) {
              modalContainer.style.opacity = "0";
              placeholderRef.current.style.opacity = "1";

              setClientPos(placeholderRef.current, placeholderPos);
              setClientPos(modal, placeholderPos);
              placeholderRef.current.style.transition = transitions;
            }

            setTimeout(() => {
              if (placeholderRef.current) {
                placeholderRef.current.style.position = "absolute";
                resetClientPos(placeholderRef.current);
              }
            }, 500);
          });
        }
      },
      postReqHander: (newReply) => {
        setReplies([newReply, ...replies]);
        setStatusData({
          title: "Reply was sent",
          isSuccess: true,
        });
      },
      targetId: post.id,
    });
  };

  return (
    <div>
      <div className="flex w-full items-stretch gap-3 py-4">
        <div>
          <Avatar imgUrl={publicUri(user.profilePictureUrl)} size="md" />
        </div>

        <div
          ref={placeholderWrapperRef}
          className="relative flex h-auto w-full"
        >
          <div
            onClick={showInput}
            style={{
              transition: `opacity 0.5s ${timingFunction}, height 0.5s ${timingFunction}, width 0.5s ${timingFunction}, left 0.5s ${timingFunction}, top 0.5s ${timingFunction}, transform 0.5s ${timingFunction}, visibility 0.5s ${timingFunction}`,
            }}
            ref={placeholderRef}
            className="absolute flex h-full w-full cursor-text items-center rounded-2xl border border-border_s bg-white bg-opacity-5 p-3 backdrop-blur-3xl"
          >
            <div className="opacity-50">Post your reply...</div>
          </div>
        </div>
      </div>
      <Replies post={post} replies={replies} setReplies={setReplies} />
    </div>
  );
};

const Replies = ({
  post,
  replies,
  setReplies,
}: {
  post: AppPost;
  replies: AppPost[];
  setReplies: React.Dispatch<React.SetStateAction<AppPost[]>>;
}) => {
  const repliesQuery = useQuery({
    queryKey: ["getReplies", post.id],
    retry: false,
    queryFn: async () => {
      const res = await axios.get(`/api/reply/${post.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (
      !repliesQuery.isFetched ||
      repliesQuery.isFetching ||
      !repliesQuery.data
    ) {
      return;
    }
    setReplies(repliesQuery.data);
  }, [repliesQuery.isFetched, repliesQuery.isFetching, repliesQuery.data]);

  if (!replies.length) {
    return null;
  }

  return (
    <div
      className={`flex w-full flex-col gap-4 divide-y-[1px] divide-white divide-opacity-10`}
    >
      {replies?.map((reply) => {
        return <Post key={reply.id} post={reply} />;
      })}
    </div>
  );
};
