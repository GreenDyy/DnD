export type User = {
  id: string;
  email: string;
  name: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};
