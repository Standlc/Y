import { Avatar, Button } from "../../components/UiKit";
import { useContext } from "react";
import { ImgFileContext, UnisignedUserContext } from "./join";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useOutletContext } from "react-router";
import { AppUser, NewUser } from "~/srcs/types";

export default function SubmitNewUser({
  navigation,
}: {
  navigation: {
    goBack: () => void;
    moveOn: () => void;
  };
}) {
  const { unsignedUser } = useContext(UnisignedUserContext);
  const { imgFile } = useContext(ImgFileContext);
  const { setUser } = useOutletContext<{
    setUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>;
  }>();

  const submit = async () => {
    if (imgFile) {
      const filename = await uploadImgFile();
      unsignedUser.profilePictureUrl = filename;
    }
    const res = await axios.post<AppUser>("/api/auth/register", unsignedUser);
    setUser(res.data);
    return res.data;
  };

  const { refetch, isFetching } = useQuery({
    queryKey: ["newUserJoin"],
    queryFn: submit,
    refetchOnWindowFocus: false,
    enabled: false,
    retry: false,
  });

  const uploadImgFile = async () => {
    if (!imgFile) {
      return;
    }

    const data = new FormData();
    data.append("file", imgFile);
    const res = await axios.post("/api/upload", data);
    return res.data;
  };

  return (
    <div className="flex flex-col justify-center gap-5">
      <div className="flex items-center rounded-lg border border-border_s bg-bg_secondary px-3 py-3 text-base">
        <Avatar
          imgUrl={imgFile ? URL.createObjectURL(imgFile) : null}
          size="sm"
        />
        <span className="ml-3 font-bold">{unsignedUser.username}</span>
      </div>
      <Button
        isLoading={isFetching}
        onClick={(e) => {
          e.preventDefault();
          refetch();
        }}
      >
        Let's go!
      </Button>
    </div>
  );
}
