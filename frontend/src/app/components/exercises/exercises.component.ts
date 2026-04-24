import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExerciseService, ExerciseRecord } from '../../services/exercise.service';

@Component({
  selector: 'app-exercises',
  template: `
    <div class="container mt-3 mb-4">
      <div class="page-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="page-title">🏃 运动记录</h1>
          <p class="page-subtitle text-muted">记录您的每日运动消耗</p>
        </div>
        <button class="btn btn-success" (click)="showAddModal()">
          ➕ 添加记录
        </button>
      </div>

      <div class="card mb-4">
        <div class="card-body d-flex align-items-center justify-content-between flex-wrap" style="gap: 16px;">
          <div class="d-flex align-items-center" style="gap: 12px;">
            <button class="btn btn-sm btn-secondary" (click)="prevDay()">◀ 前一天</button>
            <input 
              type="date" 
              [value]="selectedDate" 
              (change)="onDateChange($event)"
              class="form-control"
              style="width: 200px;"
            >
            <button class="btn btn-sm btn-secondary" (click)="nextDay()">后一天 ▶</button>
          </div>
          
          <div class="btn-group">
            <button class="btn btn-sm" [class.btn-success]="dateRange === 'day'" [class.btn-secondary]="dateRange !== 'day'" (click)="setDateRange('day')">
              当日
            </button>
            <button class="btn btn-sm" [class.btn-success]="dateRange === 'week'" [class.btn-secondary]="dateRange !== 'week'" (click)="setDateRange('week')">
              本周
            </button>
            <button class="btn btn-sm" [class.btn-success]="dateRange === 'month'" [class.btn-secondary]="dateRange !== 'month'" (click)="setDateRange('month')">
              本月
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="totalCaloriesBurned > 0 || totalDuration > 0" class="stat-card card mb-4" style="background: linear-gradient(135deg, #E0FFE0 0%, #F0FFF4 100%);">
        <div class="card-body d-flex justify-content-center" style="gap: 48px; flex-wrap: wrap;">
          <div class="text-center">
            <div class="stat-icon" style="background: var(--macaron-mint); color: var(--text-primary); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 12px;">
              🔥
            </div>
            <div class="stat-value" style="font-size: 32px; font-weight: 700;">{{ totalCaloriesBurned }}</div>
            <div class="stat-label" style="color: var(--text-secondary);">消耗热量 (千卡)</div>
          </div>
          
          <div class="text-center">
            <div class="stat-icon" style="background: var(--macaron-sky-blue); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 12px;">
              ⏱️
            </div>
            <div class="stat-value" style="font-size: 32px; font-weight: 700;">{{ totalDuration }}</div>
            <div class="stat-label" style="color: var(--text-secondary);">总时长 (分钟)</div>
          </div>
          
          <div class="text-center">
            <div class="stat-icon" style="background: var(--macaron-lavender); color: #6A1B9A; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 12px;">
              📊
            </div>
            <div class="stat-value" style="font-size: 32px; font-weight: 700;">{{ exercises.length }}</div>
            <div class="stat-label" style="color: var(--text-secondary);">运动项目</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title mb-0">运动列表</h3>
        </div>
        <div class="card-body">
          <div *ngIf="exercises.length === 0" class="empty-state">
            <div class="empty-state-icon">🏃</div>
            <div class="empty-state-text">暂无运动记录，快来记录吧！</div>
          </div>
          
          <div *ngIf="exercises.length > 0">
            <div *ngFor="let exercise of exercises" class="exercise-item-card">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-start" style="gap: 16px;">
                  <div class="exercise-icon-wrapper" [style.background]="getTypeBackground(exercise.exerciseType)">
                    <span style="font-size: 24px;">{{ getTypeIcon(exercise.exerciseType) }}</span>
                  </div>
                  <div>
                    <div class="d-flex align-items-center" style="gap: 12px;">
                      <span class="fw-semibold" style="font-size: 16px;">{{ exercise.exerciseName }}</span>
                      <span class="tag tag-{{ exercise.exerciseType.toLowerCase() }}">
                        {{ getTypeLabel(exercise.exerciseType) }}
                      </span>
                      <span class="text-muted" style="font-size: 13px;">
                        📅 {{ exercise.recordDate }}
                      </span>
                    </div>
                    <div class="d-flex align-items-center" style="gap: 24px; margin-top: 8px;">
                      <span class="text-muted">
                        ⏱️ {{ exercise.duration }} 分钟
                      </span>
                      <span class="fw-bold text-success">
                        🔥 {{ exercise.caloriesBurned }} 千卡
                      </span>
                    </div>
                    <div *ngIf="exercise.notes" class="text-muted" style="font-size: 13px; margin-top: 8px;">
                      📝 {{ exercise.notes }}
                    </div>
                  </div>
                </div>
                <div class="btn-group">
                  <button class="btn btn-sm btn-secondary" (click)="editExercise(exercise)">编辑</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteExercise(exercise)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showModal" class="modal-overlay" (click)="hideAddModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingExercise ? '编辑运动记录' : '添加运动记录' }}</h3>
          <button class="modal-close" (click)="hideAddModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="exerciseForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">日期 *</label>
              <input type="date" formControlName="recordDate" class="form-control">
              <div *ngIf="isFormSubmitted && f['recordDate'].invalid" class="form-error">
                请选择日期
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">运动类型 *</label>
              <select formControlName="exerciseType" class="form-control">
                <option value="">请选择</option>
                <option *ngFor="let type of exerciseTypes" [value]="type.value">
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
              <div *ngIf="isFormSubmitted && f['exerciseType'].invalid" class="form-error">
                请选择运动类型
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">运动名称 *</label>
              <input type="text" formControlName="exerciseName" class="form-control" placeholder="例如：跑步、游泳...">
              <div *ngIf="isFormSubmitted && f['exerciseName'].invalid" class="form-error">
                请输入运动名称
              </div>
            </div>
            
            <div class="row" style="margin: 0 -12px;">
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">时长 (分钟) *</label>
                  <input type="number" formControlName="duration" class="form-control" placeholder="例如：30" min="1">
                  <div *ngIf="isFormSubmitted && f['duration'].invalid" class="form-error">
                    请输入时长
                  </div>
                </div>
              </div>
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">消耗热量 (千卡) *</label>
                  <input type="number" formControlName="caloriesBurned" class="form-control" placeholder="例如：200" min="0">
                  <div *ngIf="isFormSubmitted && f['caloriesBurned'].invalid" class="form-error">
                    请输入消耗热量
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea formControlName="notes" class="form-control" placeholder="可选，记录运动感受..." rows="2"></textarea>
            </div>
            
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="hideAddModal()">取消</button>
          <button class="btn btn-success" (click)="onSubmit()" [disabled]="isSubmitting">
            {{ isSubmitting ? '保存中...' : (editingExercise ? '保存修改' : '添加记录') }}
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
      border: none;
    }
    
    .exercise-item-card {
      padding: 20px;
      background: var(--bg-primary);
      border-radius: 16px;
      margin-bottom: 16px;
      border: 1px solid var(--border-color);
    }
    
    .exercise-item-card:last-child {
      margin-bottom: 0;
    }
    
    .exercise-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `]
})
export class ExercisesComponent implements OnInit {
  selectedDate: string;
  dateRange: 'day' | 'week' | 'month' = 'day';
  exercises: ExerciseRecord[] = [];
  showModal = false;
  editingExercise: ExerciseRecord | null = null;
  exerciseForm: FormGroup;
  isFormSubmitted = false;
  isSubmitting = false;
  errorMessage = '';

  exerciseTypes = [
    { value: 'CARDIO', label: '有氧运动', icon: '🏃', bg: '#E0F7FA' },
    { value: 'STRENGTH', label: '力量训练', icon: '💪', bg: '#FFFDE7' },
    { value: 'FLEXIBILITY', label: '柔韧拉伸', icon: '🧘', bg: '#F3E5F5' },
    { value: 'SPORTS', label: '球类运动', icon: '⚽', bg: '#E8F5E9' },
    { value: 'OTHER', label: '其他', icon: '🎯', bg: '#F5F5F5' }
  ];

  constructor(
    private fb: FormBuilder,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute
  ) {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.exerciseForm = this.fb.group({
      recordDate: [this.selectedDate, Validators.required],
      exerciseType: ['', Validators.required],
      exerciseName: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      caloriesBurned: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadExercises();
    
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') {
        this.showAddModal();
      }
    });
  }

  get f() { return this.exerciseForm.controls; }

  get totalCaloriesBurned(): number {
    return this.exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  }

  get totalDuration(): number {
    return this.exercises.reduce((sum, e) => sum + e.duration, 0);
  }

  getTypeLabel(type: string): string {
    const t = this.exerciseTypes.find(x => x.value === type);
    return t ? t.label : type;
  }

  getTypeIcon(type: string): string {
    const t = this.exerciseTypes.find(x => x.value === type);
    return t ? t.icon : '🎯';
  }

  getTypeBackground(type: string): string {
    const t = this.exerciseTypes.find(x => x.value === type);
    return t ? t.bg : '#F5F5F5';
  }

  loadExercises(): void {
    const date = new Date(this.selectedDate);
    let startDate, endDate;
    
    if (this.dateRange === 'day') {
      this.exerciseService.getByDate(this.selectedDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.exercises = response.data;
          }
        }
      });
    } else if (this.dateRange === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      
      startDate = monday.toISOString().split('T')[0];
      endDate = sunday.toISOString().split('T')[0];
      
      this.exerciseService.getByDateRange(startDate, endDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.exercises = response.data;
          }
        }
      });
    } else {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
      
      this.exerciseService.getByDateRange(startDate, endDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.exercises = response.data;
          }
        }
      });
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.loadExercises();
  }

  prevDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadExercises();
  }

  nextDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadExercises();
  }

  setDateRange(range: 'day' | 'week' | 'month'): void {
    this.dateRange = range;
    this.loadExercises();
  }

  showAddModal(): void {
    this.editingExercise = null;
    this.exerciseForm.reset({
      recordDate: this.selectedDate,
      exerciseType: '',
      exerciseName: '',
      duration: 0,
      caloriesBurned: 0,
      notes: ''
    });
    this.isFormSubmitted = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  editExercise(exercise: ExerciseRecord): void {
    this.editingExercise = exercise;
    this.exerciseForm.patchValue({
      recordDate: exercise.recordDate,
      exerciseType: exercise.exerciseType,
      exerciseName: exercise.exerciseName,
      duration: exercise.duration,
      caloriesBurned: exercise.caloriesBurned,
      notes: exercise.notes
    });
    this.isFormSubmitted = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  hideAddModal(): void {
    this.showModal = false;
    this.editingExercise = null;
  }

  deleteExercise(exercise: ExerciseRecord): void {
    if (confirm('确定要删除这条记录吗？')) {
      this.exerciseService.delete(exercise.id!).subscribe({
        next: () => {
          this.loadExercises();
        }
      });
    }
  }

  onSubmit(): void {
    this.isFormSubmitted = true;
    this.errorMessage = '';

    if (this.exerciseForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const exerciseData = this.exerciseForm.value;

    if (this.editingExercise) {
      this.exerciseService.update(this.editingExercise.id!, exerciseData).subscribe({
        next: () => {
          this.hideAddModal();
          this.loadExercises();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || '操作失败';
          this.isSubmitting = false;
        }
      });
    } else {
      this.exerciseService.create(exerciseData).subscribe({
        next: () => {
          this.hideAddModal();
          this.loadExercises();
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
