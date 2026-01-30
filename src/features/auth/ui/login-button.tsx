import { signIn } from "@/shared/config/auth";
import { Button } from "@/shared/ui";

export function LoginButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirectTo: "/mypage" });
      }}
    >
      <Button type="submit">Login with Discord</Button>
    </form>
  );
}
