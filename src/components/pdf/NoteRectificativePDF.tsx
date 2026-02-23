import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#1F2937',
    },
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#E11D48', // Penality/Danger color
        paddingBottom: 15,
        marginBottom: 20,
    },
    titleBox: {
        backgroundColor: '#FEF2F2',
        padding: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#991B1B',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        color: '#6B7280',
    },
    value: {
        fontWeight: 'bold',
    },
    amountTable: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    amountRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        padding: 8,
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        padding: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 50,
        right: 50,
        textAlign: 'center',
        fontSize: 8,
        color: '#9BA3AF',
    }
});

interface NoteRectificativePDFProps {
    note: {
        id: string;
        originalNumeroNote: string;
        assujetti: {
            nom: string;
            identifiantFiscal: string;
        };
        exercice: number;
        montantOriginal: string;
        penalites: string;
        montantFinal: string;
        motif: string;
        dateEmission: string;
    };
}

export const NoteRectificativePDF: React.FC<NoteRectificativePDFProps> = ({ note }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>RTNC - REDEVANCE AUDIOVISUELLE</Text>
                <Text>Service du Contentieux</Text>
            </View>

            <View style={styles.titleBox}>
                <Text style={styles.title}>Note de Taxation Rectificative</Text>
                <Text>N° NR-{note.id.split('-')[0].toUpperCase()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>INFORMATIONS GÉNÉRALES</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Assujetti :</Text>
                    <Text style={styles.value}>{note.assujetti.nom}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>ID Fiscal :</Text>
                    <Text style={styles.value}>{note.assujetti.identifiantFiscal}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Note Originale :</Text>
                    <Text style={styles.value}>{note.originalNumeroNote}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Date Rectification :</Text>
                    <Text style={styles.value}>{note.dateEmission}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>MOTIF DE LA RECTIFICATION</Text>
                <Text style={{ marginTop: 5, fontStyle: 'italic' }}>{note.motif}</Text>
            </View>

            <View style={styles.amountTable}>
                <View style={styles.amountRow}>
                    <Text style={{ flex: 1 }}>Montant de la Redevance (Principal)</Text>
                    <Text style={{ width: 100, textAlign: 'right' }}>{note.montantOriginal} USD</Text>
                </View>
                <View style={styles.amountRow}>
                    <Text style={{ flex: 1, color: '#DC2626', fontWeight: 'bold' }}>Pénalités et Amendes</Text>
                    <Text style={{ width: 100, textAlign: 'right', color: '#DC2626', fontWeight: 'bold' }}>+ {note.penalites} USD</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12 }}>TOTAL À PAYER (APRÈS RECTIFICATION)</Text>
                    <Text style={{ width: 100, textAlign: 'right', fontWeight: 'bold', fontSize: 12 }}>{note.montantFinal} USD</Text>
                </View>
            </View>

            <View style={{ marginTop: 30 }}>
                <Text style={{ fontSize: 9, marginBottom: 5 }}>
                    Cette note annule et remplace la note de taxation précédente en ce qui concerne les montants dus.
                    Le défaut de paiement dans un délai de 8 jours entraînera des poursuites par l'OMP.
                </Text>
            </View>

            <View style={{ marginTop: 50, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ width: 200, textAlign: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>Le Directeur du Contentieux</Text>
                    <Text style={{ marginTop: 40 }}>(Signature et Sceau)</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text>Radio-Télévision Nationale Congolaise - Direction de la Redevance</Text>
                <Text>Document généré électroniquement - Valide sans rature ni surcharge.</Text>
            </View>
        </Page>
    </Document>
);
