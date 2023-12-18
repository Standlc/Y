import {
  ActionFunctionArgs,
  Form,
  Link,
  useActionData,
  useNavigate,
  useNavigation,
  useOutletContext,
} from "react-router-dom";
import { Button, Icon, Input } from "../components/UiKit";
import { ChevronRight } from "@mui/icons-material";
import { UnidentifiedUserContextType, loginUserType } from "../types";
import axios from "axios";
import { useEffect } from "react";

export const submitUser = async ({
  request,
}: ActionFunctionArgs): Promise<loginUserType> => {
  const form = await request.formData();
  const f = Object.fromEntries(form);

  if (!f.username || f.username == "") {
    return { errors: { username: "You must provide a username" } };
  }

  if (!f.password || f.password == "") {
    return { errors: { password: "You must provide a password" } };
  }

  const res = await axios
    .post("/api/auth/login", {
      username: f.username,
      password: f.password,
    })
    .then<loginUserType>((res) => {
      return {
        data: res.data,
      };
    })
    .catch<loginUserType>((err) => {
      if (err.response?.status == 404) {
        return {
          errors: {
            username: "The username you entered isn't connected to an account",
          },
        };
      }
      if (err.response?.status == 401) {
        return {
          errors: {
            password: "The password you've entered is incorrect",
          },
        };
      }
      return {};
    });
  return res;
};

export default function Login() {
  const actionData = useActionData() as loginUserType | undefined;
  const { setUser } = useOutletContext<UnidentifiedUserContextType>();
  const navigate = useNavigate();
  const navigation = useNavigation();

  useEffect(() => {
    if (actionData?.data) {
      // @ts-expect-error
      setUser(actionData?.data);
      navigate("/");
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      className="flex w-[400px] flex-col justify-center space-y-5 p-5"
    >
      <h2 className="mb-5 text-4xl font-bold">Login</h2>

      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <Input name="username" placeholder="Username" autoFocus={true} />
          {actionData?.errors?.username && (
            <span className="text-sm text-red-800">
              {actionData?.errors?.username}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <Input name="password" type="password" placeholder="Password" />
          {actionData?.errors?.password && (
            <span className="text-sm text-red-800">
              {actionData?.errors?.password}
            </span>
          )}
        </div>

        <Button type="submit" isLoading={navigation.state == "submitting"}>
          Login
        </Button>
      </div>

      <div className="flex items-center justify-end gap-x-3 text-center text-sm">
        <span className="opacity-50">Don't have an account?</span>
        <Link className="group flex items-center text-white" to={"/join"}>
          <span className="mr-2">Join</span>
          <Icon IconRef={ChevronRight} size="sm" />
        </Link>
      </div>
    </Form>
  );
}
