import { describe, expect, it } from 'vitest';
import { getLoginContextCopy } from './loginContext';

describe('getLoginContextCopy', () => {
  it('私信路径给出私信上下文', () => {
    expect(getLoginContextCopy('/messages').subtitle).toContain('私信');
  });

  it('发帖路径给出发布上下文', () => {
    expect(getLoginContextCopy('/posts/create').subtitle).toContain('发布');
  });

  it('宠物档案创建路径给出档案上下文', () => {
    expect(getLoginContextCopy('/pets/create').subtitle).toContain('宠物档案');
  });

  it('无来源时用默认欢迎语', () => {
    expect(getLoginContextCopy(undefined).subtitle).toContain('宠友');
  });
});
