import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MealService, MealRecord } from '../../services/meal.service';

@Component({
  selector: 'app-meals',
  template: `
    <div class="container mt-3 mb-4">
      <div class="page-header d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="page-title">🍽️ 饮食记录</h1>
          <p class="page-subtitle text-muted">记录您的每日饮食摄入</p>
        </div>
        <button class="btn btn-primary" (click)="showAddModal()">
          ➕ 添加记录
        </button>
      </div>

      <div class="card mb-4">
        <div class="card-body d-flex align-items-center justify-content-between flex-wrap" style="gap: 16px;">
          <div class="d-flex align-items-center" style="gap: 12px;">
            <button class="btn btn-sm btn-secondary" (click)="prevDay()">◀ 前一天</button>
            <div class="date-picker-wrapper">
              <input 
                type="date" 
                [value]="selectedDate" 
                (change)="onDateChange($event)"
                class="form-control"
                style="width: 200px;"
              >
            </div>
            <button class="btn btn-sm btn-secondary" (click)="nextDay()">后一天 ▶</button>
          </div>
          
          <div class="btn-group">
            <button class="btn btn-sm" [class.btn-primary]="dateRange === 'day'" [class.btn-secondary]="dateRange !== 'day'" (click)="setDateRange('day')">
              当日
            </button>
            <button class="btn btn-sm" [class.btn-primary]="dateRange === 'week'" [class.btn-secondary]="dateRange !== 'week'" (click)="setDateRange('week')">
              本周
            </button>
            <button class="btn btn-sm" [class.btn-primary]="dateRange === 'month'" [class.btn-secondary]="dateRange !== 'month'" (click)="setDateRange('month')">
              本月
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="totalCalories > 0" class="stat-card card mb-4" style="background: linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%);">
        <div class="card-body d-flex align-items-center justify-content-between flex-wrap" style="gap: 20px;">
          <div class="d-flex align-items-center" style="gap: 20px;">
            <div class="stat-icon" style="background: var(--macaron-pink); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              🍽️
            </div>
            <div>
              <div class="stat-value" style="font-size: 32px; font-weight: 700;">{{ totalCalories }}</div>
              <div class="stat-label" style="color: var(--text-secondary);">总热量 (千卡)</div>
            </div>
          </div>
          
          <div class="d-flex" style="gap: 32px;">
            <div *ngIf="totalProtein > 0" class="text-center">
              <div class="fw-bold" style="font-size: 20px;">{{ totalProtein }}g</div>
              <div class="text-muted" style="font-size: 12px;">蛋白质</div>
            </div>
            <div *ngIf="totalCarbs > 0" class="text-center">
              <div class="fw-bold" style="font-size: 20px;">{{ totalCarbs }}g</div>
              <div class="text-muted" style="font-size: 12px;">碳水</div>
            </div>
            <div *ngIf="totalFat > 0" class="text-center">
              <div class="fw-bold" style="font-size: 20px;">{{ totalFat }}g</div>
              <div class="text-muted" style="font-size: 12px;">脂肪</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col" *ngFor="let type of mealTypes" style="flex: 1; padding: 0 12px; margin-bottom: 24px;">
          <div class="card h-100">
            <div class="card-header">
              <h3 class="card-title mb-0">{{ type.icon }} {{ type.label }}</h3>
            </div>
            <div class="card-body">
              <div *ngIf="getMealsByType(type.value).length === 0" class="empty-state" style="padding: 20px;">
                <div class="empty-state-text">暂无记录</div>
              </div>
              
              <div *ngIf="getMealsByType(type.value).length > 0">
                <div *ngFor="let meal of getMealsByType(type.value)" class="meal-item-card">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <div class="fw-semibold">{{ meal.foodName }}</div>
                      <div class="text-muted" style="font-size: 12px; margin-top: 4px;">
                        <span *ngIf="meal.protein">蛋白质 {{ meal.protein }}g</span>
                        <span *ngIf="meal.protein && meal.carbs"> | </span>
                        <span *ngIf="meal.carbs">碳水 {{ meal.carbs }}g</span>
                        <span *ngIf="(meal.protein || meal.carbs) && meal.fat"> | </span>
                        <span *ngIf="meal.fat">脂肪 {{ meal.fat }}g</span>
                      </div>
                      <div *ngIf="meal.notes" class="text-muted" style="font-size: 12px; margin-top: 4px;">
                        {{ meal.notes }}
                      </div>
                    </div>
                    <div class="d-flex align-items-center" style="gap: 8px;">
                      <span class="fw-bold text-primary">{{ meal.calories }} 千卡</span>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" (click)="editMeal(meal)">编辑</button>
                        <button class="btn btn-sm btn-danger" (click)="deleteMeal(meal)">删除</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer text-right">
              <span class="text-muted">小计：</span>
              <span class="fw-bold text-primary">{{ getTypeTotalCalories(type.value) }} 千卡</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showModal" class="modal-overlay" (click)="hideAddModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingMeal ? '编辑饮食记录' : '添加饮食记录' }}</h3>
          <button class="modal-close" (click)="hideAddModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="mealForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">日期 *</label>
              <input type="date" formControlName="recordDate" class="form-control">
              <div *ngIf="isFormSubmitted && f['recordDate'].invalid" class="form-error">
                请选择日期
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">餐次 *</label>
              <select formControlName="mealType" class="form-control">
                <option value="">请选择</option>
                <option *ngFor="let type of mealTypes" [value]="type.value">{{ type.label }}</option>
              </select>
              <div *ngIf="isFormSubmitted && f['mealType'].invalid" class="form-error">
                请选择餐次
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">食物名称 *</label>
              <input type="text" formControlName="foodName" class="form-control" placeholder="例如：米饭、鸡胸肉...">
              <div *ngIf="isFormSubmitted && f['foodName'].invalid" class="form-error">
                请输入食物名称
              </div>
            </div>
            
            <div class="row" style="margin: 0 -12px;">
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">热量 (千卡) *</label>
                  <input type="number" formControlName="calories" class="form-control" placeholder="例如：150" min="0">
                  <div *ngIf="isFormSubmitted && f['calories'].invalid" class="form-error">
                    请输入热量
                  </div>
                </div>
              </div>
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">蛋白质 (g)</label>
                  <input type="number" formControlName="protein" class="form-control" placeholder="可选" min="0">
                </div>
              </div>
            </div>
            
            <div class="row" style="margin: 0 -12px;">
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">碳水化合物 (g)</label>
                  <input type="number" formControlName="carbs" class="form-control" placeholder="可选" min="0">
                </div>
              </div>
              <div class="col" style="flex: 1; padding: 0 12px;">
                <div class="form-group">
                  <label class="form-label">脂肪 (g)</label>
                  <input type="number" formControlName="fat" class="form-control" placeholder="可选" min="0">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea formControlName="notes" class="form-control" placeholder="可选，记录其他信息..." rows="2"></textarea>
            </div>
            
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="hideAddModal()">取消</button>
          <button class="btn btn-primary" (click)="onSubmit()" [disabled]="isSubmitting">
            {{ isSubmitting ? '保存中...' : (editingMeal ? '保存修改' : '添加记录') }}
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
    
    .meal-item-card {
      padding: 16px;
      background: var(--bg-primary);
      border-radius: 12px;
      margin-bottom: 12px;
    }
    
    .meal-item-card:last-child {
      margin-bottom: 0;
    }
    
    .h-100 {
      height: 100%;
    }
    
    .text-right {
      text-align: right;
    }
    
    @media (max-width: 768px) {
      .row {
        flex-direction: column;
      }
    }
  `]
})
export class MealsComponent implements OnInit {
  selectedDate: string;
  dateRange: 'day' | 'week' | 'month' = 'day';
  meals: MealRecord[] = [];
  showModal = false;
  editingMeal: MealRecord | null = null;
  mealForm: FormGroup;
  isFormSubmitted = false;
  isSubmitting = false;
  errorMessage = '';

  mealTypes = [
    { value: 'BREAKFAST', label: '早餐', icon: '🌅' },
    { value: 'LUNCH', label: '午餐', icon: '☀️' },
    { value: 'DINNER', label: '晚餐', icon: '🌙' },
    { value: 'SNACK', label: '加餐', icon: '🍪' }
  ];

  constructor(
    private fb: FormBuilder,
    private mealService: MealService,
    private route: ActivatedRoute
  ) {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.mealForm = this.fb.group({
      recordDate: [this.selectedDate, Validators.required],
      mealType: ['', Validators.required],
      foodName: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [null],
      carbs: [null],
      fat: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadMeals();
    
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') {
        this.showAddModal();
      }
    });
  }

  get f() { return this.mealForm.controls; }

  get totalCalories(): number {
    return this.meals.reduce((sum, m) => sum + m.calories, 0);
  }

  get totalProtein(): number {
    return this.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  }

  get totalCarbs(): number {
    return this.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  }

  get totalFat(): number {
    return this.meals.reduce((sum, m) => sum + (m.fat || 0), 0);
  }

  getMealsByType(type: string): MealRecord[] {
    return this.meals.filter(m => m.mealType === type);
  }

  getTypeTotalCalories(type: string): number {
    return this.getMealsByType(type).reduce((sum, m) => sum + m.calories, 0);
  }

  loadMeals(): void {
    const date = new Date(this.selectedDate);
    let startDate, endDate;
    
    if (this.dateRange === 'day') {
      startDate = endDate = this.selectedDate;
      this.mealService.getByDate(this.selectedDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.meals = response.data;
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
      
      this.mealService.getByDateRange(startDate, endDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.meals = response.data;
          }
        }
      });
    } else {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
      
      this.mealService.getByDateRange(startDate, endDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.meals = response.data;
          }
        }
      });
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.loadMeals();
  }

  prevDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadMeals();
  }

  nextDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadMeals();
  }

  setDateRange(range: 'day' | 'week' | 'month'): void {
    this.dateRange = range;
    this.loadMeals();
  }

  showAddModal(): void {
    this.editingMeal = null;
    this.mealForm.reset({
      recordDate: this.selectedDate,
      mealType: '',
      foodName: '',
      calories: 0,
      protein: null,
      carbs: null,
      fat: null,
      notes: ''
    });
    this.isFormSubmitted = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  editMeal(meal: MealRecord): void {
    this.editingMeal = meal;
    this.mealForm.patchValue({
      recordDate: meal.recordDate,
      mealType: meal.mealType,
      foodName: meal.foodName,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      notes: meal.notes
    });
    this.isFormSubmitted = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  hideAddModal(): void {
    this.showModal = false;
    this.editingMeal = null;
  }

  deleteMeal(meal: MealRecord): void {
    if (confirm('确定要删除这条记录吗？')) {
      this.mealService.delete(meal.id!).subscribe({
        next: () => {
          this.loadMeals();
        }
      });
    }
  }

  onSubmit(): void {
    this.isFormSubmitted = true;
    this.errorMessage = '';

    if (this.mealForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const mealData = this.mealForm.value;

    if (this.editingMeal) {
      this.mealService.update(this.editingMeal.id!, mealData).subscribe({
        next: () => {
          this.hideAddModal();
          this.loadMeals();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || '操作失败';
          this.isSubmitting = false;
        }
      });
    } else {
      this.mealService.create(mealData).subscribe({
        next: () => {
          this.hideAddModal();
          this.loadMeals();
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
