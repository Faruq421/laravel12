import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { PropsWithChildren } from 'react';
import { User } from '@/types';

type AuthenticatedLayoutProps = PropsWithChildren<{
    user: User;
}>;

export function AuthenticatedLayout({ user, children }: AuthenticatedLayoutProps) {
    return (
        <AppShell
            header={<AppHeader user={user} />}
            sidebar={<AppSidebar />}
        >
            {children}
        </AppShell>
    );
}
