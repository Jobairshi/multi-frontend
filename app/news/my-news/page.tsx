import MyNewsList from "@/components/news/MyNewsList";

export default function MyNewsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My News Articles</h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Manage your published articles
                </p>
            </div>

            <MyNewsList />
        </div>
    );
}
