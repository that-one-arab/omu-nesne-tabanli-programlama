import { create } from "zustand";

interface ISetUserFields {
  id: string | number;
  email: string;
  name: string;
  username: string;
}

type TUserProfileStore = {
  id: string | number;
  email: string;
  name: string;
  username: string;
  setUser: (fields: ISetUserFields) => void;
  clearUser: () => void;
};

const useUserProfileStore = create<TUserProfileStore>((set) => ({
  id: "",
  email: "",
  name: "",
  username: "",
  setUser: ({ id, email, name, username }: ISetUserFields) =>
    set(() => ({
      id,
      name,
      email,
      username,
    })),
  clearUser: () =>
    set(() => ({
      id: "",
      name: "",
      email: "",
      username: "",
    })),
}));

export default useUserProfileStore;
