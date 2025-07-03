import { EOrderStatus } from '@/types';

export interface OrderState {
  status: EOrderStatus;
  allowedTransitions: EOrderStatus[];
  actions: string[];
}

export const orderStateMachine: Record<EOrderStatus, OrderState> = {
  [EOrderStatus.CREATED]: {
    status: EOrderStatus.CREATED,
    allowedTransitions: [EOrderStatus.CONFIRMED, EOrderStatus.CANCELLED],
    actions: ['confirm', 'cancel']
  },
  [EOrderStatus.CONFIRMED]: {
    status: EOrderStatus.CONFIRMED,
    allowedTransitions: [EOrderStatus.DELIVERED, EOrderStatus.CANCELLED],
    actions: ['deliver', 'cancel']
  },
  [EOrderStatus.DELIVERED]: {
    status: EOrderStatus.DELIVERED,
    allowedTransitions: [],
    actions: []
  },
  [EOrderStatus.CANCELLED]: {
    status: EOrderStatus.CANCELLED,
    allowedTransitions: [],
    actions: []
  }
};

export class OrderStateMachine {
  private currentState: EOrderStatus;

  constructor(initialState: EOrderStatus) {
    this.currentState = initialState;
  }

  getCurrentState(): EOrderStatus {
    return this.currentState;
  }

  getAvailableActions(): string[] {
    return orderStateMachine[this.currentState].actions;
  }

  canTransitionTo(targetState: EOrderStatus): boolean {
    const allowedTransitions = orderStateMachine[this.currentState].allowedTransitions;
    return allowedTransitions.includes(targetState);
  }

  transition(targetState: EOrderStatus): boolean {
    if (this.canTransitionTo(targetState)) {
      this.currentState = targetState;
      return true;
    }
    return false;
  }

  getStatusInfo(): OrderState {
    return orderStateMachine[this.currentState];
  }

  // Helper methods for specific actions
  canCancel(): boolean {
    return this.canTransitionTo(EOrderStatus.CANCELLED);
  }

  canConfirm(): boolean {
    return this.canTransitionTo(EOrderStatus.CONFIRMED);
  }

  canDeliver(): boolean {
    return this.canTransitionTo(EOrderStatus.DELIVERED);
  }

  // Static method to check if transition is valid
  static isValidTransition(from: EOrderStatus, to: EOrderStatus): boolean {
    return orderStateMachine[from].allowedTransitions.includes(to);
  }

  // Static method to get all possible next states
  static getNextStates(currentState: EOrderStatus): EOrderStatus[] {
    return orderStateMachine[currentState].allowedTransitions;
  }
} 