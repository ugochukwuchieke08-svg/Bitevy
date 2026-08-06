export type Restaurant = {
  id: number;
  name: string;
};

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total: number;
  status: string;
  created_at: string;

  restaurants: Restaurant[] | null;
};

export type RiderApplication = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  bike_type: string;
  nin_number: string;
  nin_image: string;
  profile_image: string;
  status: "pending" | "active" | "rejected";
  created_at: string;
};