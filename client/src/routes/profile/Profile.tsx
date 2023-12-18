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

export default function Profile() {
  const { username } = useParams();
  const { user } = useOutletContext<CurrUserContextType>();

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
    <div className="flex w-full flex-col items-center gap-5 pb-5">
      <div className="flex w-[600px] flex-col gap-10">
        <Header data={data} />
        {data.id == user.id ? (
          <CurrUserProfile data={data} />
        ) : (
          <OtherUserProfile data={data} />
        )}
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

const CurrUserProfile = ({ data }: { data: AppProfile }) => {
  const { user } = useOutletContext<CurrUserContextType>();
  const [profile, setProfile] = useState({ ...data });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex w-full items-center gap-10">
        <Avatar imgUrl={publicUri(profile.profilePictureUrl)} size="2xl" />

        <div className="flex flex-col items-start gap-[10px] py-5">
          <h1 className="text-4xl font-extrabold">{profile.username}</h1>
          <span className="text-sm font-normal opacity-50">
            Joined{" "}
            {DateTime.fromISO(
              profile.createdAt as unknown as string,
            ).toRelative()}
          </span>

          {profile.bio && (
            <span className="text-start opacity-90 [font-weight:500]">
              {profile.bio}
            </span>
          )}

          <div className="flex w-full items-center justify-start gap-5">
            <span className="text-lg font-bold">
              {profile.postsCount}
              <span className="text-sm font-normal opacity-50"> Posts</span>
            </span>
            <span className="text-lg font-bold">
              {profile.followings}
              <span className="text-sm font-normal opacity-50"> Following</span>
            </span>
            <span className="text-lg font-bold">
              {profile.followers}
              <span className="text-sm font-normal opacity-50"> Followers</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-2">
        <Link to={`${user.username}/edit`} className="flex w-full">
          <Button style={{ flex: 1, borderRadius: 10 }} variant="monochrome">
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
};

const OtherUserProfile = ({ data }: { data: AppProfile }) => {
  const { setStatusData } = useContext(StatusPopupContext);
  const [profile, setProfile] = useState({ ...data });

  const followQuery = useMakeRequest(["follow", profile.id], async () => {
    const res = await axios.post(`/api/following/${profile.id}`);
    setStatusData({
      title: "User was followed",
      isSuccess: true,
    });
    setProfile({ ...profile, isUserFollowedByUser: 1 });
    return res.data;
  });

  const unfollowQuery = useMakeRequest(["unfollow", profile.id], async () => {
    const res = await axios.delete(`/api/following/${profile.id}`);
    setStatusData({
      title: "User was unfollowed",
      isSuccess: true,
    });
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
    <div className="flex flex-col gap-10">
      <div className="flex w-full items-center gap-10">
        <Avatar imgUrl={publicUri(profile.profilePictureUrl)} size="2xl" />

        <div className="flex flex-1 flex-col items-start gap-5">
          <h1 className="text-4xl font-extrabold leading-none">
            {profile.username}
          </h1>
          <span className="-mt-2 text-sm font-normal opacity-50">
            Joined{" "}
            {DateTime.fromISO(
              profile.createdAt as unknown as string,
            ).toRelative()}
          </span>

          {profile.bio && (
            <span className="text-start opacity-90 [font-weight:500]">
              {profile.bio}
            </span>
          )}
          <div className="flex w-full items-center justify-start gap-1">
            <span className="flex-1 rounded-md bg-white bg-opacity-[3%] py-2 text-lg font-bold">
              {profile.postsCount}
              <span className="text-sm opacity-90"> Posts</span>
            </span>
            <span className="flex-1 rounded-md bg-white bg-opacity-[3%] py-2 text-lg font-bold">
              {profile.followings}
              <span className="text-sm opacity-90"> Following</span>
            </span>
            <span className="flex-1 rounded-md bg-white bg-opacity-[3%] py-2 text-lg font-bold">
              {profile.followers}
              <span className="text-sm opacity-90"> Followers</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-0 flex w-full gap-2">
        <Button
          onClick={(e) => {
            e.preventDefault();
            profile.isUserFollowedByUser
              ? unfollowQuery.refetch()
              : followQuery.refetch();
          }}
          style={{ flex: 1, borderRadius: 10 }}
          variant="secondary"
        >
          {profile.isUserFollowedByUser ? "Unfollow" : "Follow"}
        </Button>
        <Button style={{ flex: 1, borderRadius: 10 }} variant="monochrome">
          Message
        </Button>
      </div>
    </div>
  );
};

const ProfileFeed = ({ profile }: { profile: AppProfile }) => {
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
    if (postQuery.isPending || !postQuery.data) {
      return;
    }
    console.log(postQuery.data);
    setPosts(postQuery.data);
  }, [postQuery.isPending, postQuery.data]);

  if (postQuery.isPending) {
    return null;
  }

  if (!posts) {
    return <div>Not posts yet</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      {posts?.map((post) => {
        return <Post key={post.id} post={post} />;
      })}
    </div>
  );
};
