import { useRouter } from 'next/router';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import useArticle from '../../hooks/useArticle';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import Container from '@/components/container';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const CommentSection = dynamic(() => import('../../components/comment'), { ssr: false });

export default function ArticleDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { onUpdate, onDelete } = useArticle();
  const { user } = useAuth0();
  const { data: article, isLoading, mutate } = useSWR(slug ? `/api/article?slug=${slug}` : null, fetcher);
  const [renderedBody, setRenderedBody] = useState('');

  useEffect(() => {
    if (article?.body) {
      // 配置 marked 选项
      marked.setOptions({
        gfm: true, // 启用 GitHub Flavored Markdown
        breaks: true, // 启用换行符
      });

      // 使用同步解析
      const html = marked.parse(article.body, { async: false });
      setRenderedBody(html as string);
    }
  }, [article]);

  const handleFavorite = async () => {
    if (!article) return;
    const newFavorited = !article.favorited;
    const newCount = newFavorited ? article.favoritesCount + 1 : Math.max(0, article.favoritesCount - 1);
    await onUpdate(article.slug, { favorited: newFavorited, favoritesCount: newCount });
    mutate(); // 重新获取详情数据
  };

  const handleDelete = async () => {
    if (!article) return;
    if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
      await onDelete(article.slug);
      router.push('/articles'); // 删除后返回文章列表
    }
  };

  // 检查是否是文章作者
  const isAuthor = () => {
    return user?.email === article?.author?.email;
  };

  if (isLoading) return <div className='max-w-2xl mx-auto py-10'>Loading...</div>;
  if (!article) return <div className='max-w-2xl mx-auto py-10'>Not found</div>;

  return (
    <Container>
      <h1 className='text-3xl font-bold mb-4'>{article.title}</h1>
      <div className='flex justify-between items-center text-sm text-muted-foreground mb-4'>
        <div className='flex items-center gap-4'>
          <span>By {article.author?.name || 'Unknown'}</span>
          <span>{new Date(article.updatedAt).toLocaleString()}</span>
        </div>
        {isAuthor() && (
          <div className='flex gap-2'>
            <Link
              href={`/editor?slug=${article.slug}`}
              className='px-2.5 py-1 text-xs rounded border border-muted-foreground/20 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className='px-2.5 py-1 text-xs rounded border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors'
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <div className='prose prose-lg max-w-none mb-4' dangerouslySetInnerHTML={{ __html: renderedBody }} />
      <div className='flex flex-wrap gap-2 mb-4'>
        {article.tagList?.map((tag: string) => (
          <span key={tag} className='px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs'>
            #{tag}
          </span>
        ))}
      </div>
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded-full border transition bg-muted text-muted-foreground border-muted hover:bg-accent hover:text-accent-foreground`}
        onClick={handleFavorite}
        aria-pressed={article.favorited}
      >
        <span>{article.favorited ? '❤️' : '🤍'}</span>
        <span>{article.favoritesCount}</span>
      </button>
      <div className='mb-8' />
      <CommentSection articleSlug={article.slug} />
    </Container>
  );
}
