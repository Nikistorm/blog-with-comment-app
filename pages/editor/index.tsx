import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth0 } from '@auth0/auth0-react';
import type { NewArticle } from '../../interfaces';
import useArticle from '../../hooks/useArticle';

const EmptyArticle: NewArticle = {
  title: '',
  description: '',
  body: '',
  tagList: [],
};

export default function Editor() {
  const router = useRouter();
  const { user } = useAuth0();
  const { article, setArticle, onCreate } = useArticle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

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
      await onCreate(e);
      router.push('/articles');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-6'>New Article</h1>
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
            className='w-full border rounded px-3 py-2 h-48 font-mono'
            required
          />
        </div>
        {error && <div className='text-red-600'>{error}</div>}
        <button
          type='submit'
          className='px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
          disabled={loading}
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
