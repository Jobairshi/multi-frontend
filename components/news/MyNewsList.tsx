'use client';

import { useMyNews, useDeleteNews } from '@/lib/hooks/useNews';
import Link from 'next/link';
import { useState } from 'react';

export default function MyNewsList() {
    const { data: news, isLoading, isError, error } = useMyNews();
    const deleteNews = useDeleteNews();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteNews.mutateAsync(id);
        } catch (error) {
            console.error('Failed to delete news:', error);
            alert('Failed to delete news article');
        } finally {
            setDeletingId(null);
        }
    };

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
                Error loading your news: {error?.message}
            </div>
        );
    }

    if (!news || news.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    You haven&apos;t created any news articles yet.
                </p>
                <Link
                    href="/news/create"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    Create Your First Article
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {news.map((article) => (
                <div
                    key={article.id}
                    className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6"
                >
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold flex-1">{article.title}</h3>
                        <div className="flex gap-2 ml-4">
                            <Link
                                href={`/news/${article.id}`}
                                className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                                View
                            </Link>
                            <button
                                onClick={() => handleDelete(article.id, article.title)}
                                disabled={deletingId === article.id}
                                className="text-sm px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                            >
                                {deletingId === article.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>

                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        {article.content}
                    </p>

                    <div className="flex justify-between items-center text-sm text-zinc-500">
                        <span>{article.views} views</span>
                        <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
