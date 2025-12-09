import NewsList from "@/components/news/NewsList";

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Latest News</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Stay updated with the latest articles
        </p>
      </div>

      <NewsList />
    </div>
  );
}

