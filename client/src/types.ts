import { Dispatch, SetStateAction } from "react";
import { AppUser, NewUser } from "~/srcs/types";

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
  user: AppUser | undefined;
  setUser: Dispatch<SetStateAction<AppUser | undefined>>;
}

export interface CurrUserContextType {
  user: AppUser;
  setUser: Dispatch<SetStateAction<AppUser | undefined>>;
}

export type JoinNavigationProps = {
  navigation: {
    goBack: () => void;
    moveOn: () => void;
  };
};

export type MoreMenuType = {
  title: string;
  action: () => any | void;
  theme?: "red" | "blue" | "green" | "base";
};

export type StatusDataType = {
  title: string | undefined;
  isSuccess: boolean;
};

export type ClientRect = {
  width: number;
  height: number;
  top: number;
  left: number;
};
