import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- ADMIN ---
  const email = process.env.ADMIN_EMAIL || "admin@rongta.ma";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin Rongta",
      hashedPassword,
      role: "admin",
    },
  });
  console.log(`✅ Admin : ${user.email}`);

  // --- CATEGORIES ---
  const cats = [
    { name: "Imprimantes Thermiques 80mm", slug: "imprimantes-80mm" },
    { name: "Imprimantes Thermiques 58mm", slug: "imprimantes-58mm" },
    { name: "Imprimantes Portables", slug: "imprimantes-portables" },
    { name: "Imprimantes d'Étiquettes", slug: "imprimantes-etiquettes" },
    { name: "Balances Commerciales", slug: "balances-commerciales" },
    { name: "Balances de Table", slug: "balances-table" },
    { name: "Tiroirs-Caisses", slug: "tiroirs-caisses" },
    { name: "Accessoires POS", slug: "accessoires-pos" },
  ];

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${cats.length} catégories`);

  // --- HELPERS ---
  const catId = async (slug: string) => {
    const c = await prisma.category.findUnique({ where: { slug } });
    return c!.id;
  };

  // --- PRODUCTS ---
  const products = [
    // ===== Imprimantes 80mm =====
    {
      modelCode: "RP80USE",
      name: "Imprimante POS 80mm Triple Interface",
      slug: "rp80use-imprimante-pos-80mm",
      categoryId: await catId("imprimantes-80mm"),
      features: `
        <h2>Performance professionnelle</h2>
        <ul>
          <li>Impression haute vitesse jusqu'à <strong>250 mm/s</strong></li>
          <li>Triple interface : USB, Série RS-232 et Ethernet RJ45</li>
          <li>Massicot automatique intégré (durée de vie 1,5 million de coupes)</li>
          <li>Compatible <strong>ESC/POS</strong> — plug & play sur Windows, Linux et Android</li>
        </ul>
        <h2>Fiabilité industrielle</h2>
        <ul>
          <li>Tête d'impression longue durée : 160 km</li>
          <li>Détection automatique fin de papier et ouverture du capot</li>
          <li>Fonctionnement silencieux, idéal pour la restauration et le retail</li>
        </ul>
      `,
      images: [],
      specs: {
        "Méthode d'impression": "Thermique directe",
        "Largeur papier": "80 mm",
        "Vitesse d'impression": "250 mm/s",
        "Résolution": "203 DPI (8 dots/mm)",
        "Interface": "USB + Série RS-232 + Ethernet",
        "Coupe": "Automatique partielle",
        "Alimentation": "24V / 2.5A",
        "Dimensions": "145 × 195 × 148 mm",
        "Poids": "1.48 kg",
      },
      downloads: [
        { title: "Pilote Windows", url: "/downloads/rp80use-win.zip", type: "driver" },
        { title: "Manuel utilisateur", url: "/downloads/rp80use-manual.pdf", type: "manual" },
      ],
      isAvailable: true,
      status: "published",
    },
    {
      modelCode: "RP326USE",
      name: "Imprimante Thermique Haut Débit 326mm/s",
      slug: "rp326use-haut-debit",
      categoryId: await catId("imprimantes-80mm"),
      features: `
        <h2>Vitesse ultra-rapide</h2>
        <ul>
          <li>Impression à <strong>326 mm/s</strong> — la plus rapide de sa catégorie</li>
          <li>Idéale pour les environnements à fort volume : fast-food, supermarchés, pharmacies</li>
        </ul>
        <h2>Connectivité complète</h2>
        <ul>
          <li>USB + Série + Ethernet pour une intégration réseau immédiate</li>
          <li>Support OPOS et JavaPOS pour les solutions POS avancées</li>
          <li>Massicot haute durabilité : 2 millions de coupes</li>
        </ul>
      `,
      images: [],
      specs: {
        "Méthode d'impression": "Thermique directe",
        "Largeur papier": "80 mm",
        "Vitesse d'impression": "326 mm/s",
        "Résolution": "203 DPI",
        "Interface": "USB + Série + Ethernet",
        "Coupe": "Automatique partielle / totale",
        "Durée tête": "200 km",
        "Dimensions": "145 × 195 × 148 mm",
      },
      downloads: [
        { title: "Pilote Windows", url: "/downloads/rp326use-win.zip", type: "driver" },
      ],
      isAvailable: true,
      status: "published",
    },
    {
      modelCode: "RP850",
      name: "Imprimante POS 80mm WiFi + Bluetooth",
      slug: "rp850-wifi-bluetooth",
      categoryId: await catId("imprimantes-80mm"),
      features: `
        <h2>Sans fil, sans contraintes</h2>
        <ul>
          <li>Connectivité <strong>WiFi 2.4GHz + Bluetooth 4.2</strong> intégrée</li>
          <li>Impression directe depuis tablettes et smartphones Android/iOS</li>
          <li>Vitesse 300 mm/s avec coupe automatique</li>
        </ul>
        <h2>Installation simplifiée</h2>
        <ul>
          <li>Configuration WiFi via application mobile ou page web intégrée</li>
          <li>Port USB disponible en complément pour une flexibilité maximale</li>
        </ul>
      `,
      images: [],
      specs: {
        "Largeur papier": "80 mm",
        "Vitesse": "300 mm/s",
        "Résolution": "203 DPI",
        "Interface": "USB + WiFi + Bluetooth 4.2",
        "Coupe": "Automatique",
        "Protocole WiFi": "802.11 b/g/n",
      },
      downloads: null,
      isAvailable: true,
      status: "draft",
    },

    // ===== Imprimantes 58mm =====
    {
      modelCode: "RP58A",
      name: "Imprimante Compacte 58mm USB",
      slug: "rp58a-compacte-58mm",
      categoryId: await catId("imprimantes-58mm"),
      features: `
        <ul>
          <li>Format ultra-compact — se glisse partout sur le comptoir</li>
          <li>Impression rapide <strong>90 mm/s</strong></li>
          <li>Connexion USB simple, compatible Windows et Android</li>
          <li>Fonctionnement silencieux avec détection automatique du papier</li>
          <li>Solution économique pour les petits commerces et les cafés</li>
        </ul>
      `,
      images: [],
      specs: {
        "Largeur papier": "58 mm",
        "Vitesse": "90 mm/s",
        "Résolution": "203 DPI",
        "Interface": "USB",
        "Diamètre rouleau max": "50 mm",
        "Dimensions": "118 × 131 × 77 mm",
        "Poids": "0.34 kg",
      },
      downloads: [
        { title: "Pilote Windows", url: "/downloads/rp58a-win.zip", type: "driver" },
      ],
      isAvailable: true,
      status: "published",
    },
    {
      modelCode: "RP58BU",
      name: "Imprimante 58mm USB + Bluetooth",
      slug: "rp58bu-usb-bluetooth",
      categoryId: await catId("imprimantes-58mm"),
      features: `
        <ul>
          <li>Double interface <strong>USB + Bluetooth</strong></li>
          <li>Impression sans fil depuis smartphone ou tablette</li>
          <li>100 mm/s — rapide et silencieuse</li>
          <li>Parfaite pour la livraison à domicile et la vente ambulante</li>
        </ul>
      `,
      images: [],
      specs: {
        "Largeur papier": "58 mm",
        "Vitesse": "100 mm/s",
        "Interface": "USB + Bluetooth 4.0",
        "Résolution": "203 DPI",
      },
      downloads: null,
      isAvailable: true,
      status: "published",
    },

    // ===== Portables =====
    {
      modelCode: "RPP02A",
      name: "Imprimante Mobile Portable 58mm",
      slug: "rpp02a-mobile-portable",
      categoryId: await catId("imprimantes-portables"),
      features: `
        <h2>Mobilité totale</h2>
        <ul>
          <li>Batterie rechargeable <strong>1500 mAh</strong> — autonomie d'une journée</li>
          <li>Poids plume : seulement <strong>245 g</strong></li>
          <li>Bluetooth 4.0 pour impression depuis Android et iOS</li>
        </ul>
        <h2>Robuste et pratique</h2>
        <ul>
          <li>Coque anti-choc avec clip ceinture</li>
          <li>Charge USB-C rapide</li>
          <li>Compatible avec les applications de livraison et de facturation mobile</li>
        </ul>
      `,
      images: [],
      specs: {
        "Largeur papier": "58 mm",
        "Vitesse": "70 mm/s",
        "Interface": "Bluetooth 4.0 + USB",
        "Batterie": "1500 mAh Li-ion",
        "Autonomie": "~100 tickets par charge",
        "Poids": "245 g",
        "Dimensions": "105 × 78 × 45 mm",
      },
      downloads: [
        { title: "App Android", url: "/downloads/rpp02a-app.apk", type: "app" },
      ],
      isAvailable: true,
      status: "published",
    },
    {
      modelCode: "RPP04",
      name: "Imprimante Portable 112mm A6",
      slug: "rpp04-portable-112mm",
      categoryId: await catId("imprimantes-portables"),
      features: `
        <h2>Format A6 portable</h2>
        <ul>
          <li>Largeur d'impression <strong>104 mm</strong> — factures, bons de livraison, rapports</li>
          <li>Batterie haute capacité <strong>2600 mAh</strong></li>
          <li>WiFi + Bluetooth + USB pour tous les cas d'usage</li>
          <li>Résolution 203 DPI pour des impressions nettes</li>
        </ul>
      `,
      images: [],
      specs: {
        "Largeur papier": "112 mm",
        "Vitesse": "80 mm/s",
        "Interface": "WiFi + Bluetooth + USB",
        "Batterie": "2600 mAh",
        "Résolution": "203 DPI",
        "Poids": "480 g",
      },
      downloads: null,
      isAvailable: false,
      status: "draft",
    },

    // ===== Étiquettes =====
    {
      modelCode: "RP410",
      name: "Imprimante d'Étiquettes Thermique 110mm",
      slug: "rp410-etiquettes-110mm",
      categoryId: await catId("imprimantes-etiquettes"),
      features: `
        <h2>Étiquetage professionnel</h2>
        <ul>
          <li>Largeur d'impression jusqu'à <strong>108 mm</strong></li>
          <li>Vitesse <strong>152 mm/s</strong> — production en série rapide</li>
          <li>Compatible étiquettes adhésives, rubans, bracelets</li>
          <li>Calibration automatique du média</li>
        </ul>
        <h2>Polyvalence</h2>
        <ul>
          <li>Impression codes-barres 1D et 2D (QR Code, DataMatrix)</li>
          <li>USB + Bluetooth — intégration immédiate avec votre logiciel de gestion</li>
          <li>Compatible ZPL et TSPL</li>
        </ul>
      `,
      images: [],
      specs: {
        "Méthode": "Thermique directe",
        "Largeur impression": "108 mm",
        "Vitesse": "152 mm/s",
        "Résolution": "203 DPI",
        "Interface": "USB + Bluetooth",
        "Largeur étiquette": "25 ~ 118 mm",
        "Langages": "ZPL, TSPL, EPL",
      },
      downloads: [
        { title: "Pilote Windows", url: "/downloads/rp410-win.zip", type: "driver" },
        { title: "Éditeur d'étiquettes", url: "/downloads/rp410-editor.zip", type: "software" },
      ],
      isAvailable: true,
      status: "published",
    },

    // ===== Balances =====
    {
      modelCode: "RLS1100",
      name: "Balance Commerciale avec Imprimante Intégrée",
      slug: "rls1100-balance-imprimante",
      categoryId: await catId("balances-commerciales"),
      features: `
        <h2>Tout-en-un pour le commerce</h2>
        <ul>
          <li>Pesée précise jusqu'à <strong>30 kg</strong> (graduation 5 g)</li>
          <li>Imprimante d'étiquettes <strong>intégrée</strong> — pas besoin d'imprimante externe</li>
          <li>Écran LCD double face (vendeur + client)</li>
        </ul>
        <h2>Gestion avancée</h2>
        <ul>
          <li>Mémoire de <strong>10 000 PLU</strong> (articles pré-enregistrés)</li>
          <li>Connexion Ethernet pour gestion centralisée multi-balances</li>
          <li>Conformité métrologique pour le commerce de détail</li>
        </ul>
      `,
      images: [],
      specs: {
        "Capacité": "6/15/30 kg",
        "Graduation": "2/5/10 g",
        "Plateau": "350 × 230 mm",
        "Écran": "LCD rétroéclairé double face",
        "Imprimante": "Thermique 60 mm intégrée",
        "PLU": "10 000",
        "Interface": "Ethernet + RS-232 + USB",
        "Alimentation": "AC 220V",
      },
      downloads: [
        { title: "Logiciel de gestion PLU", url: "/downloads/rls1100-plu.zip", type: "software" },
      ],
      isAvailable: true,
      status: "published",
    },
    {
      modelCode: "RLS1315",
      name: "Balance Suspendue à Code-Barres",
      slug: "rls1315-balance-suspendue",
      categoryId: await catId("balances-commerciales"),
      features: `
        <ul>
          <li>Balance suspendue pour fruits, légumes et vrac</li>
          <li>Capacité <strong>30 kg</strong>, graduation <strong>5 g</strong></li>
          <li>Impression code-barres et étiquettes prix automatiques</li>
          <li>Accroche plafond ou portique inclus</li>
          <li>Écran LCD haute visibilité pour le client</li>
        </ul>
      `,
      images: [],
      specs: {
        "Capacité": "15/30 kg",
        "Graduation": "5/10 g",
        "Imprimante": "Thermique 60 mm",
        "PLU": "8 000",
        "Écran": "LCD double face",
        "Type": "Suspendue",
      },
      downloads: null,
      isAvailable: true,
      status: "published",
    },
    {
      modelCode: "RCS60",
      name: "Balance de Comptoir Compacte 60 kg",
      slug: "rcs60-balance-comptoir",
      categoryId: await catId("balances-table"),
      features: `
        <ul>
          <li>Pesée simple et fiable jusqu'à <strong>60 kg</strong></li>
          <li>Plateau inox facile à nettoyer</li>
          <li>Écran LED lumineux avec affichage du prix</li>
          <li>Batterie rechargeable pour une utilisation sans fil</li>
          <li>Idéale pour les marchés, souks et épiceries</li>
        </ul>
      `,
      images: [],
      specs: {
        "Capacité": "60 kg",
        "Graduation": "5 g",
        "Plateau": "Acier inoxydable 300 × 400 mm",
        "Écran": "LED double face",
        "Batterie": "Rechargeable 6V/4Ah",
        "Autonomie": "~80 heures",
      },
      downloads: null,
      isAvailable: true,
      status: "draft",
    },

    // ===== Tiroirs-caisses =====
    {
      modelCode: "RT405",
      name: "Tiroir-Caisse Métallique 5 Billets / 8 Pièces",
      slug: "rt405-tiroir-caisse",
      categoryId: await catId("tiroirs-caisses"),
      features: `
        <ul>
          <li>Construction <strong>tout métal</strong> robuste et durable</li>
          <li>5 compartiments billets + 8 compartiments pièces</li>
          <li>Ouverture automatique via signal RJ11 (compatible toutes imprimantes POS)</li>
          <li>Ouverture manuelle par clé de sécurité</li>
          <li>Roulements à billes pour une glisse fluide et silencieuse</li>
        </ul>
      `,
      images: [],
      specs: {
        "Matériau": "Acier laminé à froid",
        "Billets": "5 compartiments",
        "Pièces": "8 compartiments",
        "Ouverture": "RJ11 + clé manuelle",
        "Dimensions": "405 × 420 × 100 mm",
        "Interface": "RJ11 (12V/24V)",
      },
      downloads: null,
      isAvailable: true,
      status: "published",
    },

    // ===== Accessoires =====
    {
      modelCode: "RA80",
      name: "Lot de 50 Rouleaux Papier Thermique 80mm",
      slug: "ra80-rouleaux-thermique-80mm",
      categoryId: await catId("accessoires-pos"),
      features: `
        <ul>
          <li>Papier thermique haute qualité <strong>80 mm × 80 mm</strong></li>
          <li>Compatible toutes les imprimantes thermiques 80 mm</li>
          <li>Impression nette et durable — résiste à la lumière et à la chaleur</li>
          <li>Lot de <strong>50 rouleaux</strong> — approvisionnement longue durée</li>
          <li>Sans BPA — conforme aux normes européennes</li>
        </ul>
      `,
      images: [],
      specs: {
        "Largeur": "80 mm",
        "Diamètre": "80 mm",
        "Longueur": "~80 m par rouleau",
        "Épaisseur": "65 µm",
        "Quantité": "50 rouleaux / lot",
        "Matière": "Papier thermique sans BPA",
      },
      downloads: null,
      isAvailable: true,
      status: "published",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`✅ ${products.length} produits créés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());