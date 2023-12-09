import React from "react";
import { NewUser } from "~/srcs/types";

export interface UserContextType {
  user: NewUser;
  // setUser: React.Dispatch<React.SetStateAction<NewUser | null>>;
}

export const UserContext = React.createContext<UserContextType>(
  undefined as unknown as UserContextType
);
