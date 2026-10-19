/** 消息类型（与后端 messages.type 一致） */
export type MessageType = 'text' | 'image' | 'voice';

/** 私信消息 */
export interface ChatMessage {
  id: number;
  conversationId?: number;
  fromId: number;
  toId: number;
  content: string;
  type: MessageType | string;
  /** 图片/语音地址（相对路径 /uploads/...） */
  mediaUrl?: string;
  /** 语音时长（秒），非语音为 0 */
  duration?: number;
  status: number;
  isRecalled: number;
  createdAt: string;
  /** 仅前端乐观消息：发送中 */
  pending?: boolean;
  /** 仅前端乐观消息：本地 blob 预览地址 */
  localUrl?: string;
}

/** 分页响应（后端 PageData 为 snake_case） */
export interface MessagePage {
  list: ChatMessage[];
  total: number;
  page: number;
  page_size: number;
}

/** 发送消息请求体 */
export interface SendMessagePayload {
  toId: number;
  content?: string;
  type?: MessageType;
  mediaUrl?: string;
  duration?: number;
}

/** 媒体上传响应 */
export interface UploadMediaResult {
  url: string;
}

/** 会话内搜索状态 */
export type MessageSearchStatus =
  | 'idle'
  | 'debouncing'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error';
