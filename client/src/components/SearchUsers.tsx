import { useEffect, useRef, useState } from "react";
import { useMakeRequest } from "../customHooks";
import axios from "axios";
import { AppUser } from "~/srcs/types";
import { UseQueryResult } from "@tanstack/react-query";
import { SearchIcon } from "./SideNavBar";
import { Avatar } from "./UiKit";
import { publicUri } from "../App";
import { Link } from "react-router-dom";

export default function SearchUsers({ hide }: { hide: () => void }) {
  const [result, setResult] = useState<AppUser[]>();
  const [input, setInput] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchQuery = useMakeRequest(["searchUsers", input], async () => {
    const res = await axios.get(`/api/users/search/${input}`);
    return res.data;
  }) as UseQueryResult<AppUser[], Error>;

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    if (!searchQuery.data || searchQuery.isFetching) {
      return;
    }
    setResult(searchQuery.data);
  }, [searchQuery.isError, searchQuery.data, searchQuery.isFetching]);

  useEffect(() => {
    if (input != "") {
      searchQuery.refetch();
    } else {
      setResult(undefined);
    }
  }, [input]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        if (containerRef.current && wrapperRef.current) {
          containerRef.current.style.opacity = "0";
          wrapperRef.current.style.transform = "scale(0.9)";
        }
        setTimeout(() => {
          hide();
          document.body.style.overflow = "unset";
        }, 500);
      }
    };
    addEventListener("mouseup", handler);
    return () => removeEventListener("mouseup", handler);
  }, [wrapperRef]);

  return (
    <div
      ref={containerRef}
      style={{
        transition: "opacity 0.5s cubic-bezier(0.7, -0.0, 0, 1)",
      }}
      className="fixed left-0 top-0 z-[100] flex h-full w-full animate-modalFadeIn items-start justify-center overflow-scroll bg-black bg-opacity-50 px-10 py-20 opacity-100 backdrop-blur-3xl"
    >
      <div
        ref={wrapperRef}
        style={{
          transition: "transform 0.5s cubic-bezier(0.7, -0.0, 0, 1)",
        }}
        className="flex w-[600px] scale-100 flex-col justify-start gap-5"
      >
        <div className="sticky top-0 flex animate-scalein items-center">
          <div className="absolute left-[25px] z-10">
            <SearchIcon size={15} />
          </div>

          <input
            autoFocus
            className="w-full rounded-2xl border border-[rgba(255,255,255,0.15)] bg-black bg-opacity-50 px-10 py-5 pl-[50px] outline-none backdrop-blur-2xl"
            value={input}
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          ></input>
        </div>

        {result && (
          <div className="flex w-full flex-col divide-y divide-white divide-opacity-10">
            {result?.map((user) => {
              return <SearchResultItem user={user} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const SearchResultItem = ({ user }: { user: AppUser }) => {
  return (
    <Link to={`/${user.username}`}>
      <div className="flex items-center gap-3 py-3">
        <Avatar imgUrl={publicUri(user.profilePictureUrl)} size="md" />

        <div className="flex flex-col">
          <span className="font-extrabold">{user.username}</span>
        </div>
      </div>
    </Link>
  );
};
