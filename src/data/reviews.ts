export interface Review {
  id: string;
  locationId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  language?: string;
}

export const reviews: Review[] = [
  {
    id: "r1",
    locationId: "lake-house",
    userName: "سارا م.",
    rating: 5,
    comment: "تجربه فوق‌العاده‌ای بود. طبیعت بکر و آرامش کامل.",
    createdAt: "2026-07-12",
    language: "fa",
  },
  {
    id: "r2",
    locationId: "forest-cabin",
    userName: "Ali R.",
    rating: 4,
    comment: "Great place for stargazing. Highly recommended.",
    createdAt: "2026-06-28",
    language: "en",
  },
];

export const getReviewsByLocation = (locationId: string) =>
  reviews.filter((r) => r.locationId === locationId);

export const getAverageRating = (locationId: string) => {
  const list = getReviewsByLocation(locationId);
  if (list.length === 0) return 0;
  return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
};
