'use client';

import AccountProvider from "../contexts/account"

export function Providers({ children }: any) {

    return (
        <AccountProvider>
            {children}
        </AccountProvider>
    )
}