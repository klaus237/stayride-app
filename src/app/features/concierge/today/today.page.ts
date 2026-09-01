import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonIcon, IonSpinner, IonBadge,
  IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  sunnyOutline, checklistOutline, chatbubbleOutline,
  personOutline, arrowForwardOutline, alertCircleOutline,
  checkmarkCircleOutline, timeOutline, warningOutline,
} from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';
import { Task, Booking, TaskStatus, TaskPriority } from '../../../core/models';
import { AuthState } from '../../../core/auth/auth.state';

interface TodayOverview {
  checkins: Booking[];
  checkouts: Booking[];
  tasks: Task[];
  summary: { checkins: number; checkouts: number; tasks: number };
}

@Component({
  selector: 'app-concierge-today',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    IonContent, IonIcon, IonSpinner, IonBadge,
    IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="page-wrap">
        <!-- Header -->
        <div class="page-header">
          <div class="greeting">
            <div class="avatar">{{ authState.userInitials() }}</div>
            <div>
              <div class="greeting-text">
                Bonjour, {{ authState.currentUser()?.firstName }} 👋
              </div>
              <div class="date-text">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</div>
            </div>
          </div>
        </div>

        @if (isLoading()) {
          <div class="loading-center">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>
        } @else if (overview()) {
          <!-- Compteurs -->
          <div class="stats-row">
            <div class="stat-card success">
              <div class="stat-number">{{ overview()!.summary.checkins }}</div>
              <div class="stat-label">Check-ins</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-number">{{ overview()!.summary.checkouts }}</div>
              <div class="stat-label">Check-outs</div>
            </div>
            <div class="stat-card accent">
              <div class="stat-number">{{ overview()!.summary.tasks }}</div>
              <div class="stat-label">Tâches</div>
            </div>
          </div>

          <!-- Check-ins du jour -->
          @if (overview()!.checkins.length > 0) {
            <div class="section">
              <h2 class="section-title">Check-ins du jour</h2>
              @for (booking of overview()!.checkins; track booking.id) {
                <div
                  class="task-card success-border"
                  [routerLink]="['/concierge/checkin', booking.id]"
                >
                  <div class="task-left">
                    <div class="task-title">
                      Appt · Check-in
                    </div>
                    <div class="task-sub">
                      {{ booking.checkinAt | date:'HH:mm' }} · {{ booking.guestsCount }} pers.
                    </div>
                  </div>
                  <div class="task-right">
                    <span class="badge badge-success">Confirmer</span>
                    <ion-icon name="arrow-forward-outline" class="arrow"></ion-icon>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Check-outs du jour -->
          @if (overview()!.checkouts.length > 0) {
            <div class="section">
              <h2 class="section-title">Check-outs du jour</h2>
              @for (booking of overview()!.checkouts; track booking.id) {
                <div
                  class="task-card warning-border"
                  [routerLink]="['/concierge/checkout', booking.id]"
                >
                  <div class="task-left">
                    <div class="task-title">Check-out</div>
                    <div class="task-sub">
                      Départ prévu · {{ booking.guestsCount }} pers.
                    </div>
                  </div>
                  <div class="task-right">
                    <span class="badge badge-warning">À traiter</span>
                    <ion-icon name="arrow-forward-outline" class="arrow"></ion-icon>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Tâches urgentes -->
          @if (overview()!.tasks.length > 0) {
            <div class="section">
              <div class="section-header">
                <h2 class="section-title">Tâches</h2>
                <a routerLink="/concierge/tasks" class="see-all">Voir tout</a>
              </div>
              @for (task of overview()!.tasks.slice(0, 5); track task.id) {
                <div
                  class="task-card"
                  [class]="getBorderClass(task)"
                  [routerLink]="['/concierge/tasks', task.id]"
                >
                  <div class="priority-dot" [class]="getPriorityClass(task.priority)"></div>
                  <div class="task-left">
                    <div class="task-title">{{ task.title }}</div>
                    <div class="task-sub">
                      @if (task.dueAt) {
                        <ion-icon name="time-outline"></ion-icon>
                        {{ task.dueAt | date:'HH:mm' }}
                      }
                      · {{ getTypeLabel(task.type) }}
                    </div>
                  </div>
                  <div class="task-right">
                    <span class="badge" [class]="getStatusBadgeClass(task.status)">
                      {{ getStatusLabel(task.status) }}
                    </span>
                    <ion-icon name="arrow-forward-outline" class="arrow"></ion-icon>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Aucune tâche -->
          @if (overview()!.summary.checkins === 0 && overview()!.summary.checkouts === 0 && overview()!.summary.tasks === 0) {
            <div class="empty-state">
              <ion-icon name="checkmark-circle-outline" class="empty-icon"></ion-icon>
              <p>Aucune tâche pour aujourd'hui</p>
            </div>
          }
        }
      </div>

      <!-- Tab bar concierge -->
      <div class="tab-bar">
        <div class="tab-item active" routerLink="/concierge/today">
          <ion-icon name="sunny-outline"></ion-icon>
          <span>Aujourd'hui</span>
        </div>
        <div class="tab-item" routerLink="/concierge/tasks">
          <ion-icon name="checklist-outline"></ion-icon>
          <span>Tâches</span>
        </div>
        <div class="tab-item" routerLink="/app/messages">
          <ion-icon name="chatbubble-outline"></ion-icon>
          <span>Messages</span>
        </div>
        <div class="tab-item" routerLink="/app/profile">
          <ion-icon name="person-outline"></ion-icon>
          <span>Profil</span>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-wrap { padding: 0 0 80px; }
    .page-header {
      background: var(--ion-card-background, #fff);
      padding: 52px 16px 16px;
      border-bottom: 1px solid var(--ion-color-light-shade);
    }
    .greeting {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(232, 93, 36, 0.15);
      color: #E85D24;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .greeting-text { font-size: 15px; font-weight: 600; color: var(--ion-text-color); }
    .date-text { font-size: 12px; color: var(--ion-color-medium); margin-top: 2px; }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .stats-row {
      display: flex;
      gap: 10px;
      padding: 16px;
    }
    .stat-card {
      flex: 1;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .stat-card.success { background: #E8F5E9; }
    .stat-card.warning { background: #FFF8E1; }
    .stat-card.accent { background: #E3F2FD; }
    .stat-number {
      font-size: 24px;
      font-weight: 600;
      color: var(--ion-text-color);
    }
    .stat-card.success .stat-number { color: #2E7D32; }
    .stat-card.warning .stat-number { color: #F57F17; }
    .stat-card.accent .stat-number { color: #1565C0; }
    .stat-label { font-size: 11px; color: var(--ion-color-medium); margin-top: 2px; }

    .section { padding: 4px 16px 8px; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--ion-text-color);
      margin: 0 0 10px;
    }
    .see-all { font-size: 13px; color: #E85D24; text-decoration: none; }

    .task-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--ion-card-background, #fff);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 8px;
      border-left: 3px solid transparent;
      cursor: pointer;
      box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    }
    .task-card.success-border { border-left-color: #4CAF50; }
    .task-card.warning-border { border-left-color: #FF9800; }
    .task-card.danger-border { border-left-color: #F44336; }
    .task-card.accent-border { border-left-color: #2196F3; }

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .priority-dot.urgent { background: #F44336; }
    .priority-dot.high { background: #FF9800; }
    .priority-dot.medium { background: #2196F3; }
    .priority-dot.low { background: #9E9E9E; }

    .task-left { flex: 1; min-width: 0; }
    .task-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--ion-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .task-sub {
      font-size: 11px;
      color: var(--ion-color-medium);
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .task-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .arrow { font-size: 16px; color: var(--ion-color-medium); }

    .badge {
      font-size: 10px;
      font-weight: 500;
      padding: 2px 7px;
      border-radius: 20px;
    }
    .badge-success { background: #E8F5E9; color: #2E7D32; }
    .badge-warning { background: #FFF8E1; color: #F57F17; }
    .badge-danger { background: #FFEBEE; color: #C62828; }
    .badge-accent { background: #E3F2FD; color: #1565C0; }
    .badge-neutral { background: var(--ion-color-light); color: var(--ion-color-medium); }

    .empty-state {
      text-align: center;
      padding: 60px 16px;
      color: var(--ion-color-medium);
    }
    .empty-icon { font-size: 56px; color: #4CAF50; display: block; margin-bottom: 12px; }

    .tab-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      background: var(--ion-card-background, #fff);
      border-top: 1px solid var(--ion-color-light-shade);
      padding: 8px 0 env(safe-area-inset-bottom, 8px);
      z-index: 100;
    }
    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      color: var(--ion-color-medium);
      cursor: pointer;
      padding: 4px 0;
    }
    .tab-item ion-icon { font-size: 22px; }
    .tab-item.active { color: #E85D24; }
  `],
})
export class TodayPage implements OnInit {
  private readonly api = inject(ApiService);
  readonly authState = inject(AuthState);

  today = new Date();
  isLoading = signal(true);
  overview = signal<TodayOverview | null>(null);

  constructor() {
    addIcons({
      sunnyOutline, checklistOutline, chatbubbleOutline,
      personOutline, arrowForwardOutline, alertCircleOutline,
      checkmarkCircleOutline, timeOutline, warningOutline,
    });
  }

  async ngOnInit() {
    await this.loadOverview();
  }

  async loadOverview() {
    this.isLoading.set(true);
    try {
      const data = await this.api.get<TodayOverview>('concierge/today');
      this.overview.set(data);
    } catch {
      this.overview.set({
        checkins: [], checkouts: [], tasks: [],
        summary: { checkins: 0, checkouts: 0, tasks: 0 },
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  async onRefresh(event: any) {
    await this.loadOverview();
    event.target.complete();
  }

  getBorderClass(task: Task): string {
    if (task.priority === TaskPriority.URGENT) return 'danger-border';
    if (task.priority === TaskPriority.HIGH) return 'warning-border';
    if (task.status === TaskStatus.DONE) return 'success-border';
    return 'accent-border';
  }

  getPriorityClass(priority: TaskPriority): string {
    return priority.toLowerCase();
  }

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      TODO: 'À faire',
      IN_PROGRESS: 'En cours',
      DONE: 'Fait ✓',
      ISSUE_REPORTED: 'Problème',
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      TODO: 'badge badge-accent',
      IN_PROGRESS: 'badge badge-warning',
      DONE: 'badge badge-success',
      ISSUE_REPORTED: 'badge badge-danger',
    };
    return classes[status] || 'badge badge-neutral';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CHECKIN: 'Check-in',
      CHECKOUT: 'Check-out',
      CLEANING: 'Nettoyage',
      INSPECTION: 'Inspection',
      MAINTENANCE: 'Maintenance',
      OTHER: 'Autre',
    };
    return labels[type] || type;
  }
}
