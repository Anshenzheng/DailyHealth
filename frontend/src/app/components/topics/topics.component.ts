import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TopicService, Topic, Comment } from '../../services/topic.service';

@Component({
  selector: 'app-topics',
  template: `
    <div class="container mt-3 mb-4">
      <div class="page-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="page-title">💬 话题广场</h1>
          <p class="page-subtitle text-muted">分享你的健康生活，与大家互动交流</p>
        </div>
        <button class="btn btn-primary" (click)="showAddModal()">
          ✏️ 发布话题
        </button>
      </div>

      <div class="row">
        <div class="col" style="flex: 0 0 66.666%; max-width: 66.666%; padding: 0 12px;">
          <div *ngIf="topics.length === 0 && !isLoading" class="empty-state card">
            <div class="empty-state-icon">💬</div>
            <div class="empty-state-text">还没有话题，快来发布第一个吧！</div>
          </div>

          <div *ngIf="isLoading" class="loading card">
            <div class="spinner"></div>
          </div>

          <div *ngIf="!isLoading && topics.length > 0">
            <div *ngFor="let topic of topics" class="topic-card card mb-4">
              <div class="card-body">
                <div class="d-flex align-items-start" style="gap: 16px;">
                  <div class="avatar" [style.background]="getAvatarColor(topic.user?.username)">
                    {{ getInitial(topic.user?.nickname || topic.user?.username) }}
                  </div>
                  <div class="flex-1" style="flex: 1;">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <span class="fw-bold" style="font-size: 15px;">
                          {{ topic.user?.nickname || topic.user?.username }}
                        </span>
                        <span class="text-muted" style="font-size: 12px; margin-left: 8px;">
                          {{ formatDate(topic.createdAt) }}
                        </span>
                      </div>
                      <button *ngIf="isMyTopic(topic)" class="btn btn-sm btn-danger" (click)="deleteTopic(topic)">
                        删除
                      </button>
                    </div>
                    
                    <h3 class="topic-title" (click)="viewTopic(topic)" style="cursor: pointer;">
                      {{ topic.title }}
                    </h3>
                    
                    <p class="topic-content">{{ truncateContent(topic.content) }}</p>
                    
                    <div class="d-flex align-items-center" style="gap: 24px; margin-top: 16px;">
                      <button 
                        class="action-btn" 
                        [class.liked]="topic.isLikedByCurrentUser"
                        (click)="toggleLike(topic)"
                      >
                        <span>{{ topic.isLikedByCurrentUser ? '❤️' : '🤍' }}</span>
                        <span>{{ topic.likeCount || 0 }}</span>
                      </button>
                      <button class="action-btn" (click)="viewTopic(topic)">
                        <span>💬</span>
                        <span>{{ topic.commentCount || 0 }} 评论</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="hasMore" class="text-center mt-4">
              <button class="btn btn-secondary" (click)="loadMore()" [disabled]="isLoadingMore">
                {{ isLoadingMore ? '加载中...' : '加载更多' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col" style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px;">
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title mb-0">💡 热门话题</h3>
            </div>
            <div class="card-body">
              <div *ngIf="topics.length === 0" class="empty-state" style="padding: 10px;">
                <div class="empty-state-text" style="font-size: 13px;">暂无热门话题</div>
              </div>
              <div *ngIf="topics.length > 0">
                <div *ngFor="let topic of topics.slice(0, 5); let i = index" 
                     class="hot-topic-item" 
                     (click)="viewTopic(topic)" 
                     style="cursor: pointer;">
                  <span class="hot-number" [class.hot-top]="i < 3">{{ i + 1 }}</span>
                  <span class="hot-title">{{ truncateTitle(topic.title) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title mb-0">📝 我的话题</h3>
            </div>
            <div class="card-body">
              <div *ngIf="myTopics.length === 0" class="empty-state" style="padding: 10px;">
                <div class="empty-state-text" style="font-size: 13px;">你还没有发布话题</div>
              </div>
              <div *ngIf="myTopics.length > 0">
                <div *ngFor="let topic of myTopics.slice(0, 5)" 
                     class="my-topic-item"
                     (click)="viewTopic(topic)"
                     style="cursor: pointer;">
                  <div class="my-topic-title">{{ truncateTitle(topic.title) }}</div>
                  <div class="my-topic-meta text-muted">
                    <span>❤️ {{ topic.likeCount || 0 }}</span>
                    <span>💬 {{ topic.commentCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showAddTopicModal" class="modal-overlay" (click)="hideAddModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">发布新话题</h3>
          <button class="modal-close" (click)="hideAddModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="topicForm" (ngSubmit)="onSubmitTopic()">
            <div class="form-group">
              <label class="form-label">标题 *</label>
              <input type="text" formControlName="title" class="form-control" placeholder="请输入话题标题">
              <div *ngIf="isTopicFormSubmitted && tf['title'].invalid" class="form-error">
                请输入标题（最多200字）
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">内容 *</label>
              <textarea formControlName="content" class="form-control" rows="6" placeholder="分享你的健康生活..."></textarea>
              <div *ngIf="isTopicFormSubmitted && tf['content'].invalid" class="form-error">
                请输入内容
              </div>
            </div>
            
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="hideAddModal()">取消</button>
          <button class="btn btn-primary" (click)="onSubmitTopic()" [disabled]="isSubmittingTopic">
            {{ isSubmittingTopic ? '发布中...' : '发布话题' }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="showTopicDetail" class="modal-overlay" (click)="hideTopicDetail()">
      <div class="modal modal-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">话题详情</h3>
          <button class="modal-close" (click)="hideTopicDetail()">&times;</button>
        </div>
        
        <div *ngIf="selectedTopic" class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <div class="d-flex align-items-start" style="gap: 16px; margin-bottom: 20px;">
            <div class="avatar" [style.background]="getAvatarColor(selectedTopic.user?.username)">
              {{ getInitial(selectedTopic.user?.nickname || selectedTopic.user?.username) }}
            </div>
            <div>
              <div class="fw-bold" style="font-size: 15px;">
                {{ selectedTopic.user?.nickname || selectedTopic.user?.username }}
              </div>
              <div class="text-muted" style="font-size: 12px;">
                {{ formatDate(selectedTopic.createdAt) }}
              </div>
            </div>
          </div>
          
          <h2 style="font-size: 20px; margin-bottom: 16px; font-weight: 700;">
            {{ selectedTopic.title }}
          </h2>
          
          <p style="white-space: pre-wrap; line-height: 1.8; color: var(--text-primary); margin-bottom: 24px;">
            {{ selectedTopic.content }}
          </p>
          
          <div class="d-flex align-items-center" style="gap: 24px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);">
            <button 
              class="action-btn" 
              [class.liked]="selectedTopic.isLikedByCurrentUser"
              (click)="toggleLikeDetail()"
            >
              <span>{{ selectedTopic.isLikedByCurrentUser ? '❤️' : '🤍' }}</span>
              <span>{{ selectedTopic.likeCount || 0 }} 赞</span>
            </button>
            <span style="color: var(--text-secondary);">
              💬 {{ selectedTopic.commentCount || 0 }} 评论
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">发表评论</label>
            <div class="d-flex" style="gap: 12px;">
              <input 
                type="text" 
                [(ngModel)]="newComment" 
                class="form-control" 
                placeholder="写下你的评论..."
                (keyup.enter)="submitComment()"
              >
              <button class="btn btn-primary" (click)="submitComment()" [disabled]="!newComment.trim() || isSubmittingComment">
                发送
              </button>
            </div>
          </div>

          <div *ngIf="selectedTopic.comments && selectedTopic.comments.length > 0">
            <h4 style="margin-bottom: 16px; font-weight: 600;">全部评论 ({{ selectedTopic.comments.length }})</h4>
            <div *ngFor="let comment of selectedTopic.comments" class="comment-item">
              <div class="d-flex align-items-start" style="gap: 12px;">
                <div class="avatar avatar-small" [style.background]="getAvatarColor(comment.user?.username)">
                  {{ getInitial(comment.user?.nickname || comment.user?.username) }}
                </div>
                <div class="flex-1" style="flex: 1;">
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="fw-bold" style="font-size: 14px;">
                      {{ comment.user?.nickname || comment.user?.username }}
                    </span>
                    <span class="text-muted" style="font-size: 12px;">
                      {{ formatDate(comment.createdAt) }}
                    </span>
                  </div>
                  <p style="margin: 8px 0 0 0; color: var(--text-primary);">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="!selectedTopic.comments || selectedTopic.comments.length === 0" class="empty-state" style="padding: 20px;">
            <div class="empty-state-text">暂无评论，快来抢沙发吧！</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      padding: 20px 0;
    }
    
    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    
    .page-subtitle {
      font-size: 14px;
      margin: 0;
    }
    
    .topic-card {
      border: none;
    }
    
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      color: white;
      flex-shrink: 0;
    }
    
    .avatar-small {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }
    
    .topic-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: var(--text-primary);
    }
    
    .topic-title:hover {
      color: var(--macaron-pink);
    }
    
    .topic-content {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--bg-primary);
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text-secondary);
      transition: all 0.3s ease;
    }
    
    .action-btn:hover {
      background: var(--macaron-light-pink);
      color: var(--macaron-pink);
    }
    
    .action-btn.liked {
      background: #FFE4E1;
      color: #FF6B81;
    }
    
    .modal-large {
      max-width: 700px;
    }
    
    .hot-topic-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .hot-topic-item:last-child {
      border-bottom: none;
    }
    
    .hot-number {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      background: var(--bg-primary);
      color: var(--text-secondary);
    }
    
    .hot-number.hot-top {
      background: var(--macaron-pink);
      color: white;
    }
    
    .hot-title {
      font-size: 14px;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .my-topic-item {
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .my-topic-item:last-child {
      border-bottom: none;
    }
    
    .my-topic-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .my-topic-meta {
      font-size: 12px;
      display: flex;
      gap: 16px;
    }
    
    .comment-item {
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .comment-item:last-child {
      border-bottom: none;
    }
    
    .flex-1 {
      flex: 1;
    }
    
    @media (max-width: 992px) {
      .col {
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }
    }
  `]
})
export class TopicsComponent implements OnInit {
  topics: Topic[] = [];
  myTopics: Topic[] = [];
  selectedTopic: Topic | null = null;
  currentPage = 0;
  pageSize = 10;
  hasMore = true;
  isLoading = false;
  isLoadingMore = false;
  
  showAddTopicModal = false;
  showTopicDetail = false;
  topicForm: FormGroup;
  isTopicFormSubmitted = false;
  isSubmittingTopic = false;
  isSubmittingComment = false;
  errorMessage = '';
  newComment = '';
  
  currentUser: any;
  private avatarColors = [
    '#FF91A4', '#7ED97E', '#87CEEB', '#DDA0DD',
    '#F0E68C', '#FFA07A', '#20B2AA', '#FFB6C1'
  ];

  constructor(
    private fb: FormBuilder,
    private topicService: TopicService,
    private route: ActivatedRoute
  ) {
    this.topicForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
    
    this.loadTopics();
    this.loadMyTopics();
    
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') {
        this.showAddModal();
      }
    });
  }

  get tf() { return this.topicForm.controls; }

  loadTopics(): void {
    this.isLoading = true;
    this.currentPage = 0;
    this.topics = [];
    
    this.topicService.getPublicTopics(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.topics = response.data.content || [];
          this.hasMore = this.currentPage < (response.data.totalPages || 1) - 1;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMore) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    this.topicService.getPublicTopics(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const newTopics = response.data.content || [];
          this.topics = [...this.topics, ...newTopics];
          this.hasMore = this.currentPage < (response.data.totalPages || 1) - 1;
        }
        this.isLoadingMore = false;
      },
      error: () => {
        this.isLoadingMore = false;
      }
    });
  }

  loadMyTopics(): void {
    this.topicService.getMyTopics().subscribe({
      next: (response) => {
        if (response.success) {
          this.myTopics = response.data || [];
        }
      }
    });
  }

  showAddModal(): void {
    this.topicForm.reset({ title: '', content: '' });
    this.isTopicFormSubmitted = false;
    this.errorMessage = '';
    this.showAddTopicModal = true;
  }

  hideAddModal(): void {
    this.showAddTopicModal = false;
  }

  viewTopic(topic: Topic): void {
    this.selectedTopic = { ...topic };
    this.newComment = '';
    
    this.topicService.getTopicById(topic.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedTopic = response.data;
        }
      }
    });
    
    this.showTopicDetail = true;
  }

  hideTopicDetail(): void {
    this.showTopicDetail = false;
    this.selectedTopic = null;
  }

  onSubmitTopic(): void {
    this.isTopicFormSubmitted = true;
    this.errorMessage = '';

    if (this.topicForm.invalid) {
      return;
    }

    this.isSubmittingTopic = true;
    const { title, content } = this.topicForm.value;

    this.topicService.create({ title, content }).subscribe({
      next: (response) => {
        if (response.success) {
          this.hideAddModal();
          this.loadTopics();
          this.loadMyTopics();
        } else {
          this.errorMessage = response.message;
        }
        this.isSubmittingTopic = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || '发布失败';
        this.isSubmittingTopic = false;
      }
    });
  }

  deleteTopic(topic: Topic): void {
    if (!confirm('确定要删除这个话题吗？')) return;
    
    this.topicService.delete(topic.id).subscribe({
      next: () => {
        this.loadTopics();
        this.loadMyTopics();
      }
    });
  }

  toggleLike(topic: Topic): void {
    this.topicService.toggleLike(topic.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          topic.isLikedByCurrentUser = response.data.isLiked;
          topic.likeCount = response.data.likeCount;
        }
      }
    });
  }

  toggleLikeDetail(): void {
    if (!this.selectedTopic) return;
    
    this.topicService.toggleLike(this.selectedTopic.id).subscribe({
      next: (response) => {
        if (response.success && response.data && this.selectedTopic) {
          this.selectedTopic.isLikedByCurrentUser = response.data.isLiked;
          this.selectedTopic.likeCount = response.data.likeCount;
          
          const listTopic = this.topics.find(t => t.id === this.selectedTopic!.id);
          if (listTopic) {
            listTopic.isLikedByCurrentUser = response.data.isLiked;
            listTopic.likeCount = response.data.likeCount;
          }
        }
      }
    });
  }

  submitComment(): void {
    if (!this.selectedTopic || !this.newComment.trim() || this.isSubmittingComment) return;
    
    this.isSubmittingComment = true;
    
    this.topicService.addComment(this.selectedTopic.id, this.newComment.trim()).subscribe({
      next: (response) => {
        if (response.success && response.data && this.selectedTopic) {
          if (!this.selectedTopic.comments) {
            this.selectedTopic.comments = [];
          }
          this.selectedTopic.comments.unshift(response.data);
          this.selectedTopic.commentCount = (this.selectedTopic.commentCount || 0) + 1;
          this.newComment = '';
          
          const listTopic = this.topics.find(t => t.id === this.selectedTopic!.id);
          if (listTopic) {
            listTopic.commentCount = (listTopic.commentCount || 0) + 1;
          }
        }
        this.isSubmittingComment = false;
      },
      error: () => {
        this.isSubmittingComment = false;
      }
    });
  }

  isMyTopic(topic: Topic): boolean {
    if (!this.currentUser || !topic.user) return false;
    return topic.user.username === this.currentUser.username;
  }

  getAvatarColor(username?: string): string {
    if (!username) return this.avatarColors[0];
    const index = username.charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  getInitial(name?: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }

  truncateContent(content: string): string {
    if (!content) return '';
    if (content.length <= 150) return content;
    return content.substring(0, 150) + '...';
  }

  truncateTitle(title: string): string {
    if (!title) return '';
    if (title.length <= 25) return title;
    return title.substring(0, 25) + '...';
  }
}
