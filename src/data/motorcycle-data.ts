enum Ebrand {
  Honda = "Honda",
  Yamaha = "Yamaha",
  Suzuki = "Suzuki",
  Kawasaki = "Kawasaki",
  BMW = "BMW",
  Ducati = "Ducati",
  Aprilia = "Aprilia",
  Triumph = "Triumph",
  KTM = "KTM",
  Husqvarna = "Husqvarna",
  HarleyDavidson = "Harley-Davidson",
  Indian = "Indian",
  MvAgusta = "MV Agusta",
  CFMoto = "CFMoto",
  Zongshen = "Zongshen",
  Benelli = "Benelli",
  Piaggio = "Piaggio",
  Vespa = "Vespa",
}

enum EType {
  Sport = "Sport",
  Touring = "Touring",
  Cruiser = "Cruiser",
  SportTouring = "SportTouring",
  Adventure = "Adventure",
}

type Tbrand = keyof typeof Ebrand;

const motorcycleData = [
  {
    name: "Honda CBR650R",
    brand: Ebrand.Honda,
    type: EType.Sport,
    weight: 200,
    power: 100,
  },
  {
    name: "Yamaha R1",
    brand: Ebrand.Yamaha,
    type: EType.Sport,
    weight: 200,
    power: 100,
  },
];
