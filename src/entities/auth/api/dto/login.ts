import type { User } from "../../model/user";

export type AuthBody = {
  username: string;
  password: string;
};

export type LoginRes = {
  access_token: string;
  token_type: string;
};

export type RegisterRes = User;
