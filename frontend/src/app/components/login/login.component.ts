import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header text-center mb-4">
          <div class="auth-icon">🍎</div>
          <h1 class="auth-title">Daily Health</h1>
          <p class="auth-subtitle text-muted">个人健康饮食记录系统</p>
        </div>
        
        <div class="divider"></div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              type="text" 
              formControlName="username" 
              class="form-control"
              placeholder="请输入用户名"
              [class.form-error]="isSubmitted && f['username'].invalid"
            >
            <div *ngIf="isSubmitted && f['username'].invalid" class="form-error">
              请输入用户名
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              type="password" 
              formControlName="password" 
              class="form-control"
              placeholder="请输入密码"
              [class.form-error]="isSubmitted && f['password'].invalid"
            >
            <div *ngIf="isSubmitted && f['password'].invalid" class="form-error">
              请输入密码
            </div>
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-lg w-100"
            [disabled]="isLoading"
          >
            <span *ngIf="!isLoading">登录</span>
            <span *ngIf="isLoading">
              <span class="spinner" style="width: 20px; height: 20px; border-width: 2px; display: inline-block; margin-right: 8px;"></span>
              登录中...
            </span>
          </button>
        </form>
        
        <div class="divider"></div>
        
        <div class="auth-footer text-center">
          <p class="text-muted">还没有账号？</p>
          <a routerLink="/register" class="btn btn-secondary btn-sm">立即注册</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F5 50%, #F5FFFA 100%);
    }
    
    .auth-card {
      max-width: 420px;
      width: 100%;
      padding: 32px;
    }
    
    .auth-header {
      padding: 20px 0;
    }
    
    .auth-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .auth-title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #FF91A4 0%, #FF6B81 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
    }
    
    .auth-subtitle {
      font-size: 14px;
      margin: 0;
    }
    
    .auth-footer {
      padding-top: 8px;
    }
    
    .auth-footer p {
      margin-bottom: 12px;
    }
    
    .w-100 {
      width: 100%;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        if (response.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || '登录失败，请稍后重试';
        this.isLoading = false;
      }
    });
  }
}
