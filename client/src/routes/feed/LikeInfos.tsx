import { AppPost } from "~/srcs/types";
import { useMakeRequest } from "../../customHooks";
import { useEffect, useState } from "react";
import axios from "axios";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { PostInteraction } from "./Post";

const LikeInfos = ({ post }: { post: AppPost }) => {
  const [likeCount, setLikeCount] = useState(post.likesCount ?? 0);
  const [isLikedByUser, setIsLikedByUser] = useState(
    post.isPostLikedByUser ?? 0,
  );

  const likeQuery = useMakeRequest(["likePost", post.id], async () => {
    const res = await axios.post(`/api/like/${post.id}`);
    return res.data;
  });

  const unlikeQuery = useMakeRequest(["unlikePost", post.id], async () => {
    const res = await axios.post(`/api/like/undo/${post.id}`);
    return res.data;
  });

  useEffect(() => {
    setLikeCount(post.likesCount ?? 0);
    setIsLikedByUser(post.isPostLikedByUser ?? 0);
  }, [post.likesCount, post.isPostLikedByUser]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <PostInteraction
      style={{
        color: isLikedByUser ? "rgb(190,24,93)" : "",
      }}
      value={likeCount}
      onClick={handleLikePost}
      variant="pink"
      IconRef={isLikedByUser ? FavoriteIcon : FavoriteBorderIcon}
    />
  );
};

export default LikeInfos;
