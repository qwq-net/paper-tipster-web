import { signIn } from '@/shared/config/auth';
import { Button } from '@/shared/ui';

export function LoginButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('discord', { redirectTo: '/mypage' });
      }}
    >
      <Button type="submit" className="bg-[#5865F2] text-white hover:bg-[#4752C4]">
        Discordでログイン
      </Button>
    </form>
  );
}
