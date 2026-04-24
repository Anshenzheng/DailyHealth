import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { StatisticsService, DailyStatistics, SummaryStatistics } from '../../services/statistics.service';

@Component({
  selector: 'app-statistics',
  template: `
    <div class="container mt-3 mb-4">
      <div class="page-header mb-4">
        <h1 class="page-title">📊 统计分析</h1>
        <p class="page-subtitle text-muted">查看您的热量摄入与消耗趋势</p>
      </div>

      <div class="card mb-4">
        <div class="card-body d-flex align-items-center justify-content-between flex-wrap" style="gap: 16px;">
          <div class="d-flex align-items-center" style="gap: 12px;">
            <button class="btn btn-sm btn-secondary" (click)="prevPeriod()">◀ 上一期</button>
            <span style="font-weight: 600; min-width: 200px; text-align: center;">
              {{ currentPeriodLabel }}
            </span>
            <button class="btn btn-sm btn-secondary" (click)="nextPeriod()">下一期 ▶</button>
          </div>
          
          <div class="btn-group">
            <button class="btn btn-sm" [class.btn-primary]="viewMode === 'week'" [class.btn-secondary]="viewMode !== 'week'" (click)="setViewMode('week')">
              周视图
            </button>
            <button class="btn btn-sm" [class.btn-primary]="viewMode === 'month'" [class.btn-secondary]="viewMode !== 'month'" (click)="setViewMode('month')">
              月视图
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="summaryStats" class="row mb-4">
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%);">
            <div class="stat-icon" style="background: var(--macaron-pink); color: white;">🍽️</div>
            <div class="stat-content">
              <div class="stat-value">{{ summaryStats.totalIntake }}</div>
              <div class="stat-label">总摄入 (千卡)</div>
              <div class="text-muted" style="font-size: 12px;">日均: {{ summaryStats.avgIntake }}</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #E0FFE0 0%, #F0FFF4 100%);">
            <div class="stat-icon" style="background: var(--macaron-mint); color: var(--text-primary);">🏃</div>
            <div class="stat-content">
              <div class="stat-value">{{ summaryStats.totalBurned }}</div>
              <div class="stat-label">总消耗 (千卡)</div>
              <div class="text-muted" style="font-size: 12px;">日均: {{ summaryStats.avgBurned }}</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 1; padding: 0 12px;">
          <div class="stat-card card" [ngStyle]="{
            background: (summaryStats.totalBalance || 0) >= 0 
              ? 'linear-gradient(135deg, #FFFACD 0%, #FFF8E1 100%)' 
              : 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)'
          }">
            <div class="stat-icon" [ngStyle]="{
              background: (summaryStats.totalBalance || 0) >= 0 ? '#FFD700' : 'var(--macaron-mint)',
              color: (summaryStats.totalBalance || 0) >= 0 ? 'white' : 'var(--text-primary)'
            }">⚖️</div>
            <div class="stat-content">
              <div class="stat-value" [class.text-danger]="(summaryStats.totalBalance || 0) > 0" [class.text-success]="(summaryStats.totalBalance || 0) < 0">
                {{ summaryStats.totalBalance > 0 ? '+' : '' }}{{ summaryStats.totalBalance }}
              </div>
              <div class="stat-label">热量盈亏 (千卡)</div>
              <div class="text-muted" style="font-size: 12px;">
                {{ summaryStats.daysWithRecords }} 天有记录
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title mb-0">📈 热量趋势图</h3>
        </div>
        <div class="card-body">
          <div *ngIf="!dailyStats || dailyStats.length === 0" class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-text">暂无数据，请先记录饮食和运动</div>
          </div>
          
          <div *ngIf="dailyStats && dailyStats.length > 0" class="chart-container">
            <canvas baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              [type]="lineChartType">
            </canvas>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title mb-0">📊 热量盈亏对比</h3>
        </div>
        <div class="card-body">
          <div *ngIf="!dailyStats || dailyStats.length === 0" class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-text">暂无数据</div>
          </div>
          
          <div *ngIf="dailyStats && dailyStats.length > 0" class="chart-container">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="barChartType">
            </canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title mb-0">📋 每日详情</h3>
        </div>
        <div class="card-body">
          <div *ngIf="!dailyStats || dailyStats.length === 0" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-text">暂无数据</div>
          </div>
          
          <div *ngIf="dailyStats && dailyStats.length > 0">
            <table class="table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 16px; text-align: left;">日期</th>
                  <th style="padding: 16px; text-align: right;">摄入 (千卡)</th>
                  <th style="padding: 16px; text-align: right;">消耗 (千卡)</th>
                  <th style="padding: 16px; text-align: right;">盈亏</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let stat of dailyStats" style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 16px;">{{ stat.date }}</td>
                  <td style="padding: 16px; text-align: right; color: #FF91A4; font-weight: 600;">
                    {{ stat.totalCaloriesIntake }}
                  </td>
                  <td style="padding: 16px; text-align: right; color: #4CAF50; font-weight: 600;">
                    {{ stat.totalCaloriesBurned }}
                  </td>
                  <td style="padding: 16px; text-align: right; font-weight: 600;">
                    <span [class.text-danger]="stat.calorieBalance > 0" 
                          [class.text-success]="stat.calorieBalance < 0"
                          [class.text-muted]="stat.calorieBalance === 0">
                      {{ stat.calorieBalance > 0 ? '+' : '' }}{{ stat.calorieBalance }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
    }
    
    .stat-label {
      font-size: 13px;
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
export class StatisticsComponent implements OnInit {
  viewMode: 'week' | 'month' = 'week';
  currentDate = new Date();
  dailyStats: DailyStatistics[] = [];
  summaryStats: SummaryStatistics | null = null;

  lineChartData: ChartConfiguration['data'] = { datasets: [] };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        title: { display: true, text: '日期' }
      },
      y: {
        title: { display: true, text: '热量 (千卡)' }
      }
    }
  };
  lineChartType: ChartType = 'line';

  barChartData: ChartConfiguration['data'] = { datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        title: { display: true, text: '日期' }
      },
      y: {
        title: { display: true, text: '热量 (千卡)' }
      }
    }
  };
  barChartType: ChartType = 'bar';

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  get currentPeriodLabel(): string {
    if (this.viewMode === 'week') {
      const weekStart = new Date(this.currentDate);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
    } else {
      const month = this.currentDate.getMonth() + 1;
      const year = this.currentDate.getFullYear();
      return `${year}年${month}月`;
    }
  }

  private formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }

  setViewMode(mode: 'week' | 'month'): void {
    this.viewMode = mode;
    this.loadStatistics();
  }

  prevPeriod(): void {
    if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.loadStatistics();
  }

  nextPeriod(): void {
    if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.loadStatistics();
  }

  loadStatistics(): void {
    const date = new Date(this.currentDate);
    let startDate, endDate;
    
    if (this.viewMode === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      
      startDate = monday.toISOString().split('T')[0];
      endDate = sunday.toISOString().split('T')[0];
      
      this.statisticsService.getWeeklyStatistics(startDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.dailyStats = response.data;
            this.updateCharts();
          }
        }
      });
    } else {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
      
      this.statisticsService.getMonthlyStatistics(startDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.dailyStats = response.data;
            this.updateCharts();
          }
        }
      });
    }
    
    this.statisticsService.getSummaryStatistics(startDate, endDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.summaryStats = response.data;
        }
      }
    });
  }

  updateCharts(): void {
    if (!this.dailyStats || this.dailyStats.length === 0) return;
    
    this.lineChartData = {
      labels: this.dailyStats.map(s => s.date),
      datasets: [
        {
          label: '摄入 (千卡)',
          data: this.dailyStats.map(s => s.totalCaloriesIntake),
          borderColor: '#FF91A4',
          backgroundColor: 'rgba(255, 145, 164, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: '消耗 (千卡)',
          data: this.dailyStats.map(s => s.totalCaloriesBurned),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    this.barChartData = {
      labels: this.dailyStats.map(s => s.date),
      datasets: [
        {
          label: '摄入 (千卡)',
          data: this.dailyStats.map(s => s.totalCaloriesIntake),
          backgroundColor: 'rgba(255, 145, 164, 0.7)',
          borderColor: '#FF91A4',
          borderWidth: 1
        },
        {
          label: '消耗 (千卡)',
          data: this.dailyStats.map(s => s.totalCaloriesBurned),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#4CAF50',
          borderWidth: 1
        }
      ]
    };
  }
}
