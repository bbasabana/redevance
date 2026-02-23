import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Define professional styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: "Helvetica",
        color: "#1e293b",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottom: "2pt solid #0d2870",
        paddingBottom: 20,
        marginBottom: 25,
        alignItems: "flex-start",
    },
    headerLeft: {
        flexDirection: "column",
        width: "60%",
    },
    logo: {
        width: 120,
        marginBottom: 15,
    },
    headerRight: {
        textAlign: "right",
        width: "35%",
        alignItems: "flex-end",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#0d2870",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 10,
        color: "#64748b",
        marginTop: 4,
    },
    fiscalId: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#0d2870",
        marginTop: 5,
    },
    infoStrip: {
        flexDirection: "row",
        backgroundColor: "#0d2870",
        padding: 10,
        borderRadius: 4,
        color: "#ffffff",
        marginBottom: 20,
        justifyContent: "space-between"
    },
    infoStripItem: {
        flexDirection: "column",
    },
    infoStripLabel: {
        fontSize: 7,
        textTransform: "uppercase",
        color: "#cbd5e1",
        marginBottom: 2
    },
    infoStripValue: {
        fontSize: 11,
        fontWeight: "bold",
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#0d2870",
        textTransform: "uppercase",
        borderBottom: "1pt solid #f1f5f9",
        paddingBottom: 5,
        marginBottom: 10,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    gridItem: {
        width: "50%",
        marginBottom: 8,
    },
    label: {
        color: "#94a3b8",
        fontSize: 8,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    value: {
        fontSize: 10,
        fontWeight: "bold",
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        borderBottom: "1pt solid #cbd5e1",
        padding: 8,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1pt solid #f1f5f9",
        padding: 8,
    },
    colDesc: { flex: 3 },
    colQty: { flex: 1, textAlign: "center" },
    colPU: { flex: 1, textAlign: "right" },
    colTotal: { flex: 1, textAlign: "right" },
    summaryContainer: {
        marginTop: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    rateBox: {
        padding: 15,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        width: "40%",
    },
    totalBox: {
        padding: 15,
        backgroundColor: "#0d2870",
        borderRadius: 8,
        width: "50%",
        color: "#ffffff",
    },
    totalLabel: {
        fontSize: 8,
        textTransform: "uppercase",
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 5,
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 40,
        right: 40,
        borderTop: "1pt solid #f1f5f9",
        paddingTop: 10,
        textAlign: "center",
        fontSize: 7,
        color: "#94a3b8",
    },
    certification: {
        marginTop: 40,
        textAlign: "center",
        padding: 10,
        backgroundColor: "#ecfdf5",
        color: "#059669",
        fontSize: 8,
        fontWeight: "bold",
        borderRadius: 4,
    },
    securitySection: {
        marginTop: 30,
        padding: 15,
        border: "1pt solid #e2e8f0",
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    qrCode: {
        width: 60,
        height: 60,
    },
    securityText: {
        flex: 1,
    },
    securityTitle: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#0d2870",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    securityDesc: {
        fontSize: 7,
        color: "#64748b",
        lineHeight: 1.4,
    }
});

interface TaxNotePDFProps {
    data: {
        identifiantFiscal: string;
        sousType: string;
        pu: number;
        totalUSD: number;
        totalFC: number;
        rate: number;
        representant: string;
        adresse: string;
        location: {
            quartier: string;
            commune: string;
            ville: string;
            province: string;
        };
        rccm?: string;
        nif?: string;
        idNat?: string;
        items: Array<{ label: string; qty: number; pu: number }>;
        qrData?: string;
    };
    entityName: string;
    qrImage?: string | null;
}

export const TaxNotePDF = ({ data, entityName, qrImage }: TaxNotePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image style={styles.logo} src="/logos/logo_new.png" />
                    <Text style={styles.title}>Note de Taxation</Text>
                    <Text style={styles.subtitle}>Système Intégré de Gestion de la Redevance RTNC</Text>
                    <Text style={styles.fiscalId}>IDF: {data.identifiantFiscal}</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={{ backgroundColor: "#0d2870", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, marginBottom: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: "bold", color: "#ffffff" }}>EXERCICE {new Date().getFullYear()}</Text>
                    </View>
                    <Text style={styles.label}>Date d'émission</Text>
                    <Text style={styles.value}>{new Date().toLocaleDateString("fr-FR")}</Text>
                </View>
            </View>

            {/* Quick Identification Strip */}
            <View style={styles.infoStrip}>
                <View style={styles.infoStripItem}>
                    <Text style={styles.infoStripLabel}>RCCM</Text>
                    <Text style={styles.infoStripValue}>{data.rccm || "Non Renseigné"}</Text>
                </View>
                <View style={styles.infoStripItem}>
                    <Text style={styles.infoStripLabel}>NIF</Text>
                    <Text style={styles.infoStripValue}>{data.nif || "Non Renseigné"}</Text>
                </View>
                <View style={styles.infoStripItem}>
                    <Text style={styles.infoStripLabel}>Id. National</Text>
                    <Text style={styles.infoStripValue}>{data.idNat || "Non Renseigné"}</Text>
                </View>
                <View style={[styles.infoStripItem, { alignItems: "flex-end" }]}>
                    <Text style={styles.infoStripLabel}>Classification</Text>
                    <Text style={styles.infoStripValue}>{data.sousType.toUpperCase()}</Text>
                </View>
            </View>

            {/* Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations de l'Assujetti</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Dénomination</Text>
                        <Text style={styles.value}>{entityName}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Représentant</Text>
                        <Text style={styles.value}>{data.representant || "-"}</Text>
                    </View>
                    <View style={{ width: "100%", marginBottom: 8 }}>
                        <Text style={styles.label}>Adresse & Localisation</Text>
                        <Text style={styles.value}>
                            {data.adresse ? `${data.adresse}, ` : ""}
                            {data.location.quartier ? `Q/ ${data.location.quartier}, ` : ""}
                            C/ {data.location.commune}, {data.location.ville}, {data.location.province}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.colDesc}>DESCRIPTION DES APPAREILS</Text>
                    <Text style={styles.colQty}>QUANTITÉ</Text>
                    <Text style={styles.colPU}>P.U. (USD)</Text>
                    <Text style={styles.colTotal}>TOTAL (USD)</Text>
                </View>
                {data.items.map((item, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={styles.colDesc}>{item.label.toUpperCase()}</Text>
                        <Text style={styles.colQty}>{item.qty}</Text>
                        <Text style={styles.colPU}>{item.pu.toFixed(2)}</Text>
                        <Text style={styles.colTotal}>{(item.qty * item.pu).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.rateBox}>
                    <Text style={styles.label}>Taux du jour</Text>
                    <Text style={styles.value}>1 USD = {data.rate.toLocaleString()} FC</Text>
                    <Text style={{ marginTop: 10, fontSize: 8 }}>Total USD: {data.totalUSD.toFixed(2)} $</Text>
                </View>
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total à Payer (FC)</Text>
                    <Text style={styles.totalAmount}>{data.totalFC.toLocaleString()} FC</Text>
                </View>
            </View>

            {/* Security Section with QR Code */}
            {qrImage && (
                <View style={styles.securitySection}>
                    <Image style={styles.qrCode} src={qrImage} />
                    <View style={styles.securityText}>
                        <Text style={styles.securityTitle}>Contrôle de Validité Numérique</Text>
                        <Text style={styles.securityDesc}>
                            Cette Note de Taxation est protégée par un jeton numérique cryptographique infalsifiable.
                            Les agents de la RTNC effectuant des contrôles de terrain utilisent une application dédiée
                            pour scanner ce QR code et confirmer l'authenticité de vos déclarations et paiements.
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.certification}>
                <Text>NOTE TAXATION CERTIFIÉE PAR LE SYSTÈME NUMÉRIQUE RTNC-RAD</Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Ce document est généré de manière automatique et vaut note d'identification fiscale provisoire.
                Le paiement doit être effectué dans les délais légaux auprès des banques partenaires.
                © 2026 RTNC - Système de Gestion de la Redevance Audiovisuelle.
            </Text>
        </Page>
    </Document>
);
