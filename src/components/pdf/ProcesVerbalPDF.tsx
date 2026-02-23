import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
        color: '#000',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    republicTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    officeTitle: {
        fontSize: 10,
        marginTop: 5,
    },
    pvTitleBox: {
        borderWidth: 2,
        borderColor: '#000',
        padding: 10,
        marginVertical: 20,
        alignItems: 'center',
    },
    pvTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 150,
    },
    value: {
        flex: 1,
        fontWeight: 'normal',
    },
    content: {
        marginTop: 10,
        textAlign: 'justify',
    },
    infractionsBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#CCC',
        paddingTop: 5,
    }
});

interface ProcesVerbalPDFProps {
    pv: {
        id: string;
        datePv: string;
        infractionsConstatees: string;
        agentOpj: {
            nom: string;
            matricule?: string;
        };
        assujetti: {
            nom: string;
            identifiantFiscal: string;
            adresse: string;
        };
        controle: {
            type: string;
            datePlanifiee: string;
        };
    };
}

export const ProcesVerbalPDF: React.FC<ProcesVerbalPDFProps> = ({ pv }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.republicTitle}>République Démocratique du Congo</Text>
                <Text style={styles.officeTitle}>Radio-Télévision Nationale Congolaise (RTNC)</Text>
                <Text style={styles.officeTitle}>Direction de la Redevance Audiovisuelle</Text>
            </View>

            <View style={styles.pvTitleBox}>
                <Text style={styles.pvTitle}>Procès-Verbal de Constatation d'Infraction</Text>
                <Text>N° {pv.id.split('-')[0].toUpperCase()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. IDENTITÉ DE L'OFFICIER CONSTATATEUR</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nom de l'Agent OPJ :</Text>
                    <Text style={styles.value}>{pv.agentOpj.nom}</Text>
                </View>
                <Text style={styles.content}>
                    Agissant en qualité d'Officier de Police Judiciaire à compétence restreinte, dûment commissionné.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. IDENTITÉ DE L'ASSUJETTI</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nom / Raison Sociale :</Text>
                    <Text style={styles.value}>{pv.assujetti.nom}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Identifiant Fiscal :</Text>
                    <Text style={styles.value}>{pv.assujetti.identifiantFiscal}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Adresse du Siège :</Text>
                    <Text style={styles.value}>{pv.assujetti.adresse}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. CONSTATS ET INFRACTIONS</Text>
                <Text style={styles.content}>
                    Lors du contrôle effectué le {pv.datePv}, les faits suivants ont été constatés en violation de la loi
                    relative à la redevance audiovisuelle :
                </Text>
                <View style={styles.infractionsBox}>
                    <Text>{pv.infractionsConstatees}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. CONCLUSIONS</Text>
                <Text style={styles.content}>
                    En conséquence des constatations susmentionnées, il est dressé le présent Procès-Verbal pour faire valoir
                    ce que de droit, entraînant l'application immédiate des pénalités de retard et le recouvrement forcé le cas échéant.
                </Text>
            </View>

            <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                    <Text style={{ fontWeight: 'bold' }}>L'Assujetti (ou Représentant)</Text>
                    <Text style={{ marginTop: 40 }}>(Signature)</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={{ fontWeight: 'bold' }}>L'Agent Verbalisateur (OPJ)</Text>
                    <Text style={{ marginTop: 40 }}>(Signature et Sceau)</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text>Document officiel de la RTNC - Toute falsification est punie par la loi.</Text>
                <Text>Siège : Boulevard du 30 Juin, Kinshasa - www.rtnc.cd</Text>
            </View>
        </Page>
    </Document>
);
