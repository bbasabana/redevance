import { format, addDays } from "date-fns";

/**
 * Generates a unique note number based on the PRD specification:
 * NT-[YEAR]-[COMMUNE_PREFIX]-[SEQUENCE]
 */
export function generateNoteNumber(year: number, communePrefix: string, sequence: number) {
    const paddedSequence = String(sequence).padStart(4, "0");
    return `NT-${year}-${communePrefix.toUpperCase()}-${paddedSequence}`;
}

/**
 * Calculates the deadline for a note of taxation.
 * Per PRD: date_remise + 30 days.
 */
export function calculateDeadline(remiseDate: Date | string) {
    const date = typeof remiseDate === "string" ? new Date(remiseDate) : remiseDate;
    return addDays(date, 30);
}

/**
 * Formats currency values consistently.
 */
export function formatCurrency(amount: number | string) {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
}
