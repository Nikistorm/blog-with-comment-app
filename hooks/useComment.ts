import type { Comment } from '../interfaces';
import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth0 } from '@auth0/auth0-react';

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (res.ok) {
      return res.json();
    }
    throw new Error(`${res.status} ${res.statusText} while fetching: ${url}`);
  });

export default function useComments(articleSlug?: string) {
  const { getAccessTokenSilently } = useAuth0();
  const [text, setText] = useState('');

  const { data: comments, mutate } = useSWR<Comment[]>(
    articleSlug ? `/api/comment?slug=${articleSlug}` : null,
    fetcher,
    { fallbackData: [] }
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getAccessTokenSilently();

    try {
      await fetch('/api/comment', {
        method: 'POST',
        body: JSON.stringify({ text, slug: articleSlug }),
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      setText('');
      await mutate();
    } catch (err) {
      console.log(err);
    }
  };

  const onDelete = async (comment: Comment) => {
    const token = await getAccessTokenSilently();

    try {
      await fetch('/api/comment', {
        method: 'DELETE',
        body: JSON.stringify({ comment, slug: articleSlug }),
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

  return { text, setText, comments, onSubmit, onDelete };
}
