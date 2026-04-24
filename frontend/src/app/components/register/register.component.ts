import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header text-center mb-4">
          <div class="auth-icon">🌟</div>
          <h1 class="auth-title">创建账号</h1>
          <p class="auth-subtitle text-muted">加入Daily Health，开始健康生活</p>
        </div>
        
        <div class="divider"></div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名 *</label>
            <input 
              type="text" 
              formControlName="username" 
              class="form-control"
              placeholder="3-50个字符"
            >
            <div *ngIf="isSubmitted && f['username'].invalid" class="form-error">
              <span *ngIf="f['username'].errors?.['required']">请输入用户名</span>
              <span *ngIf="f['username'].errors?.['minlength']">用户名至少3个字符</span>
              <span *ngIf="f['username'].errors?.['maxlength']">用户名最多50个字符</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">邮箱 *</label>
            <input 
              type="email" 
              formControlName="email" 
              class="form-control"
              placeholder="请输入有效邮箱"
            >
            <div *ngIf="isSubmitted && f['email'].invalid" class="form-error">
              <span *ngIf="f['email'].errors?.['required']">请输入邮箱</span>
              <span *ngIf="f['email'].errors?.['email']">请输入有效的邮箱地址</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">昵称 (可选)</label>
            <input 
              type="text" 
              formControlName="nickname" 
              class="form-control"
              placeholder="最多50个字符"
            >
            <div *ngIf="isSubmitted && f['nickname'].invalid" class="form-error">
              昵称最多50个字符
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">密码 *</label>
            <input 
              type="password" 
              formControlName="password" 
              class="form-control"
              placeholder="6-100个字符"
            >
            <div *ngIf="isSubmitted && f['password'].invalid" class="form-error">
              <span *ngIf="f['password'].errors?.['required']">请输入密码</span>
              <span *ngIf="f['password'].errors?.['minlength']">密码至少6个字符</span>
              <span *ngIf="f['password'].errors?.['maxlength']">密码最多100个字符</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">确认密码 *</label>
            <input 
              type="password" 
              formControlName="confirmPassword" 
              class="form-control"
              placeholder="请再次输入密码"
            >
            <div *ngIf="isSubmitted && f['confirmPassword'].invalid" class="form-error">
              <span *ngIf="f['confirmPassword'].errors?.['required']">请确认密码</span>
            </div>
            <div *ngIf="isSubmitted && registerForm.errors?.['passwordMismatch']" class="form-error">
              两次输入的密码不一致
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
            <span *ngIf="!isLoading">注册</span>
            <span *ngIf="isLoading">
              <span class="spinner" style="width: 20px; height: 20px; border-width: 2px; display: inline-block; margin-right: 8px;"></span>
              注册中...
            </span>
          </button>
        </form>
        
        <div class="divider"></div>
        
        <div class="auth-footer text-center">
          <p class="text-muted">已有账号？</p>
          <a routerLink="/login" class="btn btn-secondary btn-sm">立即登录</a>
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
      max-width: 480px;
      width: 100%;
      padding: 32px;
    }
    
    .auth-header {
      padding: 20px 0;
    }
    
    .auth-icon {
      font-size: 56px;
      margin-bottom: 16px;
    }
    
    .auth-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      nickname: ['', [Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { username, email, nickname, password } = this.registerForm.value;

    this.authService.register(username, email, password, nickname).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || '注册失败，请稍后重试';
        this.isLoading = false;
      }
    });
  }
}
