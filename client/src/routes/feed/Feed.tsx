import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AppPost } from "~/srcs/types";
import { useContext, useEffect, useRef, useState } from "react";
import Post from "./Post";
import { FeedContext, StatusPopupContext } from "../../components/Layouts";
import { title } from "process";

export default function Feed() {
  const { setStatusData } = useContext(StatusPopupContext);
  const { feed, setFeed } = useContext(FeedContext);
  const [showMore, setShowMore] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const feedQuery = useQuery({
    queryKey: ["feed"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get<AppPost[]>(`/api/users/feed`);
      setFeed(res.data);
      console.log();
      return res.data;
    },
  });

  // if (isError) {
  //   setStatusData({
  //     title: "Some error occured",
  //     isSuccess: false,
  //   });
  //   return null;
  // }

  if (!feed) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className="flex flex-1 justify-center py-[55px] [transition:width_0.5s]"
    >
      <div className="flex flex-1 justify-center">
        <div
          onClick={() => {
            setShowMore(!showMore);
          }}
          className="divid flex w-[600px] min-w-[600px] flex-col gap-4 divide-y-[1px] divide-white divide-opacity-10 self-start text-left"
        >
          {feed?.map((post) => {
            return <Post key={post.id} post={post} />;
          })}
        </div>
      </div>
    </div>
  );
}
