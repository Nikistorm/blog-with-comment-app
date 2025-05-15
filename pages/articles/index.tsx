import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useArticle from '../../hooks/useArticle';
import { remark } from 'remark';
import html from 'remark-html';

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { articles = [], isLoading, onUpdate } = useArticle();
  const router = useRouter();
  const [renderedBodies, setRenderedBodies] = useState<string[]>([]);
  const [localArticles, setLocalArticles] = useState<any[]>([]);

  // 渲染前两行 markdown 为 html
  useEffect(() => {
    Promise.all(
      articles.slice((page - 1) * pageSize, page * pageSize).map(async (article: any) => {
        let content = article.body.split('\n').slice(0, 2).join('\n');
        // 只用 remark 渲染 markdown，不再处理换行符
        let processed = await remark().use(html).process(content);
        return processed.toString();
      })
    ).then(setRenderedBodies);
  }, [articles, page]);

  // 分页处理
  const pagedArticles = articles.slice((page - 1) * pageSize, page * pageSize);

  // 喜欢按钮处理
  const handleFavorite = async (idx: number) => {
    const article = pagedArticles[idx];
    const newFavorited = !article.favorited;
    const newCount = newFavorited ? article.favoritesCount + 1 : Math.max(0, article.favoritesCount - 1);
    await onUpdate(article.slug, { favorited: newFavorited, favoritesCount: newCount });
  };

  return (
    <div className='max-w-3xl mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-6'>Articles</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className='space-y-6'>
          {pagedArticles.map((article: any, idx: number) => (
            <div key={article.slug} className='p-6 bg-card rounded shadow hover:shadow-md transition'>
              <div className='flex justify-between text-sm text-muted-foreground mb-2'>
                <span>By {article.author?.name || 'Unknown'}</span>
                <span>{new Date(article.updatedAt).toLocaleString()}</span>
              </div>
              <h2
                className='text-xl font-bold text-primary cursor-pointer hover:underline mb-2'
                onClick={() => router.push(`/articles/${article.slug}`)}
              >
                {article.title}
              </h2>
              <div className='mb-2 text-base text-foreground'>{article.description}</div>
              <div className='flex justify-between items-center mt-2'>
                <div className='flex flex-wrap gap-2'>
                  {article.tagList?.map((tag: string) => (
                    <span key={tag} className='px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs'>
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border transition bg-muted text-muted-foreground border-muted`}
                  onClick={() => handleFavorite(idx)}
                  aria-pressed={article.favorited}
                >
                  <span>{article.favorited ? '❤️' : '🤍'}</span>
                  <span>{article.favoritesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className='flex justify-center gap-4 mt-8'>
        <button
          className='px-4 py-2 rounded bg-muted text-muted-foreground'
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          className='px-4 py-2 rounded bg-muted text-muted-foreground'
          disabled={pagedArticles.length < pageSize}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
