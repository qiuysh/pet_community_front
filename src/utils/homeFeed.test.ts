import { describe, expect, it } from 'vitest';
import { recommendPostToPostInfo, recommendToPostListResponse } from './homeFeed';

describe('homeFeed', () => {
  it('maps recommend item into PostInfo defaults needed by PostActions', () => {
    const post = recommendPostToPostInfo({
      id: 9,
      userId: 2,
      userNickname: '喵',
      userAvatar: '',
      content: 'hi',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isPinned: 0,
      isFeatured: 0,
      isLiked: true,
      isFavorited: false,
      createdAt: '2026-11-11',
    });
    expect(post.visibility).toBe(0);
    expect(post.favoritesCount).toBe(0);
    expect(post.status).toBe(1);
    expect(post.isLiked).toBe(true);
  });

  it('maps recommend response list/total for home pagination', () => {
    const res = recommendToPostListResponse({
      list: [
        {
          id: 1,
          userId: 1,
          userNickname: 'a',
          userAvatar: '',
          content: 'x',
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          isPinned: 0,
          isFeatured: 0,
          isLiked: false,
          isFavorited: false,
          createdAt: '2026-11-11',
        },
      ],
      total: 21,
      page: 1,
      pageSize: 20,
    });
    expect(res.list).toHaveLength(1);
    expect(res.total).toBe(21);
    expect(res.pageSize).toBe(20);
  });
});
