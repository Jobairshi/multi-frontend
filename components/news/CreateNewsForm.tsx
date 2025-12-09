'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateNews } from '@/lib/hooks/useNews';
import { useAppSelector } from '@/lib/store/hooks';

export default function CreateNewsForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter();
    const createNews = useCreateNews();
    const currentUser = useAppSelector((state) => state.user.currentUser);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            alert('You must be logged in to create news');
            return;
        }

        try {
            await createNews.mutateAsync({
                title,
                content,
                author: currentUser.name,
            });
            router.push('/');
        } catch (error) {
            console.error('Failed to create news:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Create News Article</h2>

                {createNews.isError && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
                        {createNews.error?.message || 'Failed to create news'}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                            placeholder="Enter news title"
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium mb-2">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={10}
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                            placeholder="Write your news content here..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={createNews.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {createNews.isPending ? 'Creating...' : 'Create Article'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
