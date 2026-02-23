"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    FileText,
    CreditCard,
    MessageSquare,
    Bell,
    PlusCircle,
    ChevronDown,
    List,
    Search,
    UserRound,
    X,
    Loader2,
    History,
    FileSearch,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { searchItems, type SearchResult } from "@/lib/actions/search-actions";

const ICON_MAP: Record<string, React.ElementType> = {
    dashboard: LayoutDashboard,
    demandes: FileText,
    notes: FileText,
    paiements: CreditCard,
    reclamations: MessageSquare,
    profil: User,
    plus: PlusCircle,
    list: List
};

type MenuItem = {
    id: string;
    title: string;
    href?: string;
    iconName: string;
    subItems?: { title: string; href: string; iconName: string }[];
};

const assujettiItems: MenuItem[] = [
    { id: "dashboard", title: "Dashboard", href: "/assujetti/dashboard", iconName: "dashboard" },
    {
        id: "demandes",
        title: "Mes Demandes",
        href: "/assujetti/demandes",
        iconName: "demandes",
    },
    { id: "notes", title: "Mes Notes", href: "/assujetti/mes-notes", iconName: "notes" },
    { id: "paiements", title: "Paiements", href: "/assujetti/paiements", iconName: "paiements" },
    { id: "reclamations", title: "Réclamations", href: "/assujetti/reclamations", iconName: "reclamations" },
];

interface TopNavProps {
    userName?: string;
    userRole?: string;
}

export function TopNav({
    userName = "Assujetti",
    userRole = "Particulier"
}: TopNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("recent_searches");
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    const addToRecent = useCallback((item: SearchResult) => {
        const newRecent = [item, ...recentSearches.filter(i => i.id !== item.id)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem("recent_searches", JSON.stringify(newRecent));
    }, [recentSearches]);

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem("recent_searches");
    };

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsLoading(true);
                const res = await searchItems(searchQuery);
                setResults(res);
                setIsLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Close search on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (item: SearchResult) => {
        addToRecent(item);
        setIsSearchOpen(false);
        setSearchQuery("");
        router.push(item.href);
    };

    return (
        <div className="hidden md:block sticky top-0 z-50 w-full bg-gradient-to-r from-red-50/90 via-white/80 to-red-50/90 backdrop-blur-xl border-b border-red-100/50">
            <div className="px-8 max-w-[1600px] mx-auto flex items-center justify-between h-20">

                {/* Logo & Main Nav */}
                <div className="flex items-center gap-12">
                    <Link href="/assujetti/dashboard" className="flex items-center">
                        <Image src="/logos/logo.png" alt="RTNC" width={160} height={60} className="object-contain h-14 w-auto" />
                    </Link>

                    <nav className="flex items-center gap-1">
                        {assujettiItems.map((item) => {
                            let Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                            const active = pathname === item.href;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href || "#"}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 relative",
                                        active
                                            ? "bg-[#003d7b] text-white shadow-md shadow-blue-900/10"
                                            : "text-slate-500 hover:text-[#003d7b] hover:bg-slate-100"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.title}
                                    {active && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 bg-[#003d7b] rounded-xl -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">

                    {/* Interactive Search */}
                    <div className="relative" ref={searchRef}>
                        <button
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen);
                                if (!isSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                isSearchOpen
                                    ? "bg-[#003d7b] text-white shadow-md shadow-blue-900/10"
                                    : "bg-slate-100 text-slate-500 hover:text-[#003d7b] hover:bg-slate-200"
                            )}>
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute top-14 right-0 w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 p-4 z-50 overflow-hidden"
                                >
                                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 transition-all border border-slate-200">
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 text-[#003d7b] animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4 text-slate-400" />
                                        )}
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher une demande, une note..."
                                            className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent text-sm font-bold w-full placeholder:text-slate-400 text-slate-900 ml-3"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                                                <X className="w-3.5 h-3.5 text-slate-400" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {searchQuery.length < 2 ? (
                                            // Recent Searches
                                            recentSearches.length > 0 ? (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                        <div className="flex items-center gap-2">
                                                            <History className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recherches Récentes</span>
                                                        </div>
                                                        <button onClick={clearRecent} className="text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest">Effacer</button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {recentSearches.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => handleResultClick(item)}
                                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                                        item.type === "declaration" ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                                                                    )}>
                                                                        {item.type === "declaration" ? <FileSearch className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="text-sm font-bold text-slate-700 group-hover:text-[#003d7b]">{item.title}</p>
                                                                        <p className="text-[10px] text-slate-400 font-medium">{item.subtitle} • {item.date}</p>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#003d7b] transition-transform group-hover:translate-x-0.5" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center bg-slate-50/50 rounded-2xl">
                                                    <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-sm font-bold text-slate-400">Commencez à taper pour rechercher</p>
                                                </div>
                                            )
                                        ) : results.length > 0 ? (
                                            // Search Results
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Résultats de recherche</p>
                                                {results.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleResultClick(item)}
                                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                                item.type === "declaration" ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                                                            )}>
                                                                {item.type === "declaration" ? <FileSearch className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-bold text-slate-700 group-hover:text-[#003d7b] transition-colors">{item.title}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.subtitle}</p>
                                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                    <span className={cn(
                                                                        "text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider",
                                                                        item.status === "validee" || item.status === "payee" ? "bg-emerald-100 text-emerald-600" :
                                                                            item.status === "soumise" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                                                                    )}>
                                                                        {item.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#003d7b] transition-transform group-hover:translate-x-0.5" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : !isLoading ? (
                                            // No Results
                                            <div className="py-12 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                    <FileSearch className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 mb-1">Aucun résultat trouvé</p>
                                                <p className="text-xs text-slate-400">Essayez une autre recherche ou vérifiez l&apos;orthographe</p>
                                            </div>
                                        ) : (
                                            // Loading Skeletons
                                            <div className="space-y-2 py-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                                                        <div className="flex-1">
                                                            <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                                                            <div className="h-2 bg-slate-50 rounded w-1/3" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#003d7b] hover:bg-slate-200 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="h-10 pl-3 pr-2 bg-[#003d7b] rounded-xl flex items-center gap-3 group cursor-pointer hover:bg-[#002b5e] transition-all shadow-md shadow-blue-900/10">
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black text-white leading-none capitalize">{userName.toLowerCase()}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{userRole}</span>
                        </div>
                        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                            <UserRound className="w-4 h-4 text-white" />
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
