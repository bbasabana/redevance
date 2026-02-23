"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon manually to avoid leaflet-defaulticon-compatibility
// which conflicts with @react-pdf/renderer's internal render function
const fixLeafletIcon = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
};

interface MapContentProps {
    center: [number, number];
    markerPosition: [number, number] | null;
    onMapClick: (lat: number, lng: number) => void;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function CenterUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
}

export default function MapContent({ center, markerPosition, onMapClick }: MapContentProps) {
    useEffect(() => {
        fixLeafletIcon();
    }, []);

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%", minHeight: "300px" }}
            zoomControl
            attributionControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onMapClick={onMapClick} />
            <CenterUpdater center={center} />
            {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
    );
}
