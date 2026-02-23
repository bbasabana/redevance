"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, Loader2, Check, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import (client only) — avoids SSR and leaflet window issues
const MapContent = dynamic(() => import("./MapContent"), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-slate-100" style={{ minHeight: 300 }}>
            <Loader2 className="w-8 h-8 text-[#0d2870] animate-spin" />
        </div>
    ),
});

interface MapSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string, lat?: number, lng?: number) => void;
    initialAddress?: string;
    selectedProvinceName?: string;
}

export default function MapSlideOver({ isOpen, onClose, onConfirm, initialAddress, selectedProvinceName }: MapSlideOverProps) {
    const [address, setAddress] = useState(initialAddress || "");
    const [lastGeocodedAddress, setLastGeocodedAddress] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAddress(initialAddress || "");
            setLocationError(null);
        }
    }, [isOpen, initialAddress]);

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        setIsGeocoding(true);
        setLocationError(null);
        try {
            const resp = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&addressdetails=1`,
                { headers: { "User-Agent": "RTNC-Redevance-App/1.0" } }
            );
            const data = await resp.json();
            if (data?.display_name) {
                setAddress(data.display_name);
                setLastGeocodedAddress(data.display_name);

                if (selectedProvinceName && data.address) {
                    const foundState = data.address.state || data.address.city || data.address.province || data.address.region || "";
                    const normalizedFound = foundState.toLowerCase();
                    const normalizedSelected = selectedProvinceName.toLowerCase();

                    if (normalizedFound && !normalizedFound.includes(normalizedSelected) && !normalizedSelected.includes(normalizedFound)) {
                        setLocationError(`Attention : L'adresse indiquée (via carte) semble se situer à ${foundState}, mais vous avez sélectionné la province de ${selectedProvinceName}.`);
                    }
                }
            }
        } catch {
            // silent — user can still type address manually
        } finally {
            setIsGeocoding(false);
        }
    }, [selectedProvinceName]);

    const handleLocate = useCallback(() => {
        setIsLocating(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("La géolocalisation n'est pas supportée par ce navigateur.");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoords({ lat, lng });
                setIsLocating(false);
                reverseGeocode(lat, lng);
            },
            (err) => {
                setIsLocating(false);
                if (err.code === 1) setLocationError("Autorisation refusée. Activez la localisation dans votre navigateur.");
                else if (err.code === 2) setLocationError("Impossible de déterminer votre position actuelle.");
                else setLocationError("Délai de localisation dépassé. Réessayez.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    }, [reverseGeocode]);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
    }, [reverseGeocode]);

    const handleConfirm = async () => {
        if (!address.trim() || isGeocoding) return;

        // If user manually changed the address text and we have a selected province
        if (address !== lastGeocodedAddress && selectedProvinceName) {
            setIsGeocoding(true);
            try {
                const searchQuery = `${address}, ${selectedProvinceName}, République Démocratique du Congo`;
                const resp = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
                    { headers: { "User-Agent": "RTNC-Redevance-App/1.0" } }
                );
                const data = await resp.json();

                if (data && data.length > 0) {
                    const result = data[0];
                    onConfirm(address, parseFloat(result.lat), parseFloat(result.lon));
                    setIsGeocoding(false);
                    onClose();
                    return;
                }
            } catch {
                // Ignore API error and fallback to text below
            }
            setIsGeocoding(false);
        }

        // Fallback: If map was clicked, same string, not found, or API error
        onConfirm(address, coords?.lat, coords?.lng);
        onClose();
    };

    // Default: Kinshasa center
    const center: [number, number] = coords ? [coords.lat, coords.lng] : [-4.322447, 15.322581];
    const marker: [number, number] | null = coords ? [coords.lat, coords.lng] : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm"
                    />

                    {/* Slide-over panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 250 }}
                        className="fixed right-0 top-0 bottom-0 z-[201] w-full max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-none">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#0d2870]/10 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-[#0d2870]" />
                                </div>
                                <div>
                                    <h2 className="font-black text-sm text-slate-900 uppercase tracking-tight">Localisation</h2>
                                    <p className="text-[10px] text-slate-500 font-medium">Cliquez sur la carte ou utilisez votre position</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Map Area */}
                        <div className="relative" style={{ height: 340 }}>
                            <MapContent
                                center={center}
                                markerPosition={marker}
                                onMapClick={handleMapClick}
                            />

                            {/* Locate Button - floating over map */}
                            <div className="absolute top-3 right-3 z-[500]">
                                <button
                                    onClick={handleLocate}
                                    disabled={isLocating}
                                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-lg border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#0d2870] hover:bg-[#0d2870] hover:text-white transition-all disabled:opacity-50"
                                >
                                    {isLocating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Navigation className="w-3.5 h-3.5" />
                                    )}
                                    {isLocating ? "Localisation..." : "Ma Position"}
                                </button>
                            </div>
                        </div>

                        {/* Address & Confirm */}
                        <div className="flex-1 p-4 border-t border-slate-100 space-y-3 bg-white overflow-y-auto">
                            {locationError && (
                                <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-[10px] font-medium text-red-600">{locationError}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse sélectionnée</label>
                                <div className="relative">
                                    <textarea
                                        value={isGeocoding ? "Récupération de l'adresse..." : address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Cliquez sur la carte ou utilisez votre position..."
                                        rows={3}
                                        disabled={isGeocoding}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium resize-none focus:outline-none focus:border-[#0d2870] focus:ring-1 focus:ring-[#0d2870]/20 transition-all disabled:opacity-60"
                                    />
                                    {isGeocoding && (
                                        <div className="absolute right-3 top-2.5">
                                            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {coords && (
                                    <p className="text-[9px] text-slate-400 font-medium ml-1">
                                        📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={!address.trim()}
                                className="w-full h-11 bg-[#0d2870] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                            >
                                <Check className="w-4 h-4" />
                                Confirmer l'adresse
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
