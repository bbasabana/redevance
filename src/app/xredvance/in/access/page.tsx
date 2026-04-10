import { redirect } from "next/navigation";

/**
 * Custom secure access URL for admin dashboard as requested by the user.
 * This route redirects to the admin login page.
 */
export default function AccessPage() {
    redirect("/x-rtnc-management-safe/login");
}
