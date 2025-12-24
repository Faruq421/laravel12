import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { PropsWithChildren } from 'react';
import { User } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckoutHeader } from './partials/checkout-header';

type AuthenticatedLayoutProps = PropsWithChildren<{
    user: User;
}>;

export function AuthenticatedLayout({ user, children }: AuthenticatedLayoutProps) {
    const { component } = usePage();
    const isCheckoutPage = component.startsWith('Features/Order/Checkout');

    const renderHeader = () => {
        if (isCheckoutPage) {
            return <CheckoutHeader />;
        }
        if (user.role === 'admin') {
            return <AppHeader user={user} />;
        }
        return null;
    };

    const renderSidebar = () => {
        if (isCheckoutPage) {
            return null;
        }
        if (user.role === 'admin') {
            return <AppSidebar />;
        }
        return null;
    };

    return (
        <AppShell
            header={renderHeader()}
            sidebar={renderSidebar()}
        >
            {children}
        </AppShell>
    );
}
