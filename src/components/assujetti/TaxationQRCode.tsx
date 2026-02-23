"use client";

import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface TaxationQRCodeProps {
    data: string;
    size?: number;
}

export function TaxationQRCode({ data, size = 100 }: TaxationQRCodeProps) {
    return (
        <div className="relative group p-2 bg-white rounded-xl border border-slate-100 shadow-sm inline-block">
            {/* Corner acccents for "Secret" look */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-200" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-200" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-200" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-200" />

            <div className="relative">
                <QRCodeSVG
                    value={data}
                    size={size}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                        src: "/logos/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 20,
                        width: 20,
                        excavate: true,
                    }}
                />

                {/* Overlay on hover to emphasize security */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center rounded transition-all cursor-help"
                >
                    <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                        <Lock className="w-3 h-3 text-slate-700" />
                    </div>
                </motion.div>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">Secured by RTNC</span>
            </div>
        </div>
    );
}
