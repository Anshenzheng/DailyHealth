import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="container navbar-container">
        <a routerLink="/dashboard" class="navbar-brand">
          <span class="brand-icon">🍎</span>
          <span class="brand-text">Daily Health</span>
        </a>
        
        <div class="navbar-menu">
          <a 
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="nav-link"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.label }}</span>
          </a>
        </div>
        
        <div class="navbar-user">
          <span class="user-name">{{ currentUser?.nickname || currentUser?.username }}</span>
          <button class="btn btn-sm btn-outline" (click)="logout()">
            退出登录
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%);
      box-shadow: 0 2px 20px rgba(255, 182, 193, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--border-color);
    }
    
    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
    }
    
    .brand-icon {
      font-size: 28px;
    }
    
    .brand-text {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #FF91A4 0%, #FF6B81 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .navbar-menu {
      display: flex;
      gap: 8px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .nav-link:hover {
      background: var(--macaron-light-pink);
      color: var(--macaron-pink);
    }
    
    .nav-link.active {
      background: linear-gradient(135deg, var(--macaron-pink) 0%, #FF91A4 100%);
      color: white;
    }
    
    .nav-icon {
      font-size: 16px;
    }
    
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    
    @media (max-width: 992px) {
      .nav-text {
        display: none;
      }
      
      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  currentUser: any;
  
  menuItems = [
    { label: '首页', route: '/dashboard', icon: '🏠', exact: true },
    { label: '饮食记录', route: '/meals', icon: '🍽️', exact: false },
    { label: '运动记录', route: '/exercises', icon: '🏃', exact: false },
    { label: '体重记录', route: '/weights', icon: '⚖️', exact: false },
    { label: '统计分析', route: '/statistics', icon: '📊', exact: false },
    { label: '话题广场', route: '/topics', icon: '💬', exact: false }
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
