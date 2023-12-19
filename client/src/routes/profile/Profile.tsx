import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { AppPost, AppProfile } from "~/srcs/types";
import { Avatar, Button } from "../../components/UiKit";
import { publicUri } from "../../App";
import Post from "../feed/Post";
import { DateTime } from "luxon";
import { CurrUserContextType } from "../../types";
import { Link } from "react-router-dom";
import { useMakeRequest } from "../../customHooks";
import { StatusPopupContext } from "../../components/Layouts";
import InfiniteSlotMachine from "../../components/InfiniteSlotMachine";

export default function Profile() {
  const { username } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ["profile", username],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get<AppProfile>(`/api/users/profile/${username}`);
      return res.data;
    },
  });

  if (isPending) {
    return null;
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-3xl font-extrabold">
          Oops, nothing to see here :/
        </h1>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 py-[55px]">
      <div className="flex w-[600px] flex-col">
        <Header data={data} />
        <OtherUserProfile data={data} />
        <ProfileFeed profile={data} />
      </div>
    </div>
  );
}

const Header = ({ data }: { data: AppProfile }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ ...data });

  return (
    <div className="fixed top-0 z-50 flex items-center justify-between py-3">
      <div className="flex items-center gap-5">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <ArrowBackIcon />
        </div>
        <div className="h-[30px] w-[1px] bg-white opacity-10"></div>
        <span className="text-lg font-extrabold">@{profile.username}</span>
      </div>
    </div>
  );
};

const OtherUserProfile = ({ data }: { data: AppProfile }) => {
  const { user } = useOutletContext<CurrUserContextType>();
  const { username } = useParams();
  const isUserProfile = user.username == username;
  const [followersCount, setFollowersCount] = useState(data.followers ?? 0);

  const { setStatusData } = useContext(StatusPopupContext);
  const [profile, setProfile] = useState({ ...data });

  const followQuery = useMakeRequest(["follow", profile.id], async () => {
    const res = await axios.post(`/api/following/${profile.id}`);
    setStatusData({
      title: "User was followed",
      isSuccess: true,
    });
    setFollowersCount(followersCount + 1);
    setProfile({ ...profile, isUserFollowedByUser: 1 });
    return res.data;
  });

  const unfollowQuery = useMakeRequest(["unfollow", profile.id], async () => {
    const res = await axios.delete(`/api/following/${profile.id}`);
    setStatusData({
      title: "User was unfollowed",
      isSuccess: true,
    });
    setFollowersCount(followersCount - 1);
    setProfile({ ...profile, isUserFollowedByUser: 0 });
    return res.data;
  });

  useEffect(() => {
    if (followQuery.isError) {
      setStatusData({
        title: "User could not be followed",
        isSuccess: false,
      });
    }
  }, [followQuery.isError]);

  useEffect(() => {
    if (unfollowQuery.isError) {
      setStatusData({
        title: "User could not be unfollowed",
        isSuccess: false,
      });
    }
  }, [unfollowQuery.isError]);

  return (
    <div
      style={{ borderBottom: "solid 1px rgba(255,255,255,0.2)" }}
      className="flex flex-col gap-10 py-10"
    >
      <div className="flex w-full items-start gap-10">
        <Avatar imgUrl={publicUri(profile.profilePictureUrl)} size="xl" />

        <div className="flex flex-1 flex-col items-start gap-3">
          <div className="flex w-full items-start justify-between gap-5">
            <h1 className="flex flex-col gap-1 text-left text-3xl font-extrabold leading-none">
              {profile.username}
              <span className="text-sm font-normal opacity-50">
                Joined{" "}
                {DateTime.fromISO(
                  profile.createdAt as unknown as string,
                ).toRelative()}
              </span>
            </h1>
            {!isUserProfile && (
              <Button
                variant={profile.isUserFollowedByUser ? "outlined" : "primary"}
                onClick={(e) => {
                  e.preventDefault();
                  profile.isUserFollowedByUser
                    ? unfollowQuery.refetch()
                    : followQuery.refetch();
                }}
              >
                {profile.isUserFollowedByUser ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          {profile.bio && (
            <span className="text-start opacity-90 [font-weight:500]">
              {profile.bio}
            </span>
          )}
          <div className="flex w-full items-center justify-start gap-2">
            <span className="flex gap-1 rounded-md text-md font-extrabold text-white">
              {profile.postsCount}
              <span className="text-md font-normal opacity-60">Posts</span>
            </span>
            •
            <span className="flex gap-1 rounded-md text-md font-extrabold text-white">
              {profile.followings}
              <span className="text-md font-normal opacity-60">Following</span>
            </span>
            •
            <span className="flex gap-1 rounded-md text-md font-extrabold text-white">
              <InfiniteSlotMachine state={followersCount} />
              <span className="text-md font-normal opacity-60">Followers</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileFeed = ({ profile }: { profile: AppProfile }) => {
  const { setStatusData } = useContext(StatusPopupContext);
  const { username } = useParams();

  const [posts, setPosts] = useState<AppPost[] | undefined>(undefined);
  const postQuery = useQuery({
    queryKey: ["profilePosts", username],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get<AppPost[]>(`/api/posts/all/${profile.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (postQuery.isError) {
      setStatusData({
        title: "Could not get the user's feed",
        isSuccess: false,
      });
    }

    if (postQuery.isPending || !postQuery.data) {
      return;
    }
    setPosts(postQuery.data);
  }, [postQuery.isPending, postQuery.data, postQuery.isError]);

  if (postQuery.isPending) {
    return null;
  }

  if (!posts) {
    return null;
  }

  if (posts && !posts.length) {
    return <div>Not posts yet</div>;
  }

  return (
    <div className="mt-5 flex flex-col gap-4 divide-y-[1px] divide-white divide-opacity-10">
      {posts?.map((post) => {
        return <Post key={post.id} post={post} />;
      })}
    </div>
  );
};
