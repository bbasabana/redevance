import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#0F1C3F' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#0F1C3F', paddingBottom: 10 },
    titleContainer: { flex: 1 },
    mainTitle: { fontSize: 18, fontWeight: 'bold' },
    subTitle: { fontSize: 10, color: '#64748B' },
    section: { marginVertical: 15 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#4F46E5', textTransform: 'uppercase' },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    kpiCard: { width: '48%', padding: 10, backgroundColor: '#F8FAFC', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#0F1C3F' },
    kpiLabel: { fontSize: 8, color: '#64748B', marginBottom: 4 },
    kpiValue: { fontSize: 14, fontWeight: 'bold' },
    table: { marginTop: 10 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 5, fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: 5 },
    col1: { flex: 2 },
    col2: { flex: 1, textAlign: 'right' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, textAlign: 'center', color: '#94A3B8', fontSize: 8 },
});

interface SummaryReportProps {
    stats: any;
    evolution: any[];
    distribution: any[];
}

export const SummaryReportPDF = ({ stats, evolution, distribution }: SummaryReportProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>RTNC - Direction de la Redevance</Text>
                    <Text style={styles.subTitle}>Rapport Analytique de Performance</Text>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text>Date: {new Date().toLocaleDateString('fr-FR')}</Text>
                    <Text>Réf: RAP-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000)}</Text>
                </View>
            </View>

            {/* KPIs */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Indicateurs Clés de Performance</Text>
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>TOTAL TAXÉ</Text>
                        <Text style={styles.kpiValue}>${stats.totalTaxed.toLocaleString()}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>TOTAL COLLECTÉ</Text>
                        <Text style={styles.kpiValue}>${stats.totalCollected.toLocaleString()}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>TAUX DE RECOUVREMENT</Text>
                        <Text style={styles.kpiValue}>{stats.collectionRate.toFixed(2)}%</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>ARRIÉRÉS (OVERDUE)</Text>
                        <Text style={styles.kpiValue}>${stats.totalOverdue.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Monthly Table */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Évolution Mensuelle</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Mois</Text>
                        <Text style={styles.col2}>Taxé ($)</Text>
                        <Text style={styles.col2}>Collecté ($)</Text>
                    </View>
                    {evolution.map((m, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.col1}>{m.name}</Text>
                            <Text style={styles.col2}>{m.taxed.toLocaleString()}</Text>
                            <Text style={styles.col2}>{m.collected.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Distribution Table */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Répartition par Commune</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Commune</Text>
                        <Text style={styles.col2}>Nombre d'Assujettis</Text>
                    </View>
                    {distribution.map((d, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.col1}>{d.name}</Text>
                            <Text style={styles.col2}>{d.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Document officiel RTNC - Logiciel de Gestion de la Redevance Audiovisuelle © 2026
            </Text>
        </Page>
    </Document>
);
