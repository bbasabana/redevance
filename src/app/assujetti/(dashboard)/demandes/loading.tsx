import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DemandesLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-40 rounded-xl" />
            </div>

            {/* Statistics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* List Skeleton */}
            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-none shadow-sm h-24">
                        <CardContent className="p-0 flex items-center p-5 gap-6">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col items-end space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <Skeleton className="w-5 h-5 rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
