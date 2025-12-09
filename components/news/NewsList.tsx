'use client';

import { useNews } from '@/lib/hooks/useNews';
import Link from 'next/link';

export default function NewsList() {
    const { data: news, isLoading, isError, error } = useNews();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
                Error loading news: {error?.message}
            </div>
        );
    }

    if (!news || news.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
                No news articles found.
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
                <Link
                    key={article.id}
                    href={`/news/${article.id}`}
                    className="block bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {article.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                        {article.content}
                    </p>
                    <div className="flex justify-between items-center text-sm text-zinc-500">
                        <span>By {article.author}</span>
                        <span>{article.views} views</span>
                    </div>
                    <div className="mt-2 text-xs text-zinc-400">
                        {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                </Link>
            ))}
        </div>
    );
}
