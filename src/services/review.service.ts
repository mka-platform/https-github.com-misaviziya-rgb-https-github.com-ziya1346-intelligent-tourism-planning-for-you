import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ReviewRecord = Tables<"reviews">;

export interface CreateReviewDto {
  locationId: string;
  userName: string;
  rating: number;
  comment: string;
  language?: string;
}

export const createReview = async (dto: CreateReviewDto): Promise<void> => {
  if (!dto.locationId) throw new Error("Location is required");
  if (!dto.userName.trim()) throw new Error("Name is required");
  if (dto.rating < 1 || dto.rating > 5) throw new Error("Rating must be between 1 and 5");
  if (!dto.comment.trim()) throw new Error("Comment is required");

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("reviews").insert({
    location_id: dto.locationId,
    user_name: dto.userName.trim(),
    rating: dto.rating,
    comment: dto.comment.trim(),
    language: dto.language || "fa",
    user_id: user?.id ?? null,
  });

  if (error) throw new Error(error.message);
};

export const listReviewsByLocation = async (locationId: string): Promise<ReviewRecord[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const getAverageRating = async (locationId: string): Promise<number> => {
