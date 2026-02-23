import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 60,
        fontSize: 11,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
        color: '#1F2937',
    },
    header: {
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#E11D48', // Danger color
        paddingBottom: 10,
    },
    logo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F1C3F',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E11D48',
        textAlign: 'center',
        marginVertical: 20,
        textTransform: 'uppercase',
    },
    locationDate: {
        textAlign: 'right',
        marginBottom: 30,
    },
    recipient: {
        marginLeft: 250,
        marginBottom: 40,
    },
    subject: {
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 20,
    },
    content: {
        textAlign: 'justify',
        marginBottom: 15,
    },
    dangerBox: {
        marginVertical: 15,
        padding: 15,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    signatureBlock: {
        marginTop: 50,
        marginLeft: 250,
        textAlign: 'center',
    },
    signatureTitle: {
        fontWeight: 'bold',
        marginBottom: 40,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 60,
        right: 60,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 9,
        color: '#6B7280',
    }
});

interface MiseEnDemeurePDFProps {
    note: {
        numeroNote: string;
        exercice: number;
        montantTotalDu: string;
        dateEcheance: string;
        assujetti: {
            nom: string;
            adresse: string;
            identifiantFiscal: string;
        };
    };
    date: string;
}

export const MiseEnDemeurePDF: React.FC<MiseEnDemeurePDFProps> = ({ note, date }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.logo}>RTNC - DIRECTION DE LA REDEVANCE</Text>
                <Text>Service du Contentieux & Recouvrement Forcé</Text>
            </View>

            <Text style={styles.title}>Mise en Demeure</Text>

            <View style={styles.locationDate}>
                <Text>Kinshasa, le {date}</Text>
            </View>

            <View style={styles.recipient}>
                <Text style={{ fontWeight: 'bold' }}>À l'attention de :</Text>
                <Text>{note.assujetti.nom}</Text>
                <Text>{note.assujetti.adresse}</Text>
                <Text>ID Fiscal: {note.assujetti.identifiantFiscal}</Text>
            </View>

            <Text style={styles.subject}>OBJET : MISE EN DEMEURE AVANT POURSUITES JUDICIAIRES</Text>

            <Text style={styles.content}>
                Malgré nos précédentes relances, nous constatons que vous n'avez toujours pas régularisé votre situation concernant
                la redevance audiovisuelle pour l'exercice {note.exercice}.
            </Text>

            <View style={styles.dangerBox}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>DÉCOMPTE DE VOTRE DETTE :</Text>
                <Text>Référence Note : {note.numeroNote}</Text>
                <Text>Montant principal : {note.montantTotalDu} USD</Text>
                <Text>Statut actuel : CONTENTIEUX</Text>
            </View>

            <Text style={styles.content}>
                Par la présente, nous vous mettons formellement en demeure de régler la somme susmentionnée dans un délai
                de huit (8) jours francs à compter de la date de réception de cette lettre.
            </Text>

            <Text style={styles.content}>
                À défaut de paiement intégral dans ce délai, votre dossier sera transmis sans autre avis à l'Officier du Ministère Public (OMP)
                pour l'ouverture d'une procédure de recouvrement forcé par toutes les voies de droit, conformément aux dispositions légales.
            </Text>

            <Text style={styles.content}>
                Nous espérons qu'une suite favorable sera réservée à la présente, vous évitant ainsi les désagréments d'une procédure judiciaire.
            </Text>

            <View style={styles.signatureBlock}>
                <Text style={styles.signatureTitle}>Le Directeur de la Redevance</Text>
                <Text>(Signature & Sceau de la Direction)</Text>
            </View>

            <View style={styles.footer}>
                <Text>Radio-Télévision Nationale Congolaise - Document Officiel de Recouvrement</Text>
                <Text>Tout paiement doit être effectué via les canaux officiels mentionnés sur la note de taxation.</Text>
            </View>
        </Page>
    </Document>
);
