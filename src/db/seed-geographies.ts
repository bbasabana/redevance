/**
 * RDC Geography Seeder
 * Seeds all 26 provinces of DRC with their villes/territoires, communes, and quartiers
 * Run: npx tsx src/db/seed-geographies.ts
 */
import { db } from "./index";
import { geographies } from "./schema";
import { eq, and } from "drizzle-orm";

type GeoType = "PROVINCE" | "VILLE" | "TERRITOIRE" | "CITE" | "SECTEUR" | "CHEFFERIE" | "COMMUNE" | "QUARTIER" | "GROUPEMENT";
type Category = "URBAINE" | "URBANO_RURALE" | "RURALE";

interface GeoEntry {
    nom: string;
    type: GeoType;
    category?: Category;
    children?: GeoEntry[];
}

// Helper to upsert a geography entry and return its ID
async function upsert(
    nom: string,
    type: GeoType,
    parentId: string | null,
    category?: Category
): Promise<string> {
    const conditions: any[] = [
        eq(geographies.nom, nom),
        eq(geographies.type, type),
    ];
    if (parentId) conditions.push(eq(geographies.parentId, parentId));

    const [existing] = await db.select().from(geographies).where(
        parentId
            ? and(eq(geographies.nom, nom), eq(geographies.type, type), eq(geographies.parentId, parentId))
            : and(eq(geographies.nom, nom), eq(geographies.type, type))
    ).limit(1);

    if (existing) {
        console.log(`  ✓ Exists: [${type}] ${nom}`);
        return existing.id;
    }

    const [inserted] = await db.insert(geographies).values({
        nom,
        type,
        parentId,
        category: category ?? null,
        isActive: true,
    } as any).returning({ id: geographies.id });

    console.log(`  + Inserted: [${type}] ${nom}`);
    return inserted.id;
}

// Full RDC Geographical Data
const RDC_GEOGRAPHY: GeoEntry[] = [
    {
        nom: "Kinshasa",
        type: "PROVINCE",
        category: "URBAINE",
        // Kinshasa is a ville-province: communes go directly under it
        children: [
            {
                nom: "Ville de Kinshasa",
                type: "VILLE",
                category: "URBAINE",
                children: [
                    {
                        nom: "Bandalungwa", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Adoula", type: "QUARTIER" }, { nom: "Bisengo", type: "QUARTIER" },
                            { nom: "Kasa-Vubu", type: "QUARTIER" }, { nom: "Lumumba", type: "QUARTIER" },
                            { nom: "Lubundi", type: "QUARTIER" }, { nom: "Makelele", type: "QUARTIER" },
                            { nom: "Molaert", type: "QUARTIER" }, { nom: "Tshibangu", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Barumbu", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Barumbu", type: "QUARTIER" }, { nom: "Plateau", type: "QUARTIER" },
                            { nom: "Mbamu", type: "QUARTIER" }, { nom: "Lumumba", type: "QUARTIER" },
                            { nom: "Boyoma", type: "QUARTIER" }, { nom: "Yolo", type: "QUARTIER" },
                            { nom: "Funa", type: "QUARTIER" }, { nom: "Saio", type: "QUARTIER" },
                            { nom: "Kingabwa", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Bumbu", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Bumbu", type: "QUARTIER" }, { nom: "Mbanza Lemba", type: "QUARTIER" },
                            { nom: "Boyoma", type: "QUARTIER" }, { nom: "Gambela", type: "QUARTIER" },
                            { nom: "Kombo", type: "QUARTIER" }, { nom: "Kisenso", type: "QUARTIER" },
                            { nom: "Livulu", type: "QUARTIER" }, { nom: "Matadi Kibala", type: "QUARTIER" },
                            { nom: "Mitendi", type: "QUARTIER" }, { nom: "Mongo Kimpese", type: "QUARTIER" },
                            { nom: "Ngufu", type: "QUARTIER" }, { nom: "Nkamba", type: "QUARTIER" },
                            { nom: "Nzadi", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Gombe", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Basoko", type: "QUARTIER" }, { nom: "Bolobo", type: "QUARTIER" },
                            { nom: "Djamba", type: "QUARTIER" }, { nom: "Golf", type: "QUARTIER" },
                            { nom: "Huileries", type: "QUARTIER" }, { nom: "Lofoi", type: "QUARTIER" },
                            { nom: "Louiseville", type: "QUARTIER" }, { nom: "Mbamu", type: "QUARTIER" },
                            { nom: "Mbenseke", type: "QUARTIER" }, { nom: "Victoire", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kalamu", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Assossa", type: "QUARTIER" }, { nom: "Basoko", type: "QUARTIER" },
                            { nom: "Bianda", type: "QUARTIER" }, { nom: "Bonda", type: "QUARTIER" },
                            { nom: "Bumba", type: "QUARTIER" }, { nom: "Gambari", type: "QUARTIER" },
                            { nom: "Joli Parc", type: "QUARTIER" }, { nom: "Kalamu", type: "QUARTIER" },
                            { nom: "Kibanseke", type: "QUARTIER" }, { nom: "Kinkole", type: "QUARTIER" },
                            { nom: "Lemba", type: "QUARTIER" }, { nom: "Lufu", type: "QUARTIER" },
                            { nom: "Mbonda", type: "QUARTIER" }, { nom: "Ndanu", type: "QUARTIER" },
                            { nom: "Ndjili", type: "QUARTIER" }, { nom: "Pumbu", type: "QUARTIER" },
                            { nom: "Salongo", type: "QUARTIER" }, { nom: "Yolo", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kasa-Vubu", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kasa-Vubu", type: "QUARTIER" }, { nom: "Lemba", type: "QUARTIER" },
                            { nom: "Makambo", type: "QUARTIER" }, { nom: "Mbamu", type: "QUARTIER" },
                            { nom: "Mugunga", type: "QUARTIER" }, { nom: "Ngomba-Kinkusa", type: "QUARTIER" },
                            { nom: "Sous Rio", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kimbanseke", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kimbaseke", type: "QUARTIER" }, { nom: "Kisenso", type: "QUARTIER" },
                            { nom: "Mbanza-Lemba", type: "QUARTIER" }, { nom: "Mbanza-Nzundu", type: "QUARTIER" },
                            { nom: "Mitendi", type: "QUARTIER" }, { nom: "Mongo-Village", type: "QUARTIER" },
                            { nom: "Mongo-Bele", type: "QUARTIER" }, { nom: "N'Sele", type: "QUARTIER" },
                            { nom: "Ndanu", type: "QUARTIER" }, { nom: "Nkanka", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kinshasa", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kintambo", type: "QUARTIER" }, { nom: "Lingwala", type: "QUARTIER" },
                            { nom: "Matonge", type: "QUARTIER" }, { nom: "Victoire", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kintambo", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Camp Luka", type: "QUARTIER" }, { nom: "Kintambo Magasin", type: "QUARTIER" },
                            { nom: "Petit Pont", type: "QUARTIER" }, { nom: "Vieux Kintambo", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kisenso", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Cimimbi", type: "QUARTIER" }, { nom: "Kisenso", type: "QUARTIER" },
                            { nom: "Kibangu", type: "QUARTIER" }, { nom: "Lemba Imbu", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Lemba", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Lemba", type: "QUARTIER" }, { nom: "Righini", type: "QUARTIER" },
                            { nom: "Salongo", type: "QUARTIER" }, { nom: "Université", type: "QUARTIER" },
                            { nom: "Yolo Sud", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Limete", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Industriel", type: "QUARTIER" }, { nom: "Kingabwa", type: "QUARTIER" },
                            { nom: "Mombele", type: "QUARTIER" }, { nom: "Résidentiel", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Lingwala", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Lingwala", type: "QUARTIER" }, { nom: "Matonge", type: "QUARTIER" },
                            { nom: "Poids Lourds", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Makala", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Makala", type: "QUARTIER" }, { nom: "Righini", type: "QUARTIER" },
                            { nom: "Salongo", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Maluku", type: "COMMUNE", category: "URBANO_RURALE",
                        children: [
                            { nom: "Maluku I", type: "QUARTIER" }, { nom: "Maluku II", type: "QUARTIER" },
                            { nom: "Kinkole", type: "QUARTIER" }, { nom: "Mbankana", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Masina", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Masina I", type: "QUARTIER" }, { nom: "Masina II", type: "QUARTIER" },
                            { nom: "Kingasani", type: "QUARTIER" }, { nom: "Ndanu", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Matete", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Matete", type: "QUARTIER" }, { nom: "Kimputu", type: "QUARTIER" },
                            { nom: "Kimvula", type: "QUARTIER" }, { nom: "Lukunga", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Mont-Ngafula", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Binza Ozone", type: "QUARTIER" }, { nom: "Binza Pigeon", type: "QUARTIER" },
                            { nom: "Binza Météo", type: "QUARTIER" }, { nom: "Delvaux", type: "QUARTIER" },
                            { nom: "Kimwenza", type: "QUARTIER" }, { nom: "Mont Fleury", type: "QUARTIER" },
                            { nom: "Righini", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "N'djili", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Quartier 1", type: "QUARTIER" }, { nom: "Quartier 2", type: "QUARTIER" },
                            { nom: "Quartier 3", type: "QUARTIER" }, { nom: "Quartier 4", type: "QUARTIER" },
                            { nom: "Quartier 5", type: "QUARTIER" }, { nom: "Quartier 6", type: "QUARTIER" },
                            { nom: "Quartier 7", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "N'Sele", type: "COMMUNE", category: "URBANO_RURALE",
                        children: [
                            { nom: "Mikonga", type: "QUARTIER" }, { nom: "N'Sele", type: "QUARTIER" },
                            { nom: "Mitendi", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Ngaba", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Ngaba", type: "QUARTIER" }, { nom: "Bumbu", type: "QUARTIER" },
                            { nom: "Kimbangu", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Ngaliema", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Binza-Delvaux", type: "QUARTIER" }, { nom: "Camp Luka", type: "QUARTIER" },
                            { nom: "Ma Campagne", type: "QUARTIER" }, { nom: "Ngaliema", type: "QUARTIER" },
                            { nom: "Pompage", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Ngiri-Ngiri", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Gambari", type: "QUARTIER" }, { nom: "Joli Parc", type: "QUARTIER" },
                            { nom: "Matonge", type: "QUARTIER" }, { nom: "Ngiri-Ngiri", type: "QUARTIER" },
                            { nom: "Pumbu", type: "QUARTIER" }, { nom: "Suez", type: "QUARTIER" },
                            { nom: "Victoire", type: "QUARTIER" }, { nom: "Yolo Nord", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Selembao", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Diulu", type: "QUARTIER" }, { nom: "Momokazi", type: "QUARTIER" },
                            { nom: "Nzadi", type: "QUARTIER" }, { nom: "Selembao", type: "QUARTIER" },
                        ]
                    },
                ]
            }
        ]
    },
    {
        nom: "Haut-Katanga",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Lubumbashi", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Annexe", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kamalondo", type: "QUARTIER" }, { nom: "Bel Air", type: "QUARTIER" },
                            { nom: "Manoah", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kamalondo", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kamalondo", type: "QUARTIER" }, { nom: "Gécamines", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kampemba", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kampemba", type: "QUARTIER" }, { nom: "Commune Urbaine", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Katuba", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Katuba", type: "QUARTIER" }, { nom: "Rwashi", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kenya", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kenya", type: "QUARTIER" }, { nom: "Lido", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Lubumbashi", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Centre", type: "QUARTIER" }, { nom: "Golf", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Ruashi", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Ruashi", type: "QUARTIER" }, { nom: "Kasungami", type: "QUARTIER" },
                        ]
                    },
                ]
            },
            {
                nom: "Likasi", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Likasi", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Panda", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Shituru", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Kikula", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Kasenga", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kipushi", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Pweto", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Sakania", type: "TERRITOIRE", category: "URBANO_RURALE" },
        ]
    },
    {
        nom: "Nord-Kivu",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Goma", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Goma", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Les Volcans", type: "QUARTIER" }, { nom: "Lac Vert", type: "QUARTIER" },
                            { nom: "Keshero", type: "QUARTIER" }, { nom: "Les Volcans II", type: "QUARTIER" },
                            { nom: "Katindo", type: "QUARTIER" }, { nom: "Nyiragongo", type: "QUARTIER" },
                            { nom: "Mikeno", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Karisimbi", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mabanga Nord", type: "QUARTIER" }, { nom: "Mabanga Sud", type: "QUARTIER" },
                            { nom: "Majengo", type: "QUARTIER" }, { nom: "Kasika", type: "QUARTIER" },
                            { nom: "Bujovu", type: "QUARTIER" }, { nom: "Kyeshero", type: "QUARTIER" },
                            { nom: "Murara", type: "QUARTIER" }, { nom: "Ndosho", type: "QUARTIER" },
                            { nom: "Virunga", type: "QUARTIER" }, { nom: "Volcanology", type: "QUARTIER" },
                            { nom: "Camp Joli", type: "QUARTIER" },
                        ]
                    },
                ]
            },
            {
                nom: "Butembo", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Butembo", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kimemi", type: "QUARTIER" }, { nom: "Vulamba", type: "QUARTIER" },
                            { nom: "Mususa", type: "QUARTIER" }, { nom: "Kanzuli", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Bulengera", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            {
                nom: "Beni", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Beni", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mulekera", type: "QUARTIER" }, { nom: "Rwenzori", type: "QUARTIER" },
                            { nom: "Boikene", type: "QUARTIER" },
                        ]
                    },
                ]
            },
            { nom: "Beni", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Lubero", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Masisi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Nyiragongo", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Rutshuru", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Walikale", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Sud-Kivu",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Bukavu", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Ibanda", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Ndendere", type: "QUARTIER" }, { nom: "Nyalukemba", type: "QUARTIER" },
                            { nom: "Maniema", type: "QUARTIER" }, { nom: "Fizi", type: "QUARTIER" },
                            { nom: "Muhungu", type: "QUARTIER" }, { nom: "Nguba", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kadutu", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mosala", type: "QUARTIER" }, { nom: "Nyamugo", type: "QUARTIER" },
                            { nom: "Kasali", type: "QUARTIER" }, { nom: "Cimpunda", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Bagira", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Lumumba", type: "QUARTIER" }, { nom: "Nyakavogo", type: "QUARTIER" },
                            { nom: "Fariala", type: "QUARTIER" }, { nom: "Bwindi", type: "QUARTIER" },
                            { nom: "Potopoto", type: "QUARTIER" }, { nom: "Kasheke", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kasha", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mulambula", type: "QUARTIER" }, { nom: "Chikonyi", type: "QUARTIER" },
                            { nom: "Ciriri", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Panzi", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mulengeza", type: "QUARTIER" }, { nom: "Mushununu", type: "QUARTIER" },
                            { nom: "Bizimana", type: "QUARTIER" },
                        ]
                    },
                ]
            },
            { nom: "Fizi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Idjwi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kabare", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kalehe", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mwenga", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Shabunda", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Uvira", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Walungu", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Tshopo",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Kisangani", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Kabondo", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Musibasiba", type: "QUARTIER" }, { nom: "Tshopo", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Kisangani", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kilanga", type: "QUARTIER" }, { nom: "Centre Ville", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Makiso", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Makiso", type: "QUARTIER" }, { nom: "Simi-Simi", type: "QUARTIER" },
                        ]
                    },
                    {
                        nom: "Mangobo", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mangobo", type: "QUARTIER" }, { nom: "Plateau Boyoma", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Tshopo", type: "COMMUNE", category: "URBAINE" },
                    {
                        nom: "Lubunga", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Lubunga", type: "QUARTIER" }, { nom: "Yawenda", type: "QUARTIER" },
                        ]
                    },
                ]
            },
            { nom: "Bafwasende", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Banalia", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Basoko", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Isangi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Opala", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Ubundu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Yahuma", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Kongo Central",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Matadi", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Matadi", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Mvuzi", type: "QUARTIER" }, { nom: "Nzanza", type: "QUARTIER" },
                            { nom: "Mvuzi II", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Mvuzi", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Nzanza", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            {
                nom: "Boma", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Boma", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Kalamu", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            {
                nom: "Mbanza-Ngungu", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Mbanza-Ngungu", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Thysville", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Bas-Fleuve", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Boma", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kasangulu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Luozi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mbanza-Ngungu", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Moanda", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Seke-Banza", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Songololo", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Kasaï Central",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Kananga", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Kananga", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Nganza", type: "QUARTIER" }, { nom: "Kabuya", type: "QUARTIER" },
                            { nom: "Lukonga", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Nganza", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Katoka", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Dimbelenge", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Ilebo", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kazumba", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Luebo", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Kasaï Oriental",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Mbujimayi", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Diulu", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Diulu", type: "QUARTIER" }, { nom: "Tshikama", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Kanshi", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Bipemba", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Muya", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Kabinda", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Katanda", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Lupatapata", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Miabi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Tshilenge", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Kwilu",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Kikwit", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Lukolela", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Lukolela I", type: "QUARTIER" }, { nom: "Lukolela II", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Nzinda", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Kazamba", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Bagata", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Bulungu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Gungu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Idiofa", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Masimanimba", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Lualaba",
        type: "PROVINCE",
        category: "URBAINE",
        children: [
            {
                nom: "Kolwezi", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Dilala", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Dilala", type: "QUARTIER" }, { nom: "Manika", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Manika", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Musonoie", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Lubudi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mutshatsha", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Sandoa", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Maniema",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Kindu", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Alunguli", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Kasuku", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Mikelenge", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Kabambare", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kailo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kasongo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kibombo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Lubutu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Pangi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Punia", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Équateur",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Mbandaka", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Basankusu", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Mbandaka", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Wangata", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Iboko", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Basankusu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Befale", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Bikoro", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Bolomba", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Ingende", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mbandaka", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Makanza", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Ituri",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Bunia", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Bunia", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Lumumba", type: "QUARTIER" }, { nom: "Sayo", type: "QUARTIER" },
                            { nom: "Bankoko", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Mbunya", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Djugu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Irumu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mambasa", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mahagi", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Bas-Uélé",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Buta", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Buta", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Aketi", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Ango", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Bondo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Bambesa", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Poko", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Haut-Uélé",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Isiro", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Isiro", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Isiro-Babemenge", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Dungu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Faradje", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Niangara", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Rungu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Wamba", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Watsa", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Haut-Lomami",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Kamina", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Kamina", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Kamina Base", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Bukama", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kabongo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kaniama", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Malemba-Nkulu", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Kasaï",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Tshikapa", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Tshikapa", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Kamonia", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Dekese", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Ilebo", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kamonia", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mweka", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Kwango",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Kenge", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Kenge", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Feshi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kahemba", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kenge", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Popokabaka", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Lomami",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Kabinda", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Kabinda", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Kabinda", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kamiji", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Luilu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Mukumbi", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Ngandajika", type: "TERRITOIRE", category: "URBANO_RURALE" },
        ]
    },
    {
        nom: "Mai-Ndombe",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Inongo", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Inongo", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Bolobo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Inongo", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kiri", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kutu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Oshwe", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Yumbi", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Mongala",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Lisala", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Lisala", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Lisala I", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Bongandanga", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Bumba", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Lisala", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Mogalo", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Nord-Ubangi",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Gbadolite", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Gbadolite", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Yakoma", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Businga", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Gbadolite", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Mobayi-Mbongo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Yakoma", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Sankuru",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Lusambo", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Lusambo", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Katako-Kombe", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kole", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Lodja", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Lomela", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Lubefu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Lusambo", type: "TERRITOIRE", category: "URBANO_RURALE" },
        ]
    },
    {
        nom: "Sud-Ubangi",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Gemena", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Gemena", type: "COMMUNE", category: "URBAINE" },
                    { nom: "Gemena I", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Budjala", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Gemena", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kungu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Libenge", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Tanganyika",
        type: "PROVINCE",
        category: "URBANO_RURALE",
        children: [
            {
                nom: "Kalemie", type: "VILLE", category: "URBAINE",
                children: [
                    {
                        nom: "Kalemie", type: "COMMUNE", category: "URBAINE",
                        children: [
                            { nom: "Kalemie Centre", type: "QUARTIER" }, { nom: "Mvimba", type: "QUARTIER" },
                        ]
                    },
                    { nom: "Mwanakewe", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Kabalo", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Kalemie", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Kongolo", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Manono", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Moba", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Nyunzu", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
    {
        nom: "Tshuapa",
        type: "PROVINCE",
        category: "RURALE",
        children: [
            {
                nom: "Boende", type: "VILLE", category: "URBAINE",
                children: [
                    { nom: "Boende", type: "COMMUNE", category: "URBAINE" },
                ]
            },
            { nom: "Befori", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Boende", type: "TERRITOIRE", category: "URBANO_RURALE" },
            { nom: "Bokungu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Djolu", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Ikela", type: "TERRITOIRE", category: "RURALE" },
            { nom: "Monkoto", type: "TERRITOIRE", category: "RURALE" },
        ]
    },
];

async function seedChildren(children: GeoEntry[], parentId: string) {
    for (const child of children) {
        const childId = await upsert(child.nom, child.type, parentId, child.category);
        if (child.children?.length) {
            await seedChildren(child.children, childId);
        }
    }
}

async function main() {
    console.log("🌍 Starting RDC Geography Seeder...\n");
    let provinceCount = 0;

    for (const province of RDC_GEOGRAPHY) {
        console.log(`\n📍 Province: ${province.nom}`);
        const provinceId = await upsert(province.nom, province.type, null, province.category);
        if (province.children?.length) {
            await seedChildren(province.children, provinceId);
        }
        provinceCount++;
    }

    console.log(`\n✅ Seeding complete! ${provinceCount} provinces seeded.`);
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
