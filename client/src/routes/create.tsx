import { Form, useNavigate, useOutletContext } from "react-router-dom";
import { useMakeRequest } from "../customHooks";
import { useEffect, useState } from "react";
import { CurrUserContextType } from "../types";
import { NewPost } from "~/srcs/types";
import axios from "axios";

export default function Create() {
  const navigate = useNavigate();
  const { user } = useOutletContext<CurrUserContextType>();
  const [imgFile, setImgFile] = useState<File>();
  const [post, setPost] = useState<NewPost>({
    authorId: user.id as number,
    caption: "",
  });

  const { isFetching, isPending, refetch, isError, error } = useMakeRequest(
    ["createPost"],
    async () => {
      if (imgFile) {
        post.photoUrl = await uploadImgFile();
      }

      console.log(post.caption);
      const res = await axios.post("/api/posts/create", post);
      return res.data;
      //   return null;
    },
  );

  const uploadImgFile = async () => {
    if (!imgFile) {
      return;
    }

    const data = new FormData();
    data.append("file", imgFile);
    const res = await axios.post("/api/upload", data);
    return res.data;
  };

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (isError) {
      console.log(error);
      return;
    }
    // navigate("/");
  }, [isFetching, isError, isPending]);

  return (
    <Form method="post" className="flex flex-col gap-5">
      <textarea
        name="caption"
        onChange={(e) => setPost({ ...post, caption: e.target.value })}
      />
      <input
        type="file"
        name=""
        onChange={(e) =>
          setImgFile(e.target.files ? e.target.files[0] : undefined)
        }
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          refetch();
        }}
      >
        Upload
      </button>
    </Form>
  );
}
