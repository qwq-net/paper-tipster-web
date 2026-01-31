import { signOut } from '@/shared/config/auth';
import { Button } from '@/shared/ui';

export function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}
    >
      <Button variant="secondary" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
