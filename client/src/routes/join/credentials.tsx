import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, Icon, Input } from "../../components/UiKit";
import { useContext, useState } from "react";
import { InputErrorsType, JoinNavigationProps } from "../../types";
import { UnisignedUserContext } from "./join";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function JoinCredentials({ navigation }: JoinNavigationProps) {
  const { unsignedUser, setUnsignedUser } = useContext(UnisignedUserContext);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<InputErrorsType>({});

  const verifyUsernameUnicity = async () => {
    const res = await axios.get(`/api/auth/unicity/${unsignedUser.username}`);
    return res.data;
  };

  const { refetch, isFetching } = useQuery({
    queryKey: ["checkUsernameUnicity", unsignedUser.username],
    queryFn: verifyUsernameUnicity,
    refetchOnWindowFocus: false,
    enabled: false,
    retry: false,
  });

  const verifyDataAndMoveOn = async () => {
    let inputErrors: InputErrorsType | undefined = undefined;

    if (!unsignedUser.username || unsignedUser.username == "") {
      inputErrors = { username: "You must provide a username" };
      focusInput("username");
    } else if (!unsignedUser.password || unsignedUser.password.length < 3) {
      inputErrors = {
        password: "Your password must be at least 3 characters long",
      };
      focusInput("password");
    }

    if (inputErrors) {
      setErrors(inputErrors);
      return;
    }

    const { error } = await refetch();
    if (error) {
      inputErrors = { username: "This user aldready exists" };
      focusInput("username");
      setErrors(inputErrors);
      return;
    }

    navigation.moveOn();
  };

  const focusInput = (inputId: string) => {
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
      inputEl.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnsignedUser({ ...unsignedUser, [e.target.name]: e.target.value });
  };

  // const [hey, setHey] = useState(false);

  return (
    <div className="flex flex-col justify-center gap-5">
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <Input
            disabled={isFetching}
            id="username"
            name="username"
            placeholder="Your username"
            autoFocus={true}
            autoComplete="none"
            type="text"
            value={unsignedUser["username"]}
            onChange={handleInputChange}
          />
          {errors.username && (
            <span className="text-sm text-red-800">{errors.username}</span>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="relative flex flex-col justify-center gap-y-2">
            <Input
              disabled={isFetching}
              id="password"
              name="password"
              placeholder="Your super secret password"
              type={!isPasswordVisible ? "password" : undefined}
              value={unsignedUser["password"]}
              onChange={handleInputChange}
            />
            <div
              className="group absolute right-4 cursor-pointer"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Icon
                IconRef={
                  !isPasswordVisible ? RemoveRedEyeIcon : VisibilityOffIcon
                }
                size="sm"
                iconFontSize={13}
              />
            </div>
          </div>
          {errors.password && (
            <span className="text-sm text-red-800">{errors.password}</span>
          )}
        </div>

        <Button
          isLoading={isFetching}
          onClick={(e) => {
            e.preventDefault();
            // setHey(!hey);
            verifyDataAndMoveOn();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
