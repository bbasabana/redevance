import { redirect } from "next/navigation";

/**
 * Secondary redirect for the secure access URL as requested by the user.
 * This ensures that if the user types /xredevance instead of /xredvance, they still reach the admin login.
 */
export default function AccessPage() {
    redirect("/x-rtnc-management-safe/login");
}
