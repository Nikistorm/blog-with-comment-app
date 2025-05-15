import { useRouter } from 'next/router';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import useArticle from '../../hooks/useArticle';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const CommentSection = dynamic(() => import('../../components/comment'), { ssr: false });

export default function ArticleDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { onUpdate } = useArticle();
  const { data: article, isLoading, mutate } = useSWR(slug ? `/api/article?slug=${slug}` : null, fetcher);
  const [renderedBody, setRenderedBody] = useState('');

  useEffect(() => {
    if (article?.body) {
      remark()
        .use(html)
        .process(article.body)
        .then((processed) => {
          setRenderedBody(processed.toString());
        });
    }
  }, [article]);

  const handleFavorite = async () => {
    if (!article) return;
    const newFavorited = !article.favorited;
    const newCount = newFavorited ? article.favoritesCount + 1 : Math.max(0, article.favoritesCount - 1);
    await onUpdate(article.slug, { favorited: newFavorited, favoritesCount: newCount });
    mutate(); // 重新获取详情数据
  };

  if (isLoading) return <div className='max-w-2xl mx-auto py-10'>Loading...</div>;
  if (!article) return <div className='max-w-2xl mx-auto py-10'>Not found</div>;

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-2'>{article.title}</h1>
      <div className='flex justify-between text-sm text-muted-foreground mb-4'>
        <span>By {article.author?.name || 'Unknown'}</span>
        <span>{new Date(article.updatedAt).toLocaleString()}</span>
      </div>
      <div className='prose mb-4' dangerouslySetInnerHTML={{ __html: renderedBody }} />
      <div className='flex flex-wrap gap-2 mb-4'>
        {article.tagList?.map((tag: string) => (
          <span key={tag} className='px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs'>
            #{tag}
          </span>
        ))}
      </div>
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded-full border transition bg-muted text-muted-foreground border-muted`}
        onClick={handleFavorite}
        aria-pressed={article.favorited}
      >
        <span>{article.favorited ? '❤️' : '🤍'}</span>
        <span>{article.favoritesCount}</span>
      </button>
      <div className='mb-8' />
      <CommentSection articleSlug={article.slug} />
    </div>
  );
}
