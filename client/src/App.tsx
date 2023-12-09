import { NewUser } from "~/srcs/types";
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
import Feed from "./routes";
import { useEffect, useState } from "react";
import Create from "./routes/create";

const authorizeUser = async () => {
  const res = await axios.get<NewUser>("/api/users/auth");
  return res.data;
};

function App() {
  const [user, setUser] = useState<NewUser | undefined>(undefined);
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
              <Route path="create" element={<Create />} />
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
