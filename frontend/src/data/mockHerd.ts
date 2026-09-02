export interface CowStaticMetadata {
  id: string;
  name: string;
  tagNumber: string;
  breed: string;
  barnSector: string;
}

const COW_NAMES = [
  "Kamadhenu", "Gauri", "Nandini", "Surabhi", "Lakshmi", "Kapila", "Devi", "Bhavani",
  "Shanta", "Ananya", "Ganga", "Yamuna", "Kaveri", "Saraswati", "Godavari", "Radha",
  "Meera", "Sita", "Rohini", "Durga", "Chamundi", "Parvati", "Kalyani", "Mangala",
  "Revathi", "Gayatri", "Uma", "Tulasi", "Aishwarya", "Padma", "Mohini", "Sundari",
  "Priya", "Indu", "Chitra", "Tara", "Usha", "Menaka", "Lalita", "Kavya",
  "Swati", "Amba", "Kamala", "Pushpa", "Rukmini", "Vasudha", "Madhavi", "Ranjani",
  "Vandana", "Shalini", "Shobha", "Pooja", "Malini", "Deepa"
];

const BREEDS = ["Gir", "Sahiwal", "Jersey Cross", "Red Sindhi", "Tharparkar", "Holstein Cross"];
const SECTORS = ["Barn Alpha (Sector A)", "Barn Beta (Sector B)", "Barn Gamma (Sector C)"];

export const MOCK_HERD_METADATA: Record<string, CowStaticMetadata> = {};

for (let i = 1; i <= 54; i++) {
  const id = `COW_${i.toString().padStart(2, "0")}`;
  const name = COW_NAMES[(i - 1) % COW_NAMES.length];
  const tagNumber = `IN-TN-${(7200 + i).toString()}`;
  const breed = BREEDS[(i - 1) % BREEDS.length];
  const barnSector = SECTORS[(i - 1) % SECTORS.length];

  MOCK_HERD_METADATA[id] = {
    id,
    name,
    tagNumber,
    breed,
    barnSector
  };
}
