export interface RoomResponse {
  success: boolean;
  message: string;
  data?: RoomData;
  errors?: string[];
}

export interface RoomListResponse {
  success: boolean;
  message: string;
  data?: RoomData[];
  errors?: string[];
}

export interface RoomData {
  id: number;
  name: string;
  floor?: number;
  status: string;
  roomType: {
    id: number;
    name: string;
    capacity: number;
    basePrice: number;
  };
  createdAt: Date;
  updatedAt: Date;
  hasActiveReservations?: boolean;
}
