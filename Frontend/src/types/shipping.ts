export interface ShippingSetting {
  id: number;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  isFreeShippingEnabled: boolean;
  updatedAt: string;
}

export interface UpdateShippingSettingRequest {
  freeShippingThreshold: number;
  defaultShippingFee: number;
  isFreeShippingEnabled: boolean;
}

export interface ShippingRule {
  shippingRuleId: number;
  fromLocation: string;
  toLocation: string;
  fee: number;
  estimatedDeliveryDays?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateShippingRuleRequest {
  fromLocation: string;
  toLocation: string;
  fee: number;
  estimatedDeliveryDays?: string;
  isActive: boolean;
}

export interface UpdateShippingRuleRequest extends CreateShippingRuleRequest {}

export interface CalculateShippingRequest {
  destinationAddress?: string;
  orderTotal: number;
}

export interface CalculateShippingResponse {
  shippingFee: number;
  originalFee: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  matchedRule: string;
  estimatedDeliveryDays: string;
}
