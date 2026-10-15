export interface OverviewStats {
    userCount: number;
    newUserCount: number;
    postCount: number;
    newPostCount: number;
    commentCount: number;
    newCommentCount: number;
    likeCount: number;
    newLikeCount: number;
}

export interface UserGrowthDay {
    date: string;
    newUsers: number;
    totalUsers: number;
    activeUsers: number;
}

export interface UserGrowthStats {
    data: UserGrowthDay[];
    totalNew: number;
    totalActive: number;
}

export interface ContentStatsDay {
    date: string;
    posts: number;
    comments: number;
    topics: number;
}

export interface ContentStats {
    data: ContentStatsDay[];
    totalPosts: number;
    totalComments: number;
    totalTopics: number;
}

export interface InteractionStatsDay {
    date: string;
    likes: number;
    favorites: number;
    shares: number;
    comments: number;
}

export interface InteractionStats {
    data: InteractionStatsDay[];
    totalLikes: number;
    totalFavorites: number;
    totalShares: number;
    totalComments: number;
}

export interface ExportStatsRequest {
    type: 'overview' | 'user_growth' | 'content' | 'interaction';
    startDate: string;
    endDate: string;
}