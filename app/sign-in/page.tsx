import { FormLogin } from "@/components/form/form-login";

export default function SignIn() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <FormLogin />
      </div>
    </div>
  );
}
