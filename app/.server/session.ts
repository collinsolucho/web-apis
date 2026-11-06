import { createCookieSessionStorage } from "react-router";
import type { Session } from "react-router";

type ToastType = "success" | "error";

type SessionData = {
  // add other session fields here, e.g. userId: string;
};

type SessionFlashData = {
  toastMessage: { message: string; type: ToastType };
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: true,
    },
  });

export function setSuccessMessage(
  session: Session<SessionData, SessionFlashData>,
  message: string
): void {
  session.flash("toastMessage", { message, type: "success" });
}

export function setErrorMessage(
  session: Session<SessionData, SessionFlashData>,
  message: string
): void {
  session.flash("toastMessage", { message, type: "error" });
}

export { getSession, commitSession, destroySession };