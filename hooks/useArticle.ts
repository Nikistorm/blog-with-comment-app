import { useAuth0 } from '@auth0/auth0-react';
import type { Article, NewArticle } from '../interfaces';
import useSWR from 'swr';
import { useState } from 'react';
import { nanoid } from 'nanoid';

const EmptyArticle: NewArticle = {
  title: '',
  description: '',
  body: '',
  tagList: [],
};

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (res.ok) {
      return res.json();
    }

    throw new Error(`${res.status} ${res.statusText} while fetching: ${url}`);
  });

export default function useArticle() {
  const { getAccessTokenSilently, user } = useAuth0();
  const [article, setArticle] = useState<NewArticle>(EmptyArticle);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  // 获取文章列表
  const { data, isLoading, mutate } = useSWR(
    `/api/article?page=${page}&pageSize=10${activeTab === 'my' && user?.email ? `&author=${user.email}` : ''}`,
    fetcher,
    { fallbackData: { articles: [], total: 0, page: 1, pageSize: 10 } }
  );

  // 创建文章
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getAccessTokenSilently();

    try {
      await fetch('/api/article', {
        method: 'POST',
        body: JSON.stringify({ article: { ...article, author: user } }),
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      await mutate();
      setArticle(EmptyArticle);
    } catch (err) {
      console.log(err);
    }
  };

  const onDelete = async (slug: string) => {
    const token = await getAccessTokenSilently();

    try {
      await fetch('/api/article', {
        method: 'DELETE',
        body: JSON.stringify({ slug }),
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      await mutate();
    } catch (err) {
      console.log(err);
    }
  };

  // 更新文章（如喜欢/取消喜欢等）
  const onUpdate = async (slug: string, update: Partial<Article>) => {
    try {
      await fetch('/api/article', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, update }),
      });
      await mutate();
    } catch (err) {
      console.log(err);
    }
  };

  return {
    articles: data?.articles || [],
    total: data?.total || 0,
    pageSize: data?.pageSize || 10,
    isLoading,
    article,
    setArticle,
    onCreate,
    onDelete,
    onUpdate,
    page,
    setPage,
    activeTab,
    setActiveTab,
  };
}
