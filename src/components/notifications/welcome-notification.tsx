"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PartyPopper } from "lucide-react";

export function WelcomeNotification() {
    const searchParams = useSearchParams();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if the user just registered (based on a query param or could use session)
        if (searchParams.get("welcome") === "true") {
            setShow(true);
            toast.success("Bienvenue sur Redevance RTNC !", {
                description: "Votre compte a été créé avec succès. Découvrez votre nouvel espace.",
                icon: <PartyPopper className="h-5 w-5 text-yellow-500" />,
                duration: 5000,
            });

            // Clear the query param to avoid repeating the toast on refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
        }
    }, [searchParams]);

    return null; // This is a logic-only component that uses sonner toast
}
