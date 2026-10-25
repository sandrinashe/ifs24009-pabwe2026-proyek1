import { apiFetch } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export const login = (email: string, password: string) =>
  apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const register = (name: string, email: string, password: string) =>
  apiFetch<User>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

export const getMe = () => apiFetch<User>("/auth/me");
