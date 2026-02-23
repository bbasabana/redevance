import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 60,
        fontSize: 11,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 30,
        textAlign: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 20,
        textAlign: 'center',
    },
    meta: {
        marginBottom: 20,
    },
    recipient: {
        marginTop: 40,
        marginBottom: 40,
        marginLeft: '50%',
        fontWeight: 'bold',
    },
    body: {
        textAlign: 'justify',
        marginBottom: 40,
    },
    footerContainer: {
        marginTop: 50,
        textAlign: 'right',
    },
    signature: {
        fontWeight: 'bold',
        marginTop: 10,
    }
});

interface OMPTransmissionPDFProps {
    data: {
        numeroDossier: string;
        dateVigueur: string;
        assujettiInfo: {
            nom: string;
            adresse: string;
            identifiantFiscal: string;
        };
        montantTotalDu: number;
        nombreRappels: number;
    };
}

export const OMPTransmissionPDF: React.FC<OMPTransmissionPDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Republic/Service Header */}
            <View style={styles.header}>
                <Text style={{ fontWeight: 'bold' }}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
                <Text>RADIO TÉLÉVISION NATIONALE CONGOLAISE (RTNC)</Text>
                <Text>DIRECTION DE LA REDEVANCE AUDIOVISUELLE</Text>
                <Text style={{ marginTop: 10 }}>-------------------</Text>
            </View>

            <View style={styles.meta}>
                <Text>N/Réf: RTNC/DIR/RAD/{data.numeroDossier}/{new Date().getFullYear()}</Text>
                <Text>Date: {new Date().toLocaleDateString('fr-FR')}</Text>
            </View>

            <View style={styles.recipient}>
                <Text>À Monsieur le Procureur de la République</Text>
                <Text>Près le Tribunal de Grande Instance</Text>
                <Text>À KINSHASA / GOMBE</Text>
            </View>

            <Text style={styles.title}>Objet: Transmission de dossier pour recouvrement forcé</Text>

            <View style={styles.body}>
                <Text>Monsieur le Procureur,</Text>
                <Text style={{ marginTop: 10 }}>
                    Nous avons l'honneur de vous transmettre, pour dispositions utiles, le dossier relatif au défaut de paiement
                    de la redevance audiovisuelle par l'assujetti dénommé ci-après :
                </Text>
                <View style={{ marginTop: 10, marginBottom: 10, paddingLeft: 20 }}>
                    <Text>- Nom/Raison Sociale: {data.assujettiInfo.nom}</Text>
                    <Text>- ID Fiscal: {data.assujettiInfo.identifiantFiscal}</Text>
                    <Text>- Adresse: {data.assujettiInfo.adresse}</Text>
                    <Text>- Montant principal dû: {data.montantTotalDu.toFixed(2)} USD</Text>
                </View>
                <Text>
                    Malgré nos multiples relances et rappels (au nombre de {data.nombreRappels}), restés sans suite,
                    nous nous voyons dans l'obligation de recourir à votre autorité pour le recouvrement forcé de cette créance de l'État,
                    conformément à la législation en vigueur.
                </Text>
                <Text style={{ marginTop: 10 }}>
                    Vous trouverez en annexe la copie de la Note de Taxation ainsi que les preuves des mises en demeure restées infructueuses.
                </Text>
                <Text style={{ marginTop: 10 }}>
                    Veuillez agréer, Monsieur le Procureur, l'expression de nos sentiments patriotiques.
                </Text>
            </View>

            <View style={styles.footerContainer}>
                <Text>Pour la Direction de la Redevance,</Text>
                <Text style={styles.signature}>Le Directeur</Text>
            </View>
        </Page>
    </Document>
);
