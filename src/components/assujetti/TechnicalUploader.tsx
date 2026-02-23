"use client";

import React, { useState, useRef } from "react";
import { Upload, FileCheck, X, Loader2, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEdgeStore } from "@/lib/edgestore";

interface TechnicalUploaderProps {
    label: string;
    description?: string;
    onUpload: (url: string) => void;
    initialUrl?: string;
    accept?: string;
    className?: string;
}

export function TechnicalUploader({
    label,
    description,
    onUpload,
    initialUrl,
    accept = ".pdf,.jpg,.jpeg,.png",
    className
}: TechnicalUploaderProps) {
    const { edgestore } = useEdgeStore();
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileUrl, setFileUrl] = useState(initialUrl || "");
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setFileName(file.name);
            setIsUploading(true);
            setProgress(0);

            const res = await edgestore.profileDocuments.upload({
                file,
                onProgressChange: (progress) => {
                    setProgress(progress);
                },
            });

            setFileUrl(res.url);
            onUpload(res.url);
        } catch (error) {
            console.error("Upload failed", error);
            // Handle error UI if needed
        } finally {
            setIsUploading(false);
        }
    };

    const clearFile = () => {
        setFileUrl("");
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onUpload("");
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                {fileUrl && (
                    <button
                        type="button"
                        onClick={clearFile}
                        className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Retirer
                    </button>
                )}
            </div>

            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                    "relative overflow-hidden group border-2 border-dashed rounded-lg transition-all cursor-pointer",
                    fileUrl ? "bg-emerald-50/30 border-emerald-200" : "bg-slate-50 border-slate-200 hover:border-[#0d2870]/30 hover:bg-white",
                    isUploading && "cursor-wait opacity-80"
                )}
            >
                {/* Dot Grid Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />

                <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                    {isUploading ? (
                        <>
                            <div className="relative">
                                <Loader2 className="w-8 h-8 text-[#0d2870] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[8px] font-black text-[#0d2870]">{progress}%</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-[#0d2870] uppercase tracking-widest">Téléversement Sécurisé...</p>
                                <p className="text-[9px] text-slate-400 font-bold max-w-[150px] truncate">{fileName}</p>
                            </div>
                        </>
                    ) : fileUrl ? (
                        <>
                            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                <FileCheck className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Document Validé</p>
                                <p className="text-[9px] text-emerald-600/70 font-bold max-w-[200px] truncate">{fileName || "Fichier certifié"}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 group-hover:border-[#0d2870]/20 flex items-center justify-center text-slate-400 group-hover:text-[#0d2870] transition-colors shadow-sm">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Cliquez pour scanner le document</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{description || "PDF, JPG ou PNG (MAX 5MB)"}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Technical Progress Bar */}
                {isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                        <motion.div
                            className="h-full bg-[#0d2870]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
