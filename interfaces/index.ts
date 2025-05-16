import type { User as Auth0User } from '@auth0/auth0-react';

export type User = Auth0User;

export type Comment = {
  id: string;
  created_at: number;
  url: string;
  text: string;
  user: User;
};

export type Post = {
  slug?: string;
  title?: string;
  author?: string;
  date?: Date;
  content?: string;
  excerpt?: string;
  [key: string]: any;
};

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: User;
}

export interface NewArticle {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
  author?: User;
}

export interface UpdateArticle {
  title?: string;
  description?: string;
  body?: string;
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface GetArticlesParams extends PaginationParams {
  tag?: string;
  author?: string;
  favorited?: string;
}
