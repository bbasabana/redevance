import { auth } from "@/auth";
import { db } from "@/db";
import { assujettis } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Mail, Phone, MapPin, Hash, ShieldCheck, Contact } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProfilPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [profile] = await db
        .select()
        .from(assujettis)
        .where(eq(assujettis.userId, session.user.id))
        .limit(1);

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-slate-500">Profil introuvable.</p>
            </div>
        );
    }

    const isEntreprise = profile.typePersonne === "pm";

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mon Profil</h1>
                    <p className="text-slate-500">Gérez vos informations et coordonnées.</p>
                </div>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary/5">
                    Demander une modification
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Informations de Base */}
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {isEntreprise ? <Building2 className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-primary" />}
                            Informations Générales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Type de Compte</p>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {isEntreprise ? "Personne Morale (Entreprise)" : "Personne Physique (Particulier)"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                                {isEntreprise ? "Raison Sociale" : "Nom Complet"}
                            </p>
                            <p className="font-semibold text-slate-900">{profile.nomRaisonSociale}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Numéro d'Identification Fiscale (NIF)</p>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">{profile.nif || "Non renseigné"}</p>
                                {profile.nif && <ShieldCheck className="w-4 h-4 text-green-500" />}
                            </div>
                        </div>
                        {isEntreprise && (
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Numéro RCCM</p>
                                <p className="font-semibold text-slate-900">{profile.rccm || "Non renseigné"}</p>
                            </div>
                        )}
                        {isEntreprise && profile.representantLegal && (
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Représentant Légal</p>
                                <p className="font-semibold text-slate-900">{profile.representantLegal}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Coordonnées */}
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Contact className="w-5 h-5 text-primary" />
                            Coordonnées de Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Adresse Email</p>
                                <p className="font-semibold text-slate-900">{profile.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Téléphone Principal</p>
                                <p className="font-semibold text-slate-900">{profile.telephonePrincipal || "Non renseigné"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Adresse du {isEntreprise ? "Siège Social" : "Domicile"}</p>
                                <p className="font-semibold text-slate-900">{profile.adresseSiege}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
