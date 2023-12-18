import { Link } from "react-router-dom";
import { Dispatch, SetStateAction, createContext, useState } from "react";
import JoinCredentials from "./credentials";
import JoinProfile from "./profile";
import SubmitNewUser from "./submit";
import { ArrowButton, Icon } from "../../components/UiKit";
import { ChevronRight } from "@mui/icons-material";
import { NewUser } from "~/srcs/types";

export const submitNewUser = async ({ request }: { request: Request }) => {
  const form = await request.formData();
  const f = Object.fromEntries(form);

  if (!f.username || !f.password) {
    return;
  }

  return null;
};

const steps = [
  {
    title: "Create your account",
    component: JoinCredentials,
  },
  { title: "Say cheeese!", component: JoinProfile },
  { title: "You're all set 🥳", component: SubmitNewUser },
];

export default function Join() {
  const [unsignedUser, setUnsignedUser] = useState<NewUser>({
    username: "",
    password: "",
  });
  const [CurrForm, setCurrForm] = useState(steps[0]);
  const [imgFile, setImgFile] = useState<File | undefined>(undefined);
  const currFormIndex = steps.indexOf(CurrForm);

  const moveOn = () => {
    if (currFormIndex < steps.length) {
      setCurrForm(steps[currFormIndex + 1]);
    }
  };

  const goBack = () => {
    if (currFormIndex > 0) {
      setCurrForm(steps[currFormIndex - 1]);
    }
  };

  return (
    <UnisignedUserContext.Provider value={{ unsignedUser, setUnsignedUser }}>
      <ImgFileContext.Provider value={{ imgFile, setImgFile }}>
        <form className="flex w-[400px] flex-col justify-center gap-5 p-5">
          {CurrForm.title && (
            <h2 className="mb-5 text-4xl font-bold">{CurrForm.title}</h2>
          )}
          {currFormIndex > 0 && currFormIndex < steps.length && (
            <div className="flex justify-start">
              <ArrowButton onClick={goBack} dir="left">
                Oops, go back
              </ArrowButton>
            </div>
          )}

          <CurrForm.component navigation={{ goBack, moveOn }} />

          <div className="flex items-center justify-end gap-x-3 text-center text-sm">
            <span className="opacity-50">Already got an account?</span>
            <Link className="group flex items-center text-white" to={"/login"}>
              <span className="mr-2">Login</span>
              <Icon IconRef={ChevronRight} size="sm" />
            </Link>
          </div>
        </form>
      </ImgFileContext.Provider>
    </UnisignedUserContext.Provider>
  );
}

export interface UnisignedUserContextType {
  unsignedUser: NewUser;
  setUnsignedUser: Dispatch<SetStateAction<NewUser>>;
}

export const UnisignedUserContext = createContext<UnisignedUserContextType>(
  undefined as unknown as UnisignedUserContextType,
);

export interface ImgFileContextType {
  imgFile: File | undefined;
  setImgFile: Dispatch<SetStateAction<File | undefined>>;
}

export const ImgFileContext = createContext<ImgFileContextType>(
  undefined as unknown as ImgFileContextType,
);

{
  /* <button
  style={{
    transition: "all",
    transform: `translate(${style}px, 0)`,
  }}
  onClick={(e) => {
    e.preventDefault();
    document.startViewTransition(() => navigate("/login"));
  }}
>
  transistion
</button> */
}
