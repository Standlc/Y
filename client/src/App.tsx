import { AppUser } from "~/srcs/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Login, { submitUser } from "./routes/login";
import Join, { submitNewUser } from "./routes/join/join";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import {
  LoadingLayout,
  PublicLayout,
  PrivateLayout,
} from "./components/Layouts";
import Feed from "./routes/feed/Feed";
import { useEffect, useState } from "react";
import Profile from "./routes/profile/Profile";
import PostPage from "./routes/PostPage";

export const timingFunction = "cubic-bezier(0.7, -0.0, 0, 1)";

export const publicUri = (resource: string | null | undefined) => {
  if (resource) {
    return `/public/${resource}`;
  }
  return null;
};

const authorizeUser = async () => {
  const res = await axios.get<AppUser>("/api/users/auth");
  return res.data;
};

function App() {
  const [user, setUser] = useState<AppUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { isPending, data } = useQuery({
    queryKey: ["user"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: authorizeUser,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
    setIsLoading(isPending);
  }, [data, isPending]);

  if (isLoading) {
    return <LoadingLayout />;
  }

  return (
    <RouterProvider
      router={createBrowserRouter(
        createRoutesFromElements(
          <>
            <Route element={<PrivateLayout context={{ user, setUser }} />}>
              <Route element={<Feed />} index={true} />
              <Route path=":username" element={<Profile />} />
              <Route path=":username/:postid" element={<PostPage />} />
            </Route>

            <Route element={<PublicLayout context={{ user, setUser }} />}>
              <Route path="login" element={<Login />} action={submitUser} />
              <Route path="join" element={<Join />} action={submitNewUser} />
            </Route>
          </>,
        ),
      )}
    />
  );
}

export default App;
