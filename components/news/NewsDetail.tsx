'use client';

import { useNewsDetail } from '@/lib/hooks/useNews';
import { useRouter } from 'next/navigation';

interface NewsDetailProps {
    id: string;
}

export default function NewsDetail({ id }: NewsDetailProps) {
    const { data: news, isLoading, isError, error } = useNewsDetail(id);
    const router = useRouter();

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

    if (!news) {
        return (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
                News article not found.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="mb-4 text-blue-600 hover:underline"
            >
                ← Back
            </button>

            <article className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold mb-4">{news.title}</h1>

                <div className="flex items-center gap-4 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                    <span>By {news.author}</span>
                    <span>•</span>
                    <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{news.views} views</span>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                        {news.content}
                    </p>
                </div>

                {news.updatedAt !== news.createdAt && (
                    <div className="mt-6 text-sm text-zinc-500">
                        Last updated: {new Date(news.updatedAt).toLocaleDateString()}
                    </div>
                )}
            </article>
        </div>
    );
}
