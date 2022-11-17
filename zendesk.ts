export interface ArticlesResponse {
  count: number;
  next_page: string;
  page: number;
  page_count: number;
  per_page: number;
  articles: Article[];
  sort_by: string;
  sort_order: string;
}

export interface Article {
  id: number;
  url: string;
  html_url: string;
  comments_disabled: boolean;
  draft: boolean;
  promoted: boolean;
  position: number;
  vote_sum: number;
  vote_count: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  title: string;
  source_locale: string;
  locale: string;
  outdated: boolean;
  edited_at: Date;
  permission_group_id: number;
  body: string;
}
