// src/app/models/asset.model.ts
export interface Asset {
  id: number;
  assetName: string;
  location: string;
  status: 'HEALTHY' | 'WARNING' | 'NEEDS_ATTEN' | 'ALERT';
}

// src/app/models/reading.model.ts
export interface Reading {
  id: number;
  sensor: {
    id: number;
    asset: Asset;
    sensorType: string;
    unit: string;
  };
  rms: number;
  temperature: number;
  timestamp: string;
}

// src/app/models/threshold.model.ts
export interface Threshold {
  id: number;
  asset: Asset;
  rmsMax: number;
  tempMax: number;
}

// src/app/models/ticket.model.ts
export interface Ticket {
  id: number;
  asset: Asset;
  issueType: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
}

// src/app/models/open-count-dto.model.ts
export interface OpenCountDto {
  assetId: number;
  assetName: string;
  openCount: number;
}

// src/app/models/page.model.ts
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
