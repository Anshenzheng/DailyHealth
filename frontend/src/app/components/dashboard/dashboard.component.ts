import { Component, OnInit } from '@angular/core';
import { StatisticsService, DailyStatistics } from '../../services/statistics.service';
import { MealService, MealRecord } from '../../services/meal.service';
import { ExerciseService, ExerciseRecord } from '../../services/exercise.service';
import { WeightService, WeightRecord } from '../../services/weight.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="container mt-3 mb-4">
      <div class="page-header mb-4">
        <h1 class="page-title">欢迎回来，{{ nickname }}! 👋</h1>
        <p class="page-subtitle text-muted">今天是 {{ today | date:'yyyy年MM月dd日 EEEE' }}</p>
      </div>

      <div class="row mb-4">
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%);">
            <div class="stat-icon" style="background: var(--macaron-pink); color: white;">🍽️</div>
            <div class="stat-content">
              <div class="stat-value">{{ dailyStats?.totalCaloriesIntake || 0 }}</div>
              <div class="stat-label">今日摄入 (千卡)</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #E0FFE0 0%, #F0FFF4 100%);">
            <div class="stat-icon" style="background: var(--macaron-mint); color: var(--text-primary);">🏃</div>
            <div class="stat-content">
              <div class="stat-value">{{ dailyStats?.totalCaloriesBurned || 0 }}</div>
              <div class="stat-label">今日消耗 (千卡)</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" [ngStyle]="{
            background: (dailyStats?.calorieBalance || 0) >= 0 
              ? 'linear-gradient(135deg, #FFFACD 0%, #FFF8E1 100%)' 
              : 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)'
          }">
            <div class="stat-icon" [ngStyle]="{
              background: (dailyStats?.calorieBalance || 0) >= 0 
                ? '#FFD700' 
                : 'var(--macaron-mint)',
              color: (dailyStats?.calorieBalance || 0) >= 0 
                ? 'white' 
                : 'var(--text-primary)'
            }">⚖️</div>
            <div class="stat-content">
              <div class="stat-value" [class.text-danger]="(dailyStats?.calorieBalance || 0) > 0" [class.text-success]="(dailyStats?.calorieBalance || 0) < 0">
                {{ dailyStats?.calorieBalance || 0 > 0 ? '+' : '' }}{{ dailyStats?.calorieBalance || 0 }}
              </div>
              <div class="stat-label">热量盈亏</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #E6E6FA 0%, #F3E5F5 100%);">
            <div class="stat-icon" style="background: #9C27B0; color: white;">⚖️</div>
            <div class="stat-content">
              <div class="stat-value">{{ latestWeight ? (latestWeight | number:'1.1') + ' kg' : '-' }}</div>
              <div class="stat-label">当前体重</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col" style="flex: 0 0 66.666%; max-width: 66.666%; padding: 0 12px;">
          <div class="card mb-4">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h3 class="card-title mb-0">📅 今日饮食</h3>
              <button class="btn btn-sm btn-primary" routerLink="/meals">
                查看全部
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="todayMeals.length === 0" class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div class="empty-state-text">今天还没有记录饮食哦~</div>
              </div>
              
              <div *ngIf="todayMeals.length > 0">
                <div *ngFor="let meal of todayMeals" class="meal-item">
                  <div class="meal-left">
                    <span class="tag tag-{{ meal.mealType.toLowerCase() }}">
                      {{ getMealTypeLabel(meal.mealType) }}
                    </span>
                    <span class="meal-name">{{ meal.foodName }}</span>
                  </div>
                  <span class="meal-calories">{{ meal.calories }} 千卡</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h3 class="card-title mb-0">🏃 今日运动</h3>
              <button class="btn btn-sm btn-success" routerLink="/exercises">
                查看全部
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="todayExercises.length === 0" class="empty-state">
                <div class="empty-state-icon">🏃</div>
                <div class="empty-state-text">今天还没有运动记录~</div>
              </div>
              
              <div *ngIf="todayExercises.length > 0">
                <div *ngFor="let exercise of todayExercises" class="exercise-item">
                  <div class="exercise-left">
                    <span class="tag tag-{{ exercise.exerciseType.toLowerCase() }}">
                      {{ getExerciseTypeLabel(exercise.exerciseType) }}
                    </span>
                    <span class="exercise-name">{{ exercise.exerciseName }}</span>
                    <span class="exercise-duration">{{ exercise.duration }} 分钟</span>
                  </div>
                  <span class="exercise-calories">{{ exercise.caloriesBurned }} 千卡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col" style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px;">
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title mb-0">🎯 快速操作</h3>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <button class="quick-action-btn" routerLink="/meals" [queryParams]="{ add: 'true' }">
                  <span class="quick-action-icon">🍽️</span>
                  <span class="quick-action-text">记录饮食</span>
                </button>
                <button class="quick-action-btn" routerLink="/exercises" [queryParams]="{ add: 'true' }">
                  <span class="quick-action-icon">🏃</span>
                  <span class="quick-action-text">记录运动</span>
                </button>
                <button class="quick-action-btn" routerLink="/weights" [queryParams]="{ add: 'true' }">
                  <span class="quick-action-icon">⚖️</span>
                  <span class="quick-action-text">记录体重</span>
                </button>
                <button class="quick-action-btn" routerLink="/topics" [queryParams]="{ add: 'true' }">
                  <span class="quick-action-icon">💬</span>
                  <span class="quick-action-text">分享动态</span>
                </button>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h3 class="card-title mb-0">📊 体重趋势</h3>
              <button class="btn btn-sm btn-secondary" routerLink="/weights">
                查看详情
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="weightRecords.length < 2" class="empty-state">
                <div class="empty-state-icon">📈</div>
                <div class="empty-state-text">需要至少2条体重记录才能查看趋势</div>
              </div>
              
              <div *ngIf="weightRecords.length >= 2" class="weight-trend">
                <div class="trend-item" *ngFor="let record of recentWeights">
                  <span class="trend-date">{{ record.recordDate | date:'MM-dd' }}</span>
                  <span class="trend-weight">{{ record.weight }} kg</span>
                </div>
                
                <div class="trend-summary mt-3" *ngIf="weightChange !== null">
                  <span class="trend-label">近期变化：</span>
                  <span [class.text-success]="weightChange < 0" [class.text-danger]="weightChange > 0">
                    {{ weightChange > 0 ? '+' : '' }}{{ weightChange | number:'1.1' }} kg
                  </span>
                </div>
              </div>
            </div>
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
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    
    .page-subtitle {
      font-size: 16px;
      margin: 0;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border: none;
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .card-title {
      font-size: 18px;
      font-weight: 700;
    }
    
    .meal-item, .exercise-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--bg-primary);
      border-radius: 12px;
      margin-bottom: 12px;
    }
    
    .meal-item:last-child, .exercise-item:last-child {
      margin-bottom: 0;
    }
    
    .meal-left, .exercise-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .meal-name, .exercise-name {
      font-weight: 600;
    }
    
    .exercise-duration {
      color: var(--text-secondary);
      font-size: 13px;
    }
    
    .meal-calories, .exercise-calories {
      font-weight: 700;
      color: var(--macaron-pink);
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 12px;
      background: var(--bg-primary);
      border: 2px solid transparent;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .quick-action-btn:hover {
      background: white;
      border-color: var(--macaron-pink);
      transform: translateY(-2px);
    }
    
    .quick-action-icon {
      font-size: 32px;
    }
    
    .quick-action-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .trend-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .trend-item:last-child {
      border-bottom: none;
    }
    
    .trend-date {
      color: var(--text-secondary);
      font-size: 13px;
    }
    
    .trend-weight {
      font-weight: 600;
    }
    
    .trend-summary {
      text-align: center;
      padding: 16px;
      background: var(--bg-primary);
      border-radius: 12px;
    }
    
    .trend-label {
      color: var(--text-secondary);
    }
    
    @media (max-width: 992px) {
      .col {
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  nickname = '';
  dailyStats: DailyStatistics | null = null;
  todayMeals: MealRecord[] = [];
  todayExercises: ExerciseRecord[] = [];
  latestWeight: number | null = null;
  weightRecords: WeightRecord[] = [];
  recentWeights: WeightRecord[] = [];
  weightChange: number | null = null;

  constructor(
    private statisticsService: StatisticsService,
    private mealService: MealService,
    private exerciseService: ExerciseService,
    private weightService: WeightService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.nickname = user.nickname || user.username;
    }
    
    const todayStr = this.today.toISOString().split('T')[0];
    
    this.statisticsService.getDailyStatistics(todayStr).subscribe({
      next: (response) => {
        if (response.success) {
          this.dailyStats = response.data;
        }
      }
    });
    
    this.mealService.getByDate(todayStr).subscribe({
      next: (response) => {
        if (response.success) {
          this.todayMeals = response.data;
        }
      }
    });
    
    this.exerciseService.getByDate(todayStr).subscribe({
      next: (response) => {
        if (response.success) {
          this.todayExercises = response.data;
        }
      }
    });
    
    this.weightService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.weightRecords = response.data;
          if (this.weightRecords.length > 0) {
            this.latestWeight = this.weightRecords[0].weight;
            this.recentWeights = this.weightRecords.slice(0, 5);
            
            if (this.weightRecords.length >= 2) {
              this.weightChange = this.weightRecords[0].weight - this.weightRecords[this.weightRecords.length - 1].weight;
            }
          }
        }
      }
    });
  }

  getMealTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'BREAKFAST': '早餐',
      'LUNCH': '午餐',
      'DINNER': '晚餐',
      'SNACK': '加餐'
    };
    return labels[type] || type;
  }

  getExerciseTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CARDIO': '有氧',
      'STRENGTH': '力量',
      'FLEXIBILITY': '柔韧',
      'SPORTS': '运动',
      'OTHER': '其他'
    };
    return labels[type] || type;
  }
}
