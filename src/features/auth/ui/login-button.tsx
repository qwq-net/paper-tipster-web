import { discordSignIn } from '@/features/auth/actions/auth-actions';
import { Button } from '@/shared/ui';

export function LoginButton() {
  return (
    <form action={discordSignIn}>
      <Button type="submit" className="bg-[#5865F2] text-white hover:bg-[#4752C4]">
        Discordでログイン
      </Button>
    </form>
  );
}
