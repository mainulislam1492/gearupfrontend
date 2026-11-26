import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}