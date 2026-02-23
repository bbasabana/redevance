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
    },
    logo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F1C3F',
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
    noteTable: {
        marginVertical: 15,
        padding: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
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

interface RelancePDFProps {
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

export const RelancePDF: React.FC<RelancePDFProps> = ({ note, date }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.logo}>RTNC - Direction de la Redevance</Text>
                <Text>Service du Recouvrement</Text>
            </View>

            <View style={styles.locationDate}>
                <Text>Kinshasa, le {date}</Text>
            </View>

            <View style={styles.recipient}>
                <Text style={{ fontWeight: 'bold' }}>À l'attention de :</Text>
                <Text>{note.assujetti.nom}</Text>
                <Text>{note.assujetti.adresse}</Text>
                <Text>ID Fiscal: {note.assujetti.identifiantFiscal}</Text>
            </View>

            <Text style={styles.subject}>Objet : Lettre de Relance pour impayé</Text>

            <Text style={styles.content}>
                Sauf erreur ou omission de notre part, nous constatons qu'à ce jour, le paiement de votre redevance audiovisuelle
                pour l'exercice {note.exercice} n'a pas été enregistré dans nos livres.
            </Text>

            <View style={styles.noteTable}>
                <Text>Référence de la note : {note.numeroNote}</Text>
                <Text>Montant principal dû : {note.montantTotalDu} USD</Text>
                <Text>Échéance initiale : {note.dateEcheance}</Text>
            </View>

            <Text style={styles.content}>
                Nous vous prions de bien vouloir régulariser votre situation dans un délai de huit (8) jours à compter de la réception
                de la présente. À défaut, nous nous verrons dans l'obligation d'appliquer les pénalités de retard conformément à la législation en vigueur.
            </Text>

            <Text style={styles.content}>
                Si vous avez déjà effectué ce paiement, nous vous prions de ne pas tenir compte de cette lettre et de nous transmettre
                une copie de votre preuve de paiement via le portail assujetti.
            </Text>

            <Text style={styles.content}>
                Veuillez agréer, Madame, Monsieur, l'expression de nos sentiments distingués.
            </Text>

            <View style={styles.signatureBlock}>
                <Text style={styles.signatureTitle}>Le Directeur de la Redevance</Text>
                <Text>(Signature & Sceau Officiel)</Text>
            </View>

            <View style={styles.footer}>
                <Text>Radio-Télévision Nationale Congolaise - Direction de la Redevance</Text>
                <Text>Siège Social : Avenue Kabinda, Kinshasa/Lingwala</Text>
            </View>
        </Page>
    </Document>
);
