import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth0 } from '@auth0/auth0-react';
import type { NewArticle } from '../../interfaces';
import useArticle from '../../hooks/useArticle';
import Container from '@/components/container';

export default function Editor() {
  const router = useRouter();
  const { user } = useAuth0();
  const { article, setArticle, onCreate, onUpdate } = useArticle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(router.query.slug);

  // 如果是编辑模式，获取文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      if (router.query.slug) {
        setLoading(true);
        try {
          const response = await fetch(`/api/article?slug=${router.query.slug}`);
          const data = await response.json();
          if (data) {
            setArticle({
              title: data.title,
              description: data.description,
              body: data.body,
              tagList: data.tagList || [],
              author: user,
            });
          }
        } catch (err) {
          setError('Failed to fetch article');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchArticle();
  }, [router.query.slug, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle((prev) => ({
      ...prev,
      [name]: value,
      author: user,
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !article.tagList?.includes(value)) {
        setArticle((prev) => ({
          ...prev,
          tagList: [...(prev.tagList || []), value],
          author: user,
        }));
        if (tagInputRef.current) tagInputRef.current.value = '';
      }
    }
  };

  const handleTagRemove = (tag: string) => {
    setArticle((prev) => ({
      ...prev,
      tagList: prev.tagList?.filter((t) => t !== tag) || [],
      author: user,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await onUpdate(router.query.slug as string, article);
      } else {
        await onCreate(e);
      }
      router.push('/articles');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className='text-2xl font-bold mb-6'>{isEditing ? 'Edit Article' : 'New Article'}</h1>
      <form onSubmit={handleSubmit} className='space-y-6 bg-white p-6 rounded shadow'>
        <div>
          <label className='block mb-1 font-medium'>Title</label>
          <input
            type='text'
            name='title'
            value={article.title}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
            required
          />
        </div>
        <div>
          <label className='block mb-1 font-medium'>Description</label>
          <input
            type='text'
            name='description'
            value={article.description}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
            required
          />
        </div>
        <div>
          <label className='block mb-1 font-medium'>Tags (press Enter to add)</label>
          <input
            type='text'
            name='tagList'
            ref={tagInputRef}
            onKeyDown={handleTagKeyDown}
            className='w-full border rounded px-3 py-2'
            placeholder='Enter a tag and press Enter'
          />
          <div className='flex flex-wrap gap-2 mt-2'>
            {article.tagList?.map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs'
              >
                {tag}
                <button
                  type='button'
                  className='ml-1 text-red-500 hover:text-red-700'
                  onClick={() => handleTagRemove(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className='block mb-1 font-medium'>Content (Markdown)</label>
          <textarea
            name='body'
            value={article.body}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2 h-160 font-mono'
            required
          />
        </div>
        {error && <div className='text-red-600'>{error}</div>}
        <button
          type='submit'
          className='relative px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          disabled={loading}
        >
          <span className={loading ? 'opacity-0' : 'opacity-100'}>{isEditing ? 'Save Changes' : 'Publish'}</span>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <svg
                className='animate-spin h-5 w-5 text-primary-foreground'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            </div>
          )}
        </button>
      </form>
    </Container>
  );
}
