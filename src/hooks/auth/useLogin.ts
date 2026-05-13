// src/hooks/useLogin.ts
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export type LoginInput = {
  username: string;
  password: string;
};

export type LoginResult = void;

export function useLogin(): UseMutationResult<
  LoginResult,
  unknown,
  LoginInput,
  unknown
> {
  console.log("useLogin");
  const auth = useContext(AuthContext);
  
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      await auth.login(input.username, input.password);
      return;
    },
    onError: (err) => {
      console.error("useLogin error", err);
    },
  });
}
