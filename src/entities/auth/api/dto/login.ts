export type LoginBody = {
  username: string;
  password: string;
};

export type LoginRes = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  image: string;
  accessToken: string;
  refreshToken: string;
};
