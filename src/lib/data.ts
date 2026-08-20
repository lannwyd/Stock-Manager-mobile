

type Product = {
    key: string;
    name: string;
    dci: string; 
    lot: string;
    expiryDate: string; 
    quantity: number; 
};

type Floor = {
    key: string;
    title: string;
    products: Product[];
    totalItems: number; 
    totalProducts: number;
};

type Section = {
    key: string;
    title: string;
    color: string;
    floors: Floor[];
    totalFloors: number;
    totalItems: number; 
    totalProducts: number; 
};






const orangeFloor1: Floor = {
    key: 'sec1-floor1',
    title: 'Floor 1',
    products: [
        { key: 'p1', name: 'Paralgan', dci: 'Paracetamol', lot: 'LOT-24A7X9', expiryDate: '2026-11-30', quantity: 40 },
        { key: 'p2', name: 'Doliprane', dci: 'Paracetamol', lot: 'LOT-24B3K1', expiryDate: '2027-02-15', quantity: 60 },
    ],
    totalItems: 100,
    totalProducts: 2,
};

const orangeFloor2: Floor = {
    key: 'sec1-floor2',
    title: 'Floor 2',
    products: [
        { key: 'p3', name: 'Amoxil', dci: 'Amoxicillin', lot: 'LOT-24C8M2', expiryDate: '2026-08-01', quantity: 30 },
    ],
    totalItems: 30,
    totalProducts: 1,
};

const orangeFloor3: Floor = {
    key: 'sec1-floor3',
    title: 'Floor 3',
    products: [
        { key: 'p4', name: 'Aspégic', dci: 'Aspirin', lot: 'LOT-24D5N7', expiryDate: '2027-05-20', quantity: 50 },
        { key: 'p5', name: 'Kardégic', dci: 'Aspirin', lot: 'LOT-24E2P4', expiryDate: '2026-12-10', quantity: 20 },
    ],
    totalItems: 70,
    totalProducts: 2,
};

const orangeRack: Section = {
    key: 'sec1',
    title: 'Orange rack',
    color: 'bg-orange-100',
    floors: [orangeFloor1, orangeFloor2, orangeFloor3],
    totalFloors: 3,
    totalItems: orangeFloor1.totalItems + orangeFloor2.totalItems + orangeFloor3.totalItems,
    totalProducts: orangeFloor1.totalProducts + orangeFloor2.totalProducts + orangeFloor3.totalProducts,
};


const yellowFloor1: Floor = {
    key: 'sec2-floor1',
    title: 'Floor 1',
    products: [
        { key: 'p6', name: 'Ventoline', dci: 'Salbutamol', lot: 'LOT-24F1Q8', expiryDate: '2026-09-18', quantity: 25 },
    ],
    totalItems: 25,
    totalProducts: 1,
};

const yellowFloor2: Floor = {
    key: 'sec2-floor2',
    title: 'Floor 2',
    products: [
        { key: 'p7', name: 'Augmentin', dci: 'Amoxicillin/Clavulanate', lot: 'LOT-24G6R3', expiryDate: '2027-01-25', quantity: 45 },
        { key: 'p8', name: 'Clamoxyl', dci: 'Amoxicillin', lot: 'LOT-24H9S5', expiryDate: '2026-10-05', quantity: 35 },
    ],
    totalItems: 80,
    totalProducts: 2,
};

const yellowFloor3: Floor = {
    key: 'sec2-floor3',
    title: 'Floor 3',
    products: [
        { key: 'p9', name: 'Efferalgan', dci: 'Paracetamol', lot: 'LOT-24J4T6', expiryDate: '2027-03-12', quantity: 55 },
    ],
    totalItems: 55,
    totalProducts: 1,
};

const yellowRack: Section = {
    key: 'sec2',
    title: 'Yellow rack',
    color: 'bg-yellow-100',
    floors: [yellowFloor1, yellowFloor2, yellowFloor3],
    totalFloors: 3,
    totalItems: yellowFloor1.totalItems + yellowFloor2.totalItems + yellowFloor3.totalItems,
    totalProducts: yellowFloor1.totalProducts + yellowFloor2.totalProducts + yellowFloor3.totalProducts,
};
