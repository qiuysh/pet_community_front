import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostEditor } from '../../hooks/usePostEditor';
import { useTopicSearch } from '../../hooks/useTopicSearch';
import { VisibilityOptions } from '../../types/post';
import { getDefaultPetAvatar } from '../../utils/avatarUtils';
import { useToast } from '../../components/toast';
import { Plus, X, Image, Video, PawPrint, Hash, MapPin, Lock, ChevronRight, Check, Clock } from 'lucide-react';
import { SchedulePicker } from '../../components/post/schedulePicker';
import { Button } from '../../components/ui/button';
import { Input, Textarea } from '../../components/ui/input';
import { FilterChip } from '../../components/ui/filterChip';
import { Avatar } from '../../components/ui/avatar';
import './postEditorPage.scss';

export const PostEditorPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    isEdit,
    state,
    myPets,
    loading,
    setContent,
    setImages,
    setVideo,
    setSelectedPets,
    setSelectedTopics,
    setLocation,
    setVisibility,
    setPublishMode,
    setPublishTime,
    publish,
    saveDraft,
    cancelSchedule,
    autoSaveHint,
  } = usePostEditor();

  const {
    keyword: topicKeyword,
    setKeyword: setTopicKeyword,
    suggestions: topicSuggestions,
    clear: clearTopicSearch,
  } = useTopicSearch();

  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 9 - state.images.length;
    if (remaining <= 0) {
      toast.error('最多9张图片');
      return;
    }

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('单张图片不能超过10MB');
        continue;
      }
      const url = URL.createObjectURL(file);
      newImages.push(url);
    }

    setImages([...state.images, ...newImages]);
    if (state.video) setVideo('');
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 200 * 1024 * 1024) {
      toast.error('视频不能超过200MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideo(url);
    setImages([]);
  };

  const removeImage = (index: number) => {
    setImages(state.images.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo('');
  };

  const addTopic = (topic: typeof state.selectedTopics[number]) => {
    if (state.selectedTopics.length >= 3) {
      toast.error('最多添加3个话题');
      return;
    }
    if (state.selectedTopics.find((t) => t.id === topic.id)) return;
    setSelectedTopics([...state.selectedTopics, topic]);
    clearTopicSearch();
    setShowTopicPicker(false);
  };

  const removeTopic = (topicId: number) => {
    setSelectedTopics(state.selectedTopics.filter((t) => t.id !== topicId));
  };

  const togglePet = (petId: number) => {
    if (state.selectedPets.includes(petId)) {
      setSelectedPets(state.selectedPets.filter((id) => id !== petId));
    } else {
      setSelectedPets([...state.selectedPets, petId]);
    }
  };

  const handlePublish = () => {
    publish();
  };

  const handleSaveDraft = () => {
    saveDraft();
  };

  const charCount = state.content.length;
  const canPublish = !loading && (state.content.trim() || state.images.length > 0 || state.video);

  return (
    <div className="post-editor-page">
      <div className="editor-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)}>取消</Button>
        <span className="title">{isEdit ? '编辑动态' : '发布动态'}</span>
        <Button
          type="button"
          className="publish-btn"
          disabled={!canPublish}
          loading={loading}
          onClick={handlePublish}
        >
          发布
        </Button>
      </div>

      <div className="editor-body">
        <Textarea
          className="content-input"
          value={state.content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你家萌宠的精彩瞬间吧～"
          maxLength={500}
          rows={6}
        />
        <div className="char-count">{charCount}/500</div>

        {state.selectedTopics.length > 0 && (
          <div className="selected-topics">
            {state.selectedTopics.map((topic) => (
              <span key={topic.id} className="topic-tag">
                {topic.name}
                <Button type="button" variant="ghost" size="sm" onClick={() => removeTopic(topic.id)} aria-label="移除话题">
                  <X size={14} aria-hidden="true" />
                </Button>
              </span>
            ))}
          </div>
        )}

        <div className="media-section">
          {state.images.length > 0 && (
            <div className="image-grid">
              {state.images.map((img, idx) => (
                <div key={idx} className="image-item">
                  <img src={img} alt="" />
                  <Button type="button" variant="ghost" size="sm" className="remove-btn" onClick={() => removeImage(idx)} aria-label="删除图片">
                    <X size={16} aria-hidden="true" />
                  </Button>
                </div>
              ))}
              {state.images.length < 9 && !state.video && (
                <div className="add-image-btn" onClick={() => fileInputRef.current?.click()}>
                  <span className="plus"><Plus size={24} aria-hidden="true" /></span>
                </div>
              )}
            </div>
          )}

          {state.video && (
            <div className="video-item">
              <video src={state.video} controls />
              <Button type="button" variant="ghost" size="sm" className="remove-btn" onClick={removeVideo} aria-label="删除视频">
                <X size={16} aria-hidden="true" />
              </Button>
            </div>
          )}

          {state.images.length === 0 && !state.video && (
            <div className="media-actions">
              <Button type="button" variant="outline" className="media-btn" onClick={() => fileInputRef.current?.click()}>
                <span className="icon"><Image size={20} aria-hidden="true" /></span>
                <span>图片</span>
              </Button>
              <Button type="button" variant="outline" className="media-btn" onClick={() => videoInputRef.current?.click()}>
                <span className="icon"><Video size={20} aria-hidden="true" /></span>
                <span>视频</span>
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleVideoUpload}
          />
        </div>

        <div className="extra-options">
          <div className="option-item" onClick={() => setShowPetPicker(!showPetPicker)}>
            <span className="option-icon"><PawPrint size={20} aria-hidden="true" /></span>
            <span className="option-label">选择宠物</span>
            <span className="option-value">
              {state.selectedPets.length > 0 ? `已选 ${state.selectedPets.length} 只` : '未选择'}
            </span>
            <span className="option-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
          </div>

          {showPetPicker && (
            <div className="pet-picker">
              {myPets.length === 0 ? (
                <div className="empty-pets">暂无宠物，<a href="/pets/create">去添加</a></div>
              ) : (
                <div className="pet-options">
                  {myPets.map((pet) => (
                    <div
                      key={pet.id}
                      className={`pet-option ${state.selectedPets.includes(pet.id) ? 'selected' : ''}`}
                      onClick={() => togglePet(pet.id)}
                    >
                      <Avatar src={pet.avatar || getDefaultPetAvatar()} alt="" name={pet.name} size="md" className="pet-avatar" />
                      <span>{pet.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="option-item" onClick={() => setShowTopicPicker(!showTopicPicker)}>
            <span className="option-icon"><Hash size={20} aria-hidden="true" /></span>
            <span className="option-label">添加话题</span>
            <span className="option-value">
              {state.selectedTopics.length > 0 ? `已选 ${state.selectedTopics.length} 个` : '最多3个'}
            </span>
            <span className="option-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
          </div>

          {showTopicPicker && (
            <div className="topic-picker">
              <Input
                type="text"
                placeholder="搜索话题"
                value={topicKeyword}
                onChange={(e) => setTopicKeyword(e.target.value)}
                aria-label="搜索话题"
              />
              {topicSuggestions.length > 0 && (
                <div className="topic-suggestions">
                  {topicSuggestions.map((topic) => (
                    <div
                      key={topic.id}
                      className="topic-suggestion"
                      onClick={() => addTopic(topic)}
                    >
                      <span className="topic-name">{topic.name}</span>
                      <span className="topic-count">{topic.postsCount} 动态</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="option-item">
            <span className="option-icon"><MapPin size={20} aria-hidden="true" /></span>
            <span className="option-label">所在位置</span>
            <Input
              type="text"
              className="location-input"
              value={state.location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="添加位置"
              aria-label="所在位置"
            />
          </div>

          <div className="option-item">
            <span className="option-icon"><Clock size={20} aria-hidden="true" /></span>
            <span className="option-label">定时发布</span>
            <div className="publish-toggle">
              <FilterChip
                active={state.publishMode === 'now'}
                onClick={() => setPublishMode('now')}
                className="toggle-btn"
              >
                立即
              </FilterChip>
              <FilterChip
                active={state.publishMode === 'scheduled'}
                onClick={() => setPublishMode('scheduled')}
                className="toggle-btn"
              >
                定时
              </FilterChip>
            </div>
          </div>

          {state.publishMode === 'scheduled' && (
            <>
              <SchedulePicker
                value={state.publishTime}
                onChange={setPublishTime}
                maxDays={7}
              />
              {isEdit && (
                <button
                  type="button"
                  className="text-sm text-brown-secondary underline mt-2 self-start"
                  disabled={loading}
                  onClick={() => cancelSchedule()}
                >
                  取消定时并转为草稿
                </button>
              )}
            </>
          )}

          <div className="option-item" onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}>
            <span className="option-icon"><Lock size={20} aria-hidden="true" /></span>
            <span className="option-label">谁可以看</span>
            <span className="option-value">
              {VisibilityOptions.find((v) => v.value === state.visibility)?.label}
            </span>
            <span className="option-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
          </div>

          {showVisibilityPicker && (
            <div className="visibility-picker">
              {VisibilityOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`visibility-option ${state.visibility === opt.value ? 'selected' : ''}`}
                  onClick={() => { setVisibility(opt.value); setShowVisibilityPicker(false); }}
                >
                  <div>
                    <div className="vis-label">{opt.label}</div>
                    <div className="vis-desc">{opt.desc}</div>
                  </div>
                  {state.visibility === opt.value && <span className="check"><Check size={18} aria-hidden="true" /></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="editor-footer">
        {autoSaveHint && (
          <span className="text-xs text-brown-muted mr-auto self-center">{autoSaveHint}</span>
        )}
        <Button type="button" variant="outline" className="draft-btn" onClick={handleSaveDraft} disabled={loading}>
          存草稿
        </Button>
        <Button
          type="button"
          variant="outline"
          className="draft-btn"
          onClick={() => navigate('/posts/drafts')}
          disabled={loading}
        >
          草稿箱
        </Button>
      </div>
    </div>
  );
};
