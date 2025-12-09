'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks/useAuth';
import { storage } from '@/lib/utils/storage';

/**
 * AuthInitializer Component
 * Automatically fetches current user data on app mount if token exists
 */
export default function AuthInitializer({
    children,
}: {
    children: React.ReactNode;
}) {
    const { refetch } = useCurrentUser();

    useEffect(() => {
        // Check if user has token and fetch user data
        if (storage.hasToken()) {
            refetch();
        }
    }, [refetch]);

    return <>{children}</>;
}
