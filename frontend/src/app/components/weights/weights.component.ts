import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
import { WeightService, WeightRecord } from '../../services/weight.service';

@Component({
  selector: 'app-weights',
  template: `
    <div class="container mt-3 mb-4">
      <div class="page-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="page-title">⚖️ 体重记录</h1>
          <p class="page-subtitle text-muted">追踪您的体重变化趋势</p>
        </div>
        <button class="btn btn-primary" (click)="showAddModal()">
          ➕ 记录体重
        </button>
      </div>

      <div class="row mb-4">
        <div class="col" style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #E6E6FA 0%, #F3E5F5 100%);">
            <div class="stat-icon" style="background: #9C27B0; color: white;">⚖️</div>
            <div class="stat-content">
              <div class="stat-value">{{ latestWeight ? (latestWeight | number:'1.1') + ' kg' : '-' }}</div>
              <div class="stat-label">当前体重</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px;">
          <div class="stat-card card" [ngStyle]="{
            background: (weightChange || 0) <= 0 
              ? 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)' 
              : 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)'
          }">
            <div class="stat-icon" [ngStyle]="{
              background: (weightChange || 0) <= 0 ? 'var(--macaron-mint)' : 'var(--macaron-coral)',
              color: (weightChange || 0) <= 0 ? 'var(--text-primary)' : 'white'
            }">
              {{ (weightChange || 0) <= 0 ? '📉' : '📈' }}
            </div>
            <div class="stat-content">
              <div class="stat-value" [class.text-success]="(weightChange || 0) < 0" [class.text-danger]="(weightChange || 0) > 0">
                {{ weightChange !== null ? ((weightChange > 0 ? '+' : '') + (weightChange | number:'1.1') + ' kg') : '-' }}
              </div>
              <div class="stat-label">较初始体重</div>
            </div>
          </div>
        </div>
        
        <div class="col" style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px;">
          <div class="stat-card card" style="background: linear-gradient(135deg, #FFFACD 0%, #FFF8E1 100%);">
            <div class="stat-icon" style="background: #FFD700; color: white;">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ weightRecords.length }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title mb-0">📈 体重趋势图</h3>
        </div>
        <div class="card-body">
          <div *ngIf="weightRecords.length < 2" class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-text">需要至少2条体重记录才能查看趋势图</div>
          </div>
          
          <div *ngIf="weightRecords.length >= 2" class="chart-container">
            <canvas baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              [type]="lineChartType">
            </canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h3 class="card-title mb-0">📝 体重记录列表</h3>
        </div>
        <div class="card-body">
          <div *ngIf="weightRecords.length === 0" class="empty-state">
            <div class="empty-state-icon">⚖️</div>
            <div class="empty-state-text">暂无体重记录，快来记录吧！</div>
          </div>
          
          <div *ngIf="weightRecords.length > 0">
            <table class="table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 16px; text-align: left;">日期</th>
                  <th style="padding: 16px; text-align: left;">体重 (kg)</th>
                  <th style="padding: 16px; text-align: left;">体脂率 (%)</th>
                  <th style="padding: 16px; text-align: left;">肌肉量 (kg)</th>
                  <th style="padding: 16px; text-align: left;">变化</th>
                  <th style="padding: 16px; text-align: right;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of weightRecords; let i = index" 
                    style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 16px;">{{ record.recordDate }}</td>
                  <td style="padding: 16px; font-weight: 600;">{{ record.weight | number:'1.1' }}</td>
                  <td style="padding: 16px;">{{ record.bodyFat ? (record.bodyFat | number:'1.1') + '%' : '-' }}</td>
                  <td style="padding: 16px;">{{ record.muscleMass ? (record.muscleMass | number:'1.1') + ' kg' : '-' }}</td>
                  <td style="padding: 16px;">
                    <ng-container *ngIf="i < weightRecords.length - 1">
                      <span [class.text-success]="getWeightChange(record) < 0" 
                            [class.text-danger]="getWeightChange(record) > 0">
                        {{ getWeightChange(record) > 0 ? '+' : '' }}{{ getWeightChange(record) | number:'1.1' }} kg
                      </span>
                    </ng-container>
                    <span *ngIf="i === weightRecords.length - 1" class="text-muted">-</span>
                  </td>
                  <td style="padding: 16px; text-align: right;">
                    <div class="btn-group">
                      <button class="btn btn-sm btn-secondary" (click)="editWeight(record)">编辑</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteWeight(record)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showModal" class="modal-overlay" (click)="hideAddModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingWeight ? '编辑体重记录' : '记录体重' }}</h3>
          <button class="modal-close" (click)="hideAddModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="weightForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">日期 *</label>
              <input type="date" formControlName="recordDate" class="form-control">
              <div *ngIf="isFormSubmitted && f['recordDate'].invalid" class="form-error">
                请选择日期
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">体重 (kg) *</label>
              <input type="number" formControlName="weight" class="form-control" placeholder="例如：65.5" step="0.1" min="0">
              <div *ngIf="isFormSubmitted && f['weight'].invalid" class="form-error">
                请输入体重
              </div>
            </div>
            
            <div class="row" style="margin: 0 -12px;">
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">体脂率 (%)</label>
                  <input type="number" formControlName="bodyFat" class="form-control" placeholder="可选" step="0.1" min="0" max="100">
                </div>
              </div>
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">肌肉量 (kg)</label>
                  <input type="number" formControlName="muscleMass" class="form-control" placeholder="可选" step="0.1" min="0">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea formControlName="notes" class="form-control" placeholder="可选..." rows="2"></textarea>
            </div>
            
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="hideAddModal()">取消</button>
          <button class="btn btn-primary" (click)="onSubmit()" [disabled]="isSubmitting">
            {{ isSubmitting ? '保存中...' : (editingWeight ? '保存修改' : '保存记录') }}
          </button>
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
export class WeightsComponent implements OnInit {
  weightRecords: WeightRecord[] = [];
  latestWeight: number | null = null;
  weightChange: number | null = null;
  showModal = false;
  editingWeight: WeightRecord | null = null;
  weightForm: FormGroup;
  isFormSubmitted = false;
  isSubmitting = false;
  errorMessage = '';

  lineChartData: ChartConfiguration['data'] = {
    datasets: []
  };
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
        title: {
          display: true,
          text: '日期'
        }
      },
      y: {
        title: {
          display: true,
          text: '体重 (kg)'
        }
      }
    }
  };
  lineChartType: ChartType = 'line';

  constructor(
    private fb: FormBuilder,
    private weightService: WeightService,
    private route: ActivatedRoute
  ) {
    this.weightForm = this.fb.group({
      recordDate: [new Date().toISOString().split('T')[0], Validators.required],
      weight: [null, [Validators.required, Validators.min(0)]],
      bodyFat: [null],
      muscleMass: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadWeights();
    
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') {
        this.showAddModal();
      }
    });
  }

  get f() { return this.weightForm.controls; }

  loadWeights(): void {
    this.weightService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.weightRecords = response.data;
          
          if (this.weightRecords.length > 0) {
            this.latestWeight = this.weightRecords[0].weight;
            
            if (this.weightRecords.length >= 2) {
              this.weightChange = this.weightRecords[0].weight - this.weightRecords[this.weightRecords.length - 1].weight;
            }
          }
          
          this.updateChart();
        }
      }
    });
  }

  getWeightChange(record: WeightRecord): number {
    const currentIndex = this.weightRecords.indexOf(record);
    if (currentIndex < this.weightRecords.length - 1) {
      return record.weight - this.weightRecords[currentIndex + 1].weight;
    }
    return 0;
  }

  updateChart(): void {
    if (this.weightRecords.length < 2) return;
    
    const sortedRecords = [...this.weightRecords].reverse();
    
    this.lineChartData = {
      labels: sortedRecords.map(r => r.recordDate),
      datasets: [
        {
          label: '体重 (kg)',
          data: sortedRecords.map(r => r.weight),
          borderColor: '#FF91A4',
          backgroundColor: 'rgba(255, 145, 164, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FF91A4',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  }

  showAddModal(): void {
    this.editingWeight = null;
    this.weightForm.reset({
      recordDate: new Date().toISOString().split('T')[0],
      weight: null,
      bodyFat: null,
      muscleMass: null,
      notes: ''
    });
    this.isFormSubmitted = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  editWeight(record: WeightRecord): void {
    this.editingWeight = record;
    this.weightForm.patchValue({
      recordDate: record.recordDate,
      weight: record.weight,
      bodyFat: record.bodyFat,
      muscleMass: record.muscleMass,
      notes: record.notes
    });
    this.isFormSubmitted = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  hideAddModal(): void {
    this.showModal = false;
    this.editingWeight = null;
  }

  deleteWeight(record: WeightRecord): void {
    if (confirm('确定要删除这条记录吗？')) {
      this.weightService.delete(record.id!).subscribe({
        next: () => {
          this.loadWeights();
        }
      });
    }
  }

  onSubmit(): void {
    this.isFormSubmitted = true;
    this.errorMessage = '';

    if (this.weightForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const weightData = this.weightForm.value;

    if (this.editingWeight) {
      this.weightService.update(this.editingWeight.id!, weightData).subscribe({
        next: () => {
          this.hideAddModal();
          this.loadWeights();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || '操作失败';
          this.isSubmitting = false;
        }
      });
    } else {
      this.weightService.create(weightData).subscribe({
        next: () => {
          this.hideAddModal();
          this.loadWeights();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || '添加失败';
          this.isSubmitting = false;
        }
      });
    }
  }
}
