import { readFileSync } from "fs";
import { Pool } from "@neondatabase/serverless";

const envFile = readFileSync(".env", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        env[key] = val;
    }
}

const pool = new Pool({ connectionString: env.DATABASE_URL });

async function seed() {
    const client = await pool.connect();
    try {
        console.log("🧹 Cleaning up existing geography data...");
        // Delete in order to respect FK constraints (though self-referencing geographies should be handled)
        await client.query("DELETE FROM geographies");
        console.log("✅ Geographies cleaned.");

        console.log("🚀 Starting full geography seeding for Kinshasa...");

        // 1. Province
        const kinRes = await client.query(
            "INSERT INTO geographies (id, nom, type) VALUES (gen_random_uuid(), 'Kinshasa', 'PROVINCE') RETURNING id"
        );
        const provinceId = kinRes.rows[0].id;

        // 2. Ville
        const villeRes = await client.query(
            "INSERT INTO geographies (id, nom, type, parent_id) VALUES (gen_random_uuid(), 'Ville de Kinshasa', 'VILLE', $1) RETURNING id",
            [provinceId]
        );
        const villeId = villeRes.rows[0].id;

        // 3. Communes Data
        const communesData = [
            { name: "Bandalungwa", cat: "URBAINE", quartiers: ["Tshibangu", "Makelele", "Kasa-Vubu", "Bisengo", "Adoula", "Lubundi", "Molaert", "Lumumba"] },
            { name: "Barumbu", cat: "URBAINE", quartiers: ["Bitshaka", "Funa I", "Funa II", "Kapinga Bapu", "Kasafi", "Libulu", "Mozindo", "Ndolo", "Tshimanga"] },
            { name: "Bumbu", cat: "URBAINE", quartiers: ["Dipiya", "Mongala", "Ubangi", "Lokoro", "Kasaï", "Kwango", "Lukenie", "Mai-Ndombe", "Matadi", "Lieutenant Mbaki", "Mbandaka", "Mfimi", "Ntomba"] },
            { name: "Gombe", cat: "URBAINE", quartiers: ["Batetela", "Haut Commandement", "Croix-Rouge", "Lemera", "Golf", "Fleuve", "Gare / Commerce", "Révolution", "Clinique"] },
            { name: "Kalamu", cat: "URBAINE", quartiers: ["Matonge I", "Matonge II", "Matonge III", "Yolo Nord I", "Yolo Nord II", "Yolo Nord III", "Yolo Sud I", "Yolo Sud II", "Yolo Sud III", "Yolo Sud IV", "Kauka I", "Kauka II", "Kauka III", "Pinzi", "Immo-Congo"] },
            { name: "Kasa-Vubu", cat: "URBAINE", quartiers: ["Anciens Combattants", "Assossa", "Katanga", "Lodja", "Lubumbashi", "ONC", "Salango"] },
            { name: "Kinshasa", cat: "URBAINE", quartiers: ["Madimba", "Ngabka", "Mongala", "Aketi", "Djalo", "Pende", "Boyoma"] },
            { name: "Kimbanseke", cat: "RURALE", quartiers: ["17 Mai", "Bahumbi", "Biyela", "Boma", "Dissasi", "Kamba Mulumba", "Kikimi", "Kingasani", "Ngamazi-da", "Sakombi", "Salongo"] },
            { name: "Kisenso", cat: "URBANO_RURALE", quartiers: ["17 Mai", "Amba", "Bikanga", "De la Paix", "Dingi-Dingi", "Kabila", "Kisenso-Gare"] },
            { name: "Lemba", cat: "URBAINE", quartiers: ["Lemba Nord", "Lemba Sud", "Lemba Ecole", "Molo", "Gombele"] },
            { name: "Limete", cat: "URBAINE", quartiers: ["Kingabwa", "Industriel", "Residentiel", "Mombele", "Mososo"] },
            { name: "Lingwala", cat: "URBAINE", quartiers: ["Quartier 1", "Quartier 2", "Quartier 3"] },
            { name: "Makala", cat: "URBAINE", quartiers: ["Quartier 1", "Quartier 2", "Quartier 3"] },
            { name: "Maluku", cat: "RURALE", quartiers: ["Maluku", "Mbankana", "Menkao"] },
            { name: "Masina", cat: "URBANO_RURALE", quartiers: ["Quartier 1", "Quartier 2", "Quartier 3"] },
            { name: "Matete", cat: "URBAINE", quartiers: ["Mandina", "Maindombe", "Mboloko", "Kwenge I", "Kwenge II", "Ngilima I", "Ngilima II", "Lokoro", "Anunga", "Kunda I", "Kunda II", "Banunu I", "Banunu II", "Batandu I", "Batandu II", "Mutoto"] },
            { name: "Mont-Ngafula", cat: "URBANO_RURALE", quartiers: ["Kimwenza", "Kindele", "Matadi Mayo"] },
            { name: "Ndjili", cat: "URBAINE", quartiers: ["Quartier 1", "Quartier 2", "Quartier 3"] },
            { name: "Ngaba", cat: "URBAINE", quartiers: ["Quartier 1", "Quartier 2"] },
            { name: "Ngaliema", cat: "URBAINE", quartiers: ["Binza Ouvroir", "Binza Pigeon", "Binza Ozone", "Binza IPN", "Camp Luka"] },
            { name: "Ngiri-Ngiri", cat: "URBAINE", quartiers: ["Quartier 1", "Quartier 2"] },
            { name: "Nsele", cat: "RURALE", quartiers: ["Kinkole", "Mpasa"] },
            { name: "Selembao", cat: "URBANO_RURALE", quartiers: ["Quartier 1", "Quartier 2"] },
            { name: "Kintambo", cat: "URBAINE", quartiers: ["Luka", "Kilimani", "Jamaïque"] }
        ];

        for (const com of communesData) {
            const comRes = await client.query(
                "INSERT INTO geographies (id, nom, type, parent_id, category) VALUES (gen_random_uuid(), $1, 'COMMUNE', $2, $3) RETURNING id",
                [com.name, villeId, com.cat]
            );
            const comId = comRes.rows[0].id;

            for (const q of com.quartiers) {
                await client.query(
                    "INSERT INTO geographies (id, nom, type, parent_id) VALUES (gen_random_uuid(), $1, 'QUARTIER', $2)",
                    [q, comId]
                );
            }
        }

        console.log(`✅ Seeded 1 province, 1 ville, ${communesData.length} communes and many quartiers.`);

    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
