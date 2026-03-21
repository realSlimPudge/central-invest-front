import type { User } from "../../model/user";

export type LoginBody = {
  username: string;
  password: string;
};

export type LoginRes = User;
