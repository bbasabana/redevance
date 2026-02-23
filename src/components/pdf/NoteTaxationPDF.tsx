import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#0F1C3F', // Navy
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#0F1C3F',
        paddingBottom: 10,
    },
    logoContainer: {
        width: 60,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 20,
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subTitle: {
        fontSize: 10,
        color: '#64748B',
    },
    noteInfo: {
        width: 150,
        textAlign: 'right',
    },
    badge: {
        backgroundColor: '#0F1C3F',
        color: '#FFFFFF',
        padding: '4 8',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    section: {
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 4,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 120,
        color: '#64748B',
    },
    value: {
        flex: 1,
        fontWeight: 'bold',
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#0F1C3F',
        padding: 5,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        padding: 5,
    },
    col1: { flex: 2 },
    col2: { flex: 1, textAlign: 'center' },
    col3: { flex: 1, textAlign: 'right' },
    col4: { flex: 1, textAlign: 'right' },
    totals: {
        marginTop: 20,
        alignSelf: 'flex-end',
        width: 200,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    finalTotal: {
        borderTopWidth: 2,
        borderTopColor: '#0F1C3F',
        marginTop: 5,
        paddingTop: 5,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4F46E5', // Indigo
    },
    footer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: 180,
        height: 100,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 4,
        padding: 10,
        textAlign: 'center',
    },
    signatureLabel: {
        fontSize: 8,
        color: '#64748B',
        marginBottom: 40,
    },
    signatureName: {
        fontWeight: 'bold',
    },
    watermark: {
        position: 'absolute',
        top: '30%',
        left: '20%',
        fontSize: 60,
        color: '#F8FAFC',
        transform: 'rotate(-45deg)',
        zIndex: -1,
    }
});

interface NoteTaxationPDFProps {
    note: {
        numeroNote: string;
        exercice: number;
        dateEmission: string;
        dateEcheance: string;
        montantBrut: number;
        reductionPct: number;
        montantReduction: number;
        montantTotalDu: number;
        assujetti: {
            nomRaisonSociale: string;
            identifiantFiscal: string;
            adresseSiege: string;
            telephone: string;
        };
        items: Array<{
            category: string;
            count: number;
            unitPrice: number;
            total: number;
        }>;
    };
}

export const NoteTaxationPDF: React.FC<NoteTaxationPDFProps> = ({ note }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.watermark}>OFFICIEL RTNC</Text>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    {/* Logo Placeholder */}
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>RTNC-RAD</Text>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Note de Taxation</Text>
                    <Text style={styles.subTitle}>Redevance Audiovisuelle - RDC</Text>
                </View>
                <View style={styles.noteInfo}>
                    <Text style={styles.badge}>{note.numeroNote}</Text>
                    <Text>Émise le: {note.dateEmission}</Text>
                    <Text>Échéance: {note.dateEcheance}</Text>
                </View>
            </View>

            {/* Assujetti Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations du Redevable</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nom / Raison Sociale:</Text>
                    <Text style={styles.value}>{note.assujetti.nomRaisonSociale}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>ID Fiscal RTNC:</Text>
                    <Text style={styles.value}>{note.assujetti.identifiantFiscal}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Adresse:</Text>
                    <Text style={styles.value}>{note.assujetti.adresseSiege}</Text>
                </View>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Désignation</Text>
                    <Text style={styles.col2}>Quantité</Text>
                    <Text style={styles.col3}>Prix Unitaire</Text>
                    <Text style={styles.col4}>Total (USD)</Text>
                </View>
                {note.items.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.col1}>{item.category}</Text>
                        <Text style={styles.col2}>{item.count}</Text>
                        <Text style={styles.col3}>{item.unitPrice.toFixed(2)}</Text>
                        <Text style={styles.col4}>{item.total.toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totals}>
                <View style={styles.totalRow}>
                    <Text>Sous-total Brut:</Text>
                    <Text>{note.montantBrut.toFixed(2)} USD</Text>
                </View>
                {note.reductionPct > 0 && (
                    <View style={styles.totalRow}>
                        <Text>Réduction ({note.reductionPct}%):</Text>
                        <Text>-{note.montantReduction.toFixed(2)} USD</Text>
                    </View>
                )}
                <View style={[styles.totalRow, styles.finalTotal]}>
                    <Text>NET À PAYER:</Text>
                    <Text>{note.montantTotalDu.toFixed(2)} USD</Text>
                </View>
            </View>

            {/* Signatures */}
            <View style={styles.footer}>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLabel}>Signature Sous-Directeur</Text>
                    <Text style={styles.signatureName}>VALIDÉ EN LIGNE</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLabel}>Signature Directeur</Text>
                    <Text style={styles.signatureName}>APPROUVÉ EN LIGNE</Text>
                </View>
            </View>

            <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 8, color: '#94A3B8' }}>
                Note générée électroniquement par le système RTNC Redevance.
                Pour plus d'informations, visitez le portail officiel.
            </Text>
        </Page>
    </Document>
);
