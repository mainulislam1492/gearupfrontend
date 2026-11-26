import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md px-4 py-16">
      <RegisterForm />
    </div>
  );
}