import { Dispatch, SetStateAction } from "react";
import { NewUser } from "~/srcs/types";

export type loginUserType = {
  data?: NewUser;
  errors?: InputErrorsType;
};

export type InputErrorsType = {
  username?: string;
  password?: string;
  request?: string;
};

export interface UnidentifiedUserContextType {
  user: NewUser | undefined;
  setUser: Dispatch<SetStateAction<NewUser | undefined>>;
}

export interface CurrUserContextType {
  user: NewUser;
  setUser: Dispatch<SetStateAction<NewUser | undefined>>;
}

export type JoinNavigationProps = {
  navigation: {
    goBack: () => void;
    moveOn: () => void;
  };
};
