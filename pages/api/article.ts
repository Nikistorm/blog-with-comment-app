import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../lib/redis';
import { Article, NewArticle, UpdateArticle, User } from '../../interfaces';
import { nanoid } from 'nanoid';

const ARTICLE_PREFIX = 'article:';
const ARTICLE_ZSET = 'articles:zset';
const getArticleKey = (slug: string) => `${ARTICLE_PREFIX}${slug}`;

// 获取所有文章（支持分页）
async function fetchArticles(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', pageSize = '10', slug, author } = req.query;
  if (slug && typeof slug === 'string') {
    // 获取单篇文章
    const data = await redis.get(getArticleKey(slug));
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(JSON.parse(data));
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const size = parseInt(pageSize as string, 10) || 10;
  const start = (pageNum - 1) * size;
  const stop = pageNum * size - 1;

  // 如果指定了作者，使用 Redis 管道批量获取文章
  if (author && typeof author === 'string') {
    const pipeline = redis.pipeline();
    const allSlugs = await redis.zrevrange(ARTICLE_ZSET, 0, -1);

    // 批量获取所有文章
    allSlugs.forEach((slug) => {
      pipeline.get(getArticleKey(slug));
    });

    const results = await pipeline.exec();
    if (!results) {
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    // 过滤并解析文章
    const filteredArticles = results
      .map(([err, data]) => {
        if (err || !data) return null;
        try {
          const article = JSON.parse(data as string) as Article;
          return article.author?.email === author ? article : null;
        } catch (e) {
          console.error('Error parsing article:', e);
          return null;
        }
      })
      .filter((article): article is Article => article !== null);

    // 在过滤后的结果中进行分页
    const pagedArticles = filteredArticles.slice(start, stop + 1);

    return res.status(200).json({
      articles: pagedArticles,
      total: filteredArticles.length,
      page: pageNum,
      pageSize: size,
    });
  }

  // 如果没有指定作者，使用 Redis 管道批量获取分页文章
  const pipeline = redis.pipeline();
  const slugs = await redis.zrevrange(ARTICLE_ZSET, start, stop);

  // 批量获取文章
  slugs.forEach((slug) => {
    pipeline.get(getArticleKey(slug));
  });

  const results = await pipeline.exec();
  if (!results) {
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }

  // 解析文章
  const articles = results
    .map(([err, data]) => {
      if (err || !data) return null;
      try {
        return JSON.parse(data as string) as Article;
      } catch (e) {
        console.error('Error parsing article:', e);
        return null;
      }
    })
    .filter((article): article is Article => article !== null);

  const total = await redis.zcard(ARTICLE_ZSET);

  return res.status(200).json({
    articles,
    total,
    page: pageNum,
    pageSize: size,
  });
}

// 创建文章
async function createArticle(req: NextApiRequest, res: NextApiResponse) {
  const { article } = req.body as { article: NewArticle & { author: User } };
  if (!article || !article.title || !article.description || !article.body || !article.author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const slug = nanoid(12);
  const now = new Date().toISOString();

  const newArticle: Article = {
    slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList || [],
    createdAt: now,
    updatedAt: now,
    favorited: false,
    favoritesCount: 0,
    author: article.author,
  };

  await redis.set(getArticleKey(slug), JSON.stringify(newArticle));
  await redis.zadd(ARTICLE_ZSET, Date.parse(newArticle.updatedAt), slug);
  return res.status(201).json(newArticle);
}

// 删除文章
async function deleteArticle(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });
  await redis.del(getArticleKey(slug));
  await redis.zrem(ARTICLE_ZSET, slug);
  return res.status(204).end();
}

// 更新文章
async function updateArticle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, update } = req.body as { slug: string; update: UpdateArticle };
  if (!slug || !update) return res.status(400).json({ error: 'Missing slug or update' });
  const data = await redis.get(getArticleKey(slug));
  if (!data) return res.status(404).json({ error: 'Not found' });

  const oldArticle: Article = JSON.parse(data);
  const updatedArticle: Article = {
    ...oldArticle,
    ...update,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(getArticleKey(slug), JSON.stringify(updatedArticle));
  await redis.zadd(ARTICLE_ZSET, Date.parse(updatedArticle.updatedAt), slug);
  return res.status(200).json(updatedArticle);
}

// 点赞/取消点赞
async function favoriteArticle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, favorited } = req.body as { slug: string; favorited: boolean };
  if (!slug || typeof favorited !== 'boolean') return res.status(400).json({ error: 'Missing slug or favorited' });
  const data = await redis.get(getArticleKey(slug));
  if (!data) return res.status(404).json({ error: 'Not found' });
  const article: Article = JSON.parse(data);
  let favoritesCount = article.favoritesCount || 0;
  if (favorited && !article.favorited) {
    favoritesCount += 1;
  } else if (!favorited && article.favorited) {
    favoritesCount = Math.max(0, favoritesCount - 1);
  }
  const updatedArticle: Article = {
    ...article,
    favorited,
    favoritesCount,
    updatedAt: new Date().toISOString(),
  };
  await redis.set(getArticleKey(slug), JSON.stringify(updatedArticle));
  await redis.zadd(ARTICLE_ZSET, Date.parse(updatedArticle.updatedAt), slug);
  return res.status(200).json(updatedArticle);
}

// 路由分发
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return fetchArticles(req, res);
    case 'POST':
      return createArticle(req, res);
    case 'DELETE':
      return deleteArticle(req, res);
    case 'PUT':
      return updateArticle(req, res);
    case 'PATCH':
      return favoriteArticle(req, res);
    default:
      return res.status(400).json({ message: 'Invalid method.' });
  }
}
