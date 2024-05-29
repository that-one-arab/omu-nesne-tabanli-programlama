import { TLoginApiResponse } from "@/util/api";
import useUserProfileStore from "@/util/store/user";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

export function useUser() {
  const cookies = new Cookies(null, { path: "/" });

  const user = useUserProfileStore();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
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
  };
}
