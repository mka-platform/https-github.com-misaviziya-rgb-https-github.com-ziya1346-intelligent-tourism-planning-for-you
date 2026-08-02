// Implements SRS-HTL-01: booking persistence
// NOTE (MOS-0300 TBD): data access goes directly through the Lovable Cloud client
// pending the final ORM/repository decision.
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BookingRecord = Tables<"bookings">;

/** Request payload for creating a booking (DTO). */
export interface CreateBookingDto {
  locationId: string;
  guestName: string;
  email: string;
  phone: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  notes?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Validates a booking DTO. Returns an error message, or null when valid. */
export const validateCreateBookingDto = (dto: CreateBookingDto): string | null => {
  if (!dto.locationId) return "Please select a location";
  if (!dto.guestName.trim()) return "Please enter your full name";
  if (!EMAIL_PATTERN.test(dto.email)) return "Please enter a valid email address";
  if (!dto.phone.trim()) return "Please enter a phone number";
  if (dto.guests < 1) return "At least one guest is required";
  if (dto.checkOutDate <= dto.checkInDate) return "Check-out must be after check-in";
  return null;
};

export const createBooking = async (dto: CreateBookingDto): Promise<BookingRecord> => {
  const validationError = validateCreateBookingDto(dto);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      location_id: dto.locationId,
      guest_name: dto.guestName.trim(),
      email: dto.email.trim(),
      phone: dto.phone.trim(),
      check_in_date: toIsoDate(dto.checkInDate),
      check_out_date: toIsoDate(dto.checkOutDate),
      guests: dto.guests,
      notes: dto.notes?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const listBookings = async (): Promise<BookingRecord[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
};
