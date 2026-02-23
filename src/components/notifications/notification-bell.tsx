"use client";

import { Bell, Info, CheckCircle2, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
    const count = unreadCount();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {count > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                            {count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
                <div className="bg-primary p-4 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <p className="text-[10px] opacity-70">{count} nouvelles notifications</p>
                    </div>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={clearAll}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((n) => (
                                <DropdownMenuItem
                                    key={n.id}
                                    className={cn(
                                        "p-4 focus:bg-slate-50 cursor-pointer transition-colors block",
                                        !n.read && "bg-primary/5"
                                    )}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                            n.type === 'info' && "bg-blue-100 text-blue-600",
                                            n.type === 'success' && "bg-emerald-100 text-emerald-600",
                                            n.type === 'warning' && "bg-amber-100 text-amber-600",
                                            n.type === 'error' && "bg-rose-100 text-rose-600",
                                        )}>
                                            {n.type === 'info' && <Info className="h-4 w-4" />}
                                            {n.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                            {n.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                            {n.type === 'error' && <XCircle className="h-4 w-4" />}
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-sm font-bold truncate">{n.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">
                                                {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {count > 0 && (
                    <div className="p-2 bg-slate-50">
                        <Button
                            variant="ghost"
                            className="w-full h-8 text-xs text-primary font-bold hover:bg-primary/5"
                            onClick={markAllAsRead}
                        >
                            Tout marquer comme lu
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
