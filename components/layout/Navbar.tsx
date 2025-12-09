'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { useLogout } from '@/lib/hooks/useAuth';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
    const logout = useLogout();

    const handleLogout = async () => {
        await logout.mutateAsync();
        router.push('/auth/signin');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-white dark:bg-zinc-900 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-blue-600">
                            News App
                        </Link>

                        <div className="flex gap-4">
                            <Link
                                href="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                Home
                            </Link>

                            {isAuthenticated && (
                                <>
                                    <Link
                                        href="/news/create"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/news/create')
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        Create News
                                    </Link>

                                    <Link
                                        href="/news/my-news"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/news/my-news')
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        My News
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {currentUser?.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/signin"
                                    className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium rounded-md transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
