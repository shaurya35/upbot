export interface Region {
  id: string;
  code: string;
  name: string;
}

export const ALL_REGIONS: Region[] = [
  { id: "04038ea8-22fa-41c1-a16a-1357cb0b34c9", code: "DUB", name: "Dublin" },
  { id: "04a7d948-5808-48a8-9a59-63a836c57769", code: "SYD", name: "Sydney" },
  { id: "0f546409-0072-4986-8579-0de497aadbae", code: "BKK", name: "Bangkok" },
  {
    id: "15d674e6-9d5f-4292-a985-c28f9a906042",
    code: "FRA",
    name: "Frankfurt",
  },
  { id: "179dff85-c7dc-447a-89a6-44ded396b4fc", code: "ATL", name: "Atlanta" },
  {
    id: "299ec440-6eb8-4282-bd8a-bb862495b915",
    code: "MEL",
    name: "Melbourne",
  },
  { id: "37d01ba4-9e8e-46f4-9cf6-d7585c5db092", code: "DXB", name: "Dubai" },
  {
    id: "3e4f8319-23fb-4580-ada1-126ca4cc22fa",
    code: "GRU",
    name: "São Paulo",
  },
  { id: "447ed516-b7b2-4210-85b5-ddbf860ec5e2", code: "MAD", name: "Madrid" },
  {
    id: "46dc26c3-2321-4244-9940-45c860d22676",
    code: "SFO",
    name: "San Francisco",
  },
  {
    id: "55aa9f5f-67bc-4015-881e-c9f9f6631fda",
    code: "IAD",
    name: "Washington DC",
  },
  { id: "5729fc4e-1b10-4185-9781-8a320b9b274c", code: "ORD", name: "Chicago" },
  { id: "5a00952f-b2b8-4a0f-b24e-08e6ed2cc59b", code: "LON", name: "London" },
  { id: "69050726-8cdf-4e93-ba80-9fde2e30a473", code: "DEL", name: "Delhi" },
  { id: "764687d4-8761-42fd-a132-3c30fbccb0a1", code: "BOM", name: "Mumbai" },
  {
    id: "82f06ef1-8f72-4905-8e9c-0903e4b4dc5c",
    code: "AMS",
    name: "Amsterdam",
  },
  { id: "9002ac0d-7e6b-46f3-abc0-e6e7b19e2396", code: "LIS", name: "Lisbon" },
  {
    id: "998c9b15-f7ba-4fec-99a9-0bc4738fcc67",
    code: "CPT",
    name: "Cape Town",
  },
  { id: "9bf9f103-74ab-49e6-a336-090ac76255da", code: "MIA", name: "Miami" },
  { id: "a1fc3e43-d25e-4def-9787-1cd7b130d1c3", code: "MNL", name: "Manila" },
  { id: "a541ca27-4542-4adc-a2f5-e0a7d2f5eb1b", code: "AKL", name: "Auckland" },
  {
    id: "a5c92e7a-5aa3-40ac-9f72-3b8de5f9c72c",
    code: "JNB",
    name: "Johannesburg",
  },
  {
    id: "b3b0d993-5365-4f95-8d6d-4ad3026836ef",
    code: "BUE",
    name: "Buenos Aires",
  },
  {
    id: "bbe01ff3-394e-401a-946d-8b7e47e2f573",
    code: "YVR",
    name: "Vancouver",
  },
  {
    id: "c32dcdbd-daf0-4896-bbc8-b6531c53edbb",
    code: "LAX",
    name: "Los Angeles",
  },
  { id: "c986c78e-34ba-44fd-95b3-6e5576c5fe9b", code: "PAR", name: "Paris" },
  {
    id: "c9a0fb0e-4ff4-4719-b4e9-eee49587034a",
    code: "HKG",
    name: "Hong Kong",
  },
  {
    id: "ca72e9e0-9e09-4db5-9dfc-ab0755269a1f",
    code: "SIN",
    name: "Singapore",
  },
  { id: "cad6e9b4-1db2-4a47-9381-96f3859d8d7d", code: "SEA", name: "Seattle" },
  { id: "cd017b89-9b72-487b-a74e-72ad7a241e78", code: "NYC", name: "New York" },
  { id: "dcdb2459-bc89-4855-91f4-6dc1b53382eb", code: "TOR", name: "Toronto" },
  { id: "f89bf72c-ce82-4013-b3f7-3dd0d572e0fb", code: "BOG", name: "Bogota" },
];

export const PLAN_REGIONS = {
  FREE: ["SFO"],
  STARTER: ["SFO", "NYC", "LON", "AMS", "FRA"],
  PRO: ["SFO", "NYC", "LON", "AMS", "FRA", "SYD", "SIN", "DXB", "DEL", "TYO"],
  AGENCY: [
    "SFO",
    "NYC",
    "LON",
    "AMS",
    "FRA",
    "SYD",
    "SIN",
    "DXB",
    "DEL",
    "TYO",
    "MAD",
    "GRU",
    "CPT",
    "HKG",
    "BKK",
  ],
};

export function getRegionsForPlan(plan: string): Region[] {
  const regionCodes =
    PLAN_REGIONS[plan as keyof typeof PLAN_REGIONS] || PLAN_REGIONS.FREE;
  return ALL_REGIONS.filter((region) => regionCodes.includes(region.code));
}
