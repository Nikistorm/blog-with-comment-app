import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useArticle from '../../hooks/useArticle';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import Pagination from '../../components/base/pagination';
import Container from '@/components/container';

export default function ArticlesPage() {
  const {
    articles = [],
    isLoading,
    onUpdate,
    onDelete,
    activeTab,
    setActiveTab,
    page,
    setPage,
    total,
    pageSize,
  } = useArticle();
  const { user } = useAuth0();

  // 渲染前两行 markdown 为 html，使用防抖优化
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const renderBodies = async () => {
      const rendered = await Promise.all(
        articles.map(async (article: any) => {
          try {
            const content = article.body.split('\n').slice(0, 2).join('\n');
            const processed = await remark().use(html).process(content);
            return processed.toString();
          } catch (error) {
            console.error('Error rendering markdown:', error);
            return '';
          }
        })
      );
    };

    // 使用防抖，避免频繁渲染
    timeoutId = setTimeout(renderBodies, 100);

    return () => clearTimeout(timeoutId);
  }, [articles]);

  // 喜欢按钮处理
  const handleFavorite = async (idx: number) => {
    const article = articles[idx];
    const newFavorited = !article.favorited;
    const newCount = newFavorited ? article.favoritesCount + 1 : Math.max(0, article.favoritesCount - 1);
    await onUpdate(article.slug, { favorited: newFavorited, favoritesCount: newCount });
  };

  // 删除文章处理
  const handleDelete = async (slug: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await onDelete(slug);
    }
  };

  // 检查是否是文章作者
  const isAuthor = (article: any) => {
    return user?.email === article.author?.email;
  };

  return (
    <Container>
      <h1 className='text-2xl font-bold mb-6'>Articles</h1>

      {/* Add tabs */}
      <div className='flex border-b border-border mb-8'>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Articles
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('my')}
        >
          My Articles
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className='space-y-6'>
          {articles.map((article: any, idx: number) => (
            <div key={article.slug} className='p-6 bg-card rounded shadow hover:shadow-md transition'>
              <div className='flex justify-between text-sm text-muted-foreground mb-2'>
                <div className='flex items-center gap-4'>
                  <span>By {article.author?.name || 'Unknown'}</span>
                  <span>{new Date(article.updatedAt).toLocaleString()}</span>
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
              <Link href={`/articles/${article.slug}`}>
                <h2 className='text-xl font-bold text-primary cursor-pointer hover:underline mb-2'>{article.title}</h2>
              </Link>
              <div className='mb-2 text-base text-foreground'>{article.description}</div>
              <div className='flex justify-between items-center mt-2'>
                <div className='flex flex-wrap gap-2'>
                  {article.tagList?.map((tag: string) => (
                    <span key={tag} className='px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs'>
                      #{tag}
                    </span>
                  ))}
                </div>
                {isAuthor(article) && (
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/editor?slug=${article.slug}`}
                      className='px-2.5 py-1 text-xs rounded border border-muted-foreground/20 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.slug, article.title)}
                      className='px-2.5 py-1 text-xs rounded border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors'
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} onPageChange={setPage} />
    </Container>
  );
}
