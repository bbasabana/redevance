import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#0F1C3F',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#0F1C3F',
        paddingBottom: 15,
        marginBottom: 30,
    },
    logoPlaceholder: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    receiptInfo: {
        textAlign: 'right',
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#059669', // Emerald/Success
        marginBottom: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#F8FAFC',
        padding: 5,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 4,
    },
    label: {
        width: 150,
        color: '#64748B',
    },
    value: {
        flex: 1,
        fontWeight: 'bold',
    },
    amountBox: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#059669',
        borderRadius: 8,
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 12,
        color: '#065F46',
        marginBottom: 5,
    },
    amountValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#059669',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 50,
        right: 50,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 10,
        color: '#94A3B8',
        fontSize: 8,
    },
    qrPlaceholder: {
        marginTop: 20,
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    }
});

interface RecuPaiementPDFProps {
    paiement: {
        id: string;
        reference: string;
        montant: number;
        devise: string;
        date: string;
        canal: string;
        assujetti: {
            nom: string;
            identifiantFiscal: string;
        };
        note: {
            numeroNote: string;
        };
    };
}

export const RecuPaiementPDF: React.FC<RecuPaiementPDFProps> = ({ paiement }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logoPlaceholder}>RTNC - REDEVANCE</Text>
                    <Text>Direction de la Redevance</Text>
                    <Text>République Démocratique du Congo</Text>
                </View>
                <View style={styles.receiptInfo}>
                    <Text style={styles.receiptTitle}>REÇU DE PAIEMENT</Text>
                    <Text>N° Réf: {paiement.id.split('-')[0].toUpperCase()}</Text>
                    <Text>Date: {paiement.date}</Text>
                </View>
            </View>

            {/* Payment Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Détails de l'Assujetti</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nom / Raison Sociale:</Text>
                    <Text style={styles.value}>{paiement.assujetti.nom}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Identifiant Fiscal:</Text>
                    <Text style={styles.value}>{paiement.assujetti.identifiantFiscal}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations de Paiement</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Référence Transaction:</Text>
                    <Text style={styles.value}>{paiement.reference}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Mode de Paiement:</Text>
                    <Text style={styles.value}>{paiement.canal.toUpperCase()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Note de Taxation associée:</Text>
                    <Text style={styles.value}>{paiement.note.numeroNote}</Text>
                </View>
            </View>

            {/* Amount Highlight */}
            <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>MONTANT TOTAL PAYÉ</Text>
                <Text style={styles.amountValue}>{paiement.montant.toLocaleString()} {paiement.devise}</Text>
            </View>

            {/* Verification QR */}
            <View style={styles.qrPlaceholder}>
                <Text style={{ fontSize: 6 }}>QR VERIFICATION</Text>
            </View>
            <Text style={{ textAlign: 'center', fontSize: 7, marginTop: 5, color: '#94A3B8' }}>
                Scannez pour vérifier l'authenticité
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Document officiel généré par le système RTNC-RAD</Text>
                <Text>Ce reçu tient lieu de preuve de paiement sous réserve de confirmation bancaire finale.</Text>
            </View>
        </Page>
    </Document>
);
