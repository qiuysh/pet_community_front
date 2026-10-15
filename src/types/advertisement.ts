export interface AdPosition {
    id: number;
    name: string;
    location: string;
    size: string;
    status: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdPositionListResponse {
    list: AdPosition[];
    total: number;
    page: number;
    page_size: number;
}

export interface CreateAdPositionRequest {
    name: string;
    location: string;
    size: string;
    status?: number;
}

export interface UpdateAdPositionRequest {
    name?: string;
    location?: string;
    size?: string;
    status?: number;
}

export interface Advertisement {
    id: number;
    positionId: number;
    position: AdPosition;
    title: string;
    imageUrl: string;
    linkUrl: string;
    startTime: string;
    endTime: string;
    viewCount: number;
    clickCount: number;
    status: number;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdvertisementListResponse {
    list: Advertisement[];
    total: number;
    page: number;
    page_size: number;
}

export interface CreateAdRequest {
    positionId: number;
    title: string;
    imageUrl: string;
    linkUrl?: string;
    startTime: string;
    endTime: string;
}

export interface UpdateAdRequest {
    positionId?: number;
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    startTime?: string;
    endTime?: string;
}

export interface ReviewAdRequest {
    id: number;
    status: number;
}

export interface AdStatsResponse {
    totalViews: number;
    totalClicks: number;
    ctr: number;
    statsByDay: {
        label: string;
        value: number;
    }[];
    statsByPosition: {
        label: string;
        value: number;
    }[];
}

export type AdLocation = 'home_banner' | 'splash' | 'detail_sidebar' | 'topic_banner';

export const AdLocationMap: Record<AdLocation, string> = {
    home_banner: '首页轮播',
    splash: '启动页',
    detail_sidebar: '详情页侧边栏',
    topic_banner: '话题页横幅',
};

export const AdStatusMap: Record<number, string> = {
    0: '待审核',
    1: '上架',
    2: '下架',
};

export const AdStatusColorMap: Record<number, string> = {
    0: 'bg-warning/10 text-warning',
    1: 'bg-success/10 text-success',
    2: 'bg-error/10 text-error',
};