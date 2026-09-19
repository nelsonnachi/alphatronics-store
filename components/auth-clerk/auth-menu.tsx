"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Loader2, UserRound } from "lucide-react";

export function AuthMenu() {
  return (
    <>
      {/* While Clerk is loading, keep the layout from jumping */}
      <ClerkLoading>
        <div className="flex size-5 items-center justify-center">
          <Loader2 className="size-4 animate-spin text-slate-400" />
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        {/* Signed out: the user icon opens the sign-in modal */}
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button
              type="button"
              aria-label="Sign in or create an account"
              className="group flex items-center justify-center"
            >
              <UserRound className="size-5 text-slate-800 transition group-hover:text-blue-600" />
            </button>
          </SignInButton>
        </Show>

        {/* Signed in: avatar with Clerk's built-in dropdown
            (Manage account, Sign out) */}
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-7",
              },
            }}
          />
        </Show>
      </ClerkLoaded>
    </>
  );
}