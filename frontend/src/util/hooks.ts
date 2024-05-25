import { TLoginApiResponse } from "@/util/api";
import useUserProfileStore from "@/util/store/user";
import Cookies from "universal-cookie";

export function useUser() {
  const cookies = new Cookies(null, { path: "/" });

  const user = useUserProfileStore();

  return {
    setUser: (userData: TLoginApiResponse) => {
      cookies.set("token", userData.token);

      user.setUser({
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
      });
    },
    clearUser: () => {
      cookies.remove("token");
      user.clearUser();
    },
    user: user,
  };
}
