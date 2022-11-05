export interface ArticlesResponse {
  count: number;
  next_page: string;
  page: number;
  page_count: number;
  per_page: number;
  previous_page?: any;
  articles: Article[];
  sort_by: string;
  sort_order: string;
}

export interface Article {
  id: any;
  url: string;
  html_url: string;
  author_id: any;
  comments_disabled: boolean;
  draft: boolean;
  promoted: boolean;
  position: number;
  vote_sum: number;
  vote_count: number;
  section_id: any;
  created_at: Date;
  updated_at: Date;
  name: string;
  title: string;
  source_locale: string;
  locale: string;
  outdated: boolean;
  outdated_locales: any[];
  edited_at: Date;
  user_segment_id?: any;
  permission_group_id: number;
  content_tag_ids: any[];
  label_names: any[];
  body: string;
}
