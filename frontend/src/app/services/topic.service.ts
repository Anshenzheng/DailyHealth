import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Topic {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar?: string;
  };
  likeCount: number;
  commentCount: number;
  comments?: Comment[];
  isLikedByCurrentUser?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar?: string;
  };
}

export interface TopicPage {
  content: Topic[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private apiUrl = 'http://localhost:8080/api/topics';

  constructor(private http: HttpClient) {}

  getPublicTopics(page: number = 0, size: number = 10): Observable<ApiResponse<TopicPage>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<TopicPage>>(`${this.apiUrl}/public/list`, { params });
  }

  getTopicById(id: number): Observable<ApiResponse<Topic>> {
    return this.http.get<ApiResponse<Topic>>(`${this.apiUrl}/public/${id}`);
  }

  getMyTopics(): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(`${this.apiUrl}/my`);
  }

  create(topic: { title: string; content: string }): Observable<ApiResponse<Topic>> {
    return this.http.post<ApiResponse<Topic>>(this.apiUrl, topic);
  }

  update(id: number, topic: { title: string; content: string }): Observable<ApiResponse<Topic>> {
    return this.http.put<ApiResponse<Topic>>(`${this.apiUrl}/${id}`, topic);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  addComment(topicId: number, content: string): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.apiUrl}/${topicId}/comments`, { content });
  }

  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/comments/${commentId}`);
  }

  toggleLike(topicId: number): Observable<ApiResponse<{ isLiked: boolean; likeCount: number }>> {
    return this.http.post<ApiResponse<{ isLiked: boolean; likeCount: number }>>(
      `${this.apiUrl}/${topicId}/like`,
      {}
    );
  }
}
