/**
 * 活动域常量（与后端 types/activity 校验、默认值对齐）
 *
 * 页面/组件禁止再散落字面量；改上限或默认图只改本文件。
 */

/** 列表/详情分页默认 pageSize */
export const ACTIVITY_DEFAULT_PAGE_SIZE = 20;

/** 详情顶图 / 卡片封面占位 */
export const DEFAULT_ACTIVITY_COVER = '/default-activity-cover.png';

/** 作品卡片占位图 */
export const DEFAULT_SUBMISSION_IMAGE = '/default-submission.png';

/** 管理端创建默认：每人投稿上限 */
export const ACTIVITY_DEFAULT_MAX_SUBMISSIONS = 1;

/** 管理端创建默认：每日票数 */
export const ACTIVITY_DEFAULT_VOTES_PER_DAY = 10;

/** 活动标题 max（BE binding max=100） */
export const ACTIVITY_TITLE_MAX = 100;

/** 活动描述 max（BE binding max=500） */
export const ACTIVITY_DESCRIPTION_MAX = 500;

/** 报名姓名 max */
export const ACTIVITY_REGISTRATION_NAME_MAX = 50;

/** 报名手机 max */
export const ACTIVITY_REGISTRATION_PHONE_MAX = 20;

/** 报名留言 max */
export const ACTIVITY_REGISTRATION_MESSAGE_MAX = 200;

/** 作品标题 max */
export const ACTIVITY_SUBMISSION_TITLE_MAX = 50;

/** 作品描述 max（BE binding max=500） */
export const ACTIVITY_SUBMISSION_DESCRIPTION_MAX = 500;

/** 相册照片描述 max（BE binding max=200） */
export const ACTIVITY_ALBUM_PHOTO_DESCRIPTION_MAX = 200;

/** 星评分数范围（BE binding min=1,max=5） */
export const ACTIVITY_RATING_SCORE_MIN = 1;
export const ACTIVITY_RATING_SCORE_MAX = 5;
export const ACTIVITY_RATING_DEFAULT_SCORE = 5;

/** 星评可选分值 */
export const ACTIVITY_RATING_SCORE_OPTIONS = [1, 2, 3, 4, 5] as const;

/** 星评评语 max */
export const ACTIVITY_RATING_COMMENT_MAX = 200;

/** 作品图片张数上限 */
export const ACTIVITY_SUBMISSION_MAX_IMAGES = 9;

/** 作品单图大小上限（与后端 utils.MaxPostImageBytes 一致） */
export const ACTIVITY_SUBMISSION_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** 作品视频大小上限 */
export const ACTIVITY_SUBMISSION_MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/** 作品图片扩展名白名单（与后端 UploadService 一致） */
export const ACTIVITY_SUBMISSION_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] as const;
