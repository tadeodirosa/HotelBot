export interface RoomTypeResponse {
  success: boolean;
  message: string;
  data?: RoomTypeData;
  errors?: string[];
}

export interface RoomTypeListResponse {
  success: boolean;
  message: string;
  data?: RoomTypeData[];
  errors?: string[];
}

export interface RoomTypeData {
  id: number;
  name: string;
  capacity: number;
  basePrice: number;
  description?: string;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
  roomCount?: number; // Número de habitaciones de este tipo
}
