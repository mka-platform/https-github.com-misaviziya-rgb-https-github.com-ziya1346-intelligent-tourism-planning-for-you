import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { CalendarDays, Users, MapPin, ArrowRight, ArrowLeft, CheckCircle, User, Phone, Mail, MapPinned } from "lucide-react";
import { locations } from "@/data/locations";
import { createBooking } from "@/services/booking.service";
import { useLanguage } from "@/i18n/language-context";
import MultiCalendarRangePicker from "./MultiCalendarRangePicker";
import {
  defaultCalendarForLanguage,
  formatDateRange as formatRange,
  type CalendarSystem,
} from "@/lib/calendar-system";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

const Booking = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { language, t } = useLanguage();

  // Form step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined
  });
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>(() =>
    defaultCalendarForLanguage(language),
  );
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");

  // Step 2 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");

  const handleStep1Continue = () => {
    if (!dateRange?.from || !dateRange?.to || !location || !guests) {
      toast.error(t("booking.errorStep1"));
      return;
    }
    setDirection(1);
    setStep(2);
  };

  const handleStep2Back = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!name || !phone || !email || !postcode) {
      toast.error(t("booking.errorStep2"));
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error(t("booking.errorStep1"));
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        locationId: location,
        guestName: name,
        email,
        phone,
        checkInDate: dateRange.from,
        checkOutDate: dateRange.to,
        guests: parseInt(guests, 10) || 1,
        notes: `Postcode: ${postcode}`,
      });
      setDirection(1);
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setDirection(-1);
    setStep(1);
    setDateRange({ from: new Date(), to: undefined });
    setLocation("");
    setGuests("");
    setName("");
    setPhone("");
    setEmail("");
    setPostcode("");
  };

  const getLocationLabel = (value: string) => {
    const loc = locations.find(l => l.id === value);
    return loc?.name || value;
  };

  const formatSelectedRange = () =>
    formatRange(dateRange?.from, dateRange?.to, language, calendarSystem);

  const guestLabel = (count: number) =>
    t(count === 1 ? "booking.guest_one" : "booking.guest_other", { count });

  return (
    <section id="booking" className="py-32 lg:py-40 bg-accent/20" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">
            {t("booking.eyebrow")}
          </span>
          <h2 className="text-2xl md:text-3xl font-light mb-4 text-foreground tracking-tight">
            {t("booking.title")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-light">
            {t("booking.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 lg:p-10 shadow-soft border border-border bg-card overflow-hidden">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/50" : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="location" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <MapPin className="h-3 w-3" />
                          {t("booking.location")}
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger id="location" className="rounded-md text-sm font-light">
                            <SelectValue placeholder={t("booking.selectLocation")} />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="guests" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <Users className="h-3 w-3" />
                          {t("booking.guests")}
                        </Label>
                        <Select value={guests} onValueChange={setGuests}>
                          <SelectTrigger id="guests" className="rounded-md text-sm font-light">
                            <SelectValue placeholder={t("booking.selectGuests")} />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((count) => (
                              <SelectItem key={count} value={String(count)}>
                                {guestLabel(count)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4">
                        <Button
                          size="default"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handleStep1Continue}
                        >
                          {t("booking.continue")}
                          <ArrowRight className="ms-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <CalendarDays className="h-3 w-3" />
                        {t("booking.dates")}
                      </Label>
                      <MultiCalendarRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        system={calendarSystem}
                        onSystemChange={setCalendarSystem}
                      />
                      {dateRange?.from && dateRange?.to && (
                        <p className="text-xs text-muted-foreground font-light mt-2 text-center" data-testid="nights-summary">
                          {t("booking.nightsSelected", {
                            count: Math.ceil(
                              (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
                            ),
                          })}
                        </p>
                      )}
                      {dateRange?.from && (
                        <p className="text-xs text-muted-foreground font-light mt-1 text-center" data-testid="date-range-label">
                          {formatSelectedRange()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="space-y-6 max-w-md mx-auto">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <User className="h-3 w-3" />
                        {t("booking.fullName")}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <Phone className="h-3 w-3" />
                        {t("booking.phone")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 7700 900000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <Mail className="h-3 w-3" />
                        {t("booking.email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
                      <Label htmlFor="postcode" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <MapPinned className="h-3 w-3" />
                        {t("booking.postcode")}
                      </Label>
                      <Input
                        id="postcode"
                        type="text"
                        placeholder="SW1A 1AA"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleStep2Back}
                      >
                        <ArrowLeft className="me-2 h-4 w-4" />
                        {t("booking.back")}
                      </Button>
                      <Button
                        size="default"
                        disabled={submitting}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleSubmit}
                      >
                        {submitting ? t("booking.submitting") : t("booking.submit")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="text-center py-8 space-y-6" data-testid="booking-success">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                    </motion.div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-light text-foreground">{t("booking.confirmed")}</h3>
                      <p className="text-sm text-muted-foreground font-light">
                        {t("booking.thankYou", { name })}
                      </p>
                    </div>

                    <div className="bg-accent/30 rounded-md p-4 max-w-sm mx-auto text-start space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("booking.summary")}</p>
                      <div className="text-sm font-light text-foreground space-y-1">
                        <p><span className="text-muted-foreground">{t("booking.summaryLocation")}</span> {getLocationLabel(location)}</p>
                        <p><span className="text-muted-foreground">{t("booking.summaryDates")}</span> {formatSelectedRange()}</p>
                        <p><span className="text-muted-foreground">{t("booking.summaryGuests")}</span> {guests}</p>
                        <p><span className="text-muted-foreground">{t("booking.summaryEmail")}</span> {email}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-light">
                      {t("booking.confirmationEmail", { email })}
                    </p>

                    <Button
                      variant="outline"
                      size="default"
                      className="rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal mt-4"
                      onClick={handleReset}
                    >
                      {t("booking.bookAnother")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
