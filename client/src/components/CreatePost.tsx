import CloseIcon from "@mui/icons-material/Close";
import { useContext, useEffect, useRef, useState } from "react";
import TextArea from "./TextArea";
import { Avatar, Icon, Button } from "./UiKit";
import { AppPost, AppUser, NewPost, NewReply } from "~/srcs/types";
import { PostModalContext, StatusPopupContext } from "./Layouts";
import { publicUri, timingFunction } from "../App";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import { useMakeRequest } from "../customHooks";
import axios from "axios";
import { UseQueryResult } from "@tanstack/react-query";

export default function ({ user }: { user: AppUser }) {
  const modal = useContext(PostModalContext);
  const { setStatusData } = useContext(StatusPopupContext);
  const [newPost, setNewPost] = useState<NewPost>({
    caption: "",
  });
  const [file, setFile] = useState<File | undefined>(undefined);
  const modalRef = useRef<HTMLDivElement>(null);

  const postQuery = useMakeRequest(
    ["createPost", newPost.caption, newPost.photoUrl, file],
    async () => {
      if (newPost.caption == "" && !file) {
        return null;
      }

      if (file) {
        newPost.photoUrl = await uploadImgFile();
      }

      let res;
      if (modal.targetId != undefined) {
        const newReply: NewReply = {
          ...newPost,
          replyTargetId: modal.targetId,
        };
        console.log(modal.targetId);
        res = await axios.post(`/api/reply`, newReply);
      } else {
        res = await axios.post("/api/posts", newPost);
      }

      return res.data;
    },
  ) as UseQueryResult<AppPost | null, Error>;

  const uploadImgFile = async () => {
    if (!file) {
      return;
    }
    const data = new FormData();
    data.append("file", file);
    const res = await axios.post("/api/upload", data);
    return res.data;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!modalRef.current || modal.isHidding) {
        return;
      }
      if (!modalRef.current.contains(e.target as Node)) {
        modal.hide();
      }
    };

    addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, [modalRef, modal.isHidding]);

  useEffect(() => {
    const handler = (e: any) => {
      if (!e.metaKey || e.key !== "Enter") {
        return;
      }
      postQuery.refetch();
    };
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (postQuery.isError) {
      setStatusData({
        title: "An error occured",
        isSuccess: false,
      });
      modal.hide();
    }
    if (postQuery.isFetching || !postQuery.data) {
      return;
    }
    modal.finish(postQuery.data);
    modal.hide();
  }, [postQuery.isFetching, postQuery.data, postQuery.isError]);

  return (
    <div
      id="post-create-wrapper"
      style={{
        transition: `opacity 0.5s ${timingFunction}`,
      }}
      className="fixed left-0 top-0 z-20 flex h-full max-h-full w-full justify-center opacity-0 [background:linear-gradient(180deg,rgba(40,46,105,0)_60%,rgba(0,0,0,1)_100%)]"
    >
      <div
        id="post-modal"
        ref={modalRef}
        style={{
          transition: `opacity 0.5s ${timingFunction}, height 0.5s ${timingFunction}, width 0.5s ${timingFunction}, left 0.5s ${timingFunction}, top 0.5s ${timingFunction}, transform 0.5s ${timingFunction}`,
        }}
        className="absolute bottom-[50px] flex max-h-[calc(100%-100px)] w-[650px] flex-col gap-5 overflow-scroll rounded-3xl border border-[rgba(255,255,255,0.25)] bg-black bg-opacity-50 backdrop-blur-3xl will-change-auto [box-shadow:0_20px_100px_rgba(255,255,255,0.2),0_1px_10px_rgba(255,255,255,0.15)]"
      >
        <div id="post-dd" className="flex items-start gap-3 p-4">
          <div className="sticky top-4 flex items-start">
            <Avatar imgUrl={publicUri(user.profilePictureUrl)} size="md" />
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full items-center py-3">
              <TextArea
                placeholder="What's going on?!"
                value={newPost.caption ?? ""}
                onChange={(e) =>
                  setNewPost({ ...newPost, caption: e.target.value })
                }
              />
            </div>
            <ImageViewer file={file} setFile={setFile} />
          </div>

          <div className="sticky bottom-4 flex items-center gap-3 self-end p-[2px]">
            <ImageSelector setFile={setFile} />
            <Button
              isLoading={postQuery.isFetching}
              id="post-modal-btn"
              variant="secondary"
              style={{
                backgroundColor: "white",
                color: "black",
                padding: "5px 30px 5px 30px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => {
                postQuery.refetch();
              }}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ImageViewer = ({
  file,
  setFile,
}: {
  file: File | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}) => {
  if (!file) {
    return null;
  }

  return (
    <div className="relative">
      <img
        src={URL.createObjectURL(file)}
        alt=""
        className="max-h-[600px] w-full overflow-hidden rounded-xl border border-border_s object-contain"
      />
      <div
        onClick={() => setFile(undefined)}
        className="absolute right-3 top-3 flex aspect-square h-[35px] cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-40 backdrop-blur-md"
      >
        <CloseIcon fontSize={"small"} />
      </div>
    </div>
  );
};

const ImageSelector = ({
  setFile,
}: {
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}) => {
  return (
    <label
      className="flex cursor-pointer items-center gap-2"
      htmlFor="img-input"
    >
      <input
        className="absolute hidden h-full w-full"
        type="file"
        hidden
        id="img-input"
        accept=".jpeg, .png, .jpg"
        onChange={(e) =>
          setFile(e.target.files ? e.target.files[0] : undefined)
        }
      />
      <div className="group">
        <Icon
          style={{ borderRadius: "100px", opacity: 0.5 }}
          IconRef={InsertPhotoOutlinedIcon}
          size="md"
          iconFontSize={20}
        />
      </div>
    </label>
  );
};
