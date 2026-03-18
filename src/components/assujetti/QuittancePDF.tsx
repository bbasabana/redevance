import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

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
        fontSize: 20,
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
    receiptId: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#0d2870",
        marginTop: 5,
    },
    infoStrip: {
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        padding: 10,
        borderRadius: 4,
        border: "1pt solid #e2e8f0",
        marginBottom: 20,
        justifyContent: "space-between"
    },
    infoStripItem: {
        flexDirection: "column",
    },
    infoStripLabel: {
        fontSize: 7,
        textTransform: "uppercase",
        color: "#64748b",
        marginBottom: 2
    },
    infoStripValue: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#0d2870",
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
    detailsBox: {
        padding: 15,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        border: "1pt solid #e2e8f0",
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottom: "0.5pt solid #e2e8f0",
    },
    label: {
        color: "#64748b",
        fontSize: 8,
        textTransform: "uppercase",
    },
    value: {
        fontSize: 9,
        fontWeight: "bold",
    },
    amountCard: {
        marginTop: 10,
        padding: 15,
        backgroundColor: "#0d2870",
        borderRadius: 8,
        color: "#ffffff",
        textAlign: "center",
    },
    amountLabel: {
        fontSize: 8,
        textTransform: "uppercase",
        marginBottom: 5,
    },
    amountValue: {
        fontSize: 24,
        fontWeight: "bold",
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
        marginTop: 30,
        textAlign: "center",
        padding: 10,
        backgroundColor: "#ecfdf5",
        color: "#059669",
        fontSize: 8,
        fontWeight: "bold",
        borderRadius: 4,
    },
    qrSection: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        padding: 10,
        border: "1pt dashed #cbd5e1",
        borderRadius: 4,
    },
    qrCode: {
        width: 50,
        height: 50,
    }
});

interface QuittancePDFProps {
    data: {
        nif?: string;
        rccm?: string;
        idNat?: string;
        assujettiNom: string;
        noteNumero: string;
        paiementId: string;
        montantPaye: number;
        devise: string;
        canal: string;
        reference: string;
        datePaiement: string;
        soldeRestant: number;
        exercice: number;
    };
    qrImage?: string | null;
}

export const QuittancePDF = ({ data, qrImage }: QuittancePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image style={styles.logo} src="/logos/logo_new.png" />
                    <Text style={styles.title}>Quittance de Paiement</Text>
                    <Text style={styles.subtitle}>Preuve de Règlement de la Redevance Audiovisuelle</Text>
                    <Text style={styles.receiptId}>RÉF: {data.paiementId.substring(0, 8).toUpperCase()}</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={{ backgroundColor: "#0d2870", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: "bold", color: "#ffffff" }}>EXERCICE {data.exercice}</Text>
                    </View>
                    <Text style={styles.label}>Date d'émission</Text>
                    <Text style={styles.value}>{new Date().toLocaleDateString("fr-FR")}</Text>
                </View>
            </View>

            {/* Entity Identification */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Identification de l'Assujetti</Text>
                <View style={styles.infoStrip}>
                    <View style={styles.infoStripItem}>
                        <Text style={styles.infoStripLabel}>Dénomination</Text>
                        <Text style={styles.infoStripValue}>{data.assujettiNom}</Text>
                    </View>
                    <View style={styles.infoStripItem}>
                        <Text style={styles.infoStripLabel}>RCCM / NIF</Text>
                        <Text style={styles.infoStripValue}>{data.rccm || data.nif || "-"}</Text>
                    </View>
                    <View style={[styles.infoStripItem, { alignItems: "flex-end" }]}>
                        <Text style={styles.infoStripLabel}>Réf. Note</Text>
                        <Text style={styles.infoStripValue}>{data.noteNumero}</Text>
                    </View>
                </View>
            </View>

            {/* Payment Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Détails de la Transaction</Text>
                <View style={styles.detailsBox}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Canal de Paiement</Text>
                        <Text style={styles.value}>{data.canal.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Référence Transaction</Text>
                        <Text style={styles.value}>{data.reference}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date du Règlement</Text>
                        <Text style={styles.value}>{data.datePaiement}</Text>
                    </View>
                    <View style={[styles.row, { borderBottom: "none" }]}>
                        <Text style={styles.label}>Solde Restant après ce versement</Text>
                        <Text style={[styles.value, { color: Number(data.soldeRestant) > 0 ? "#b91c1c" : "#059669" }]}>
                            {data.soldeRestant.toLocaleString()} {data.devise}
                        </Text>
                    </View>
                </View>

                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Montant Versé</Text>
                    <Text style={styles.amountValue}>
                        {data.montantPaye.toLocaleString()} {data.devise}
                    </Text>
                </View>
            </View>

            {/* Verification Section */}
            {qrImage && (
                <View style={styles.qrSection}>
                    <Image style={styles.qrCode} src={qrImage} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 8, fontWeight: "bold", color: "#0d2870", textTransform: "uppercase" }}>Validité Numérique Certifiée</Text>
                        <Text style={{ fontSize: 7, color: "#64748b", marginTop: 2 }}>
                            Ce document constitue une preuve libératoire partielle ou totale pour le montant indiqué. 
                            L'authenticité de ce reçu peut être vérifiée par les services de la RTNC via le QR code ci-contre.
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.certification}>
                <Text>PUREMENT LOGICIEL - VALABLE SANS SIGNATURE MANUELLE</Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                © 2026 RTNC - Système SIGR. Document généré électroniquement.
                Tout usage de faux est passible de poursuites judiciaires conformément au code pénal.
            </Text>
        </Page>
    </Document>
);
