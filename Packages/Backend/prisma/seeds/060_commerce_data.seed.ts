import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";

type ClientSeed = {
  id: string;
  commerceUserId: string;
  name: string;
  phoneNumber: string;
  email: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string | null;
  notes: string;
};

type ProductSeed = {
  id: string;
  commerceUserId: string;
  name: string;
  description: string;
  priceBrl: string;
  stock: number;
  soldCount: number;
  status: "active" | "paused" | "hidden";
};

const CLIENTS: ReadonlyArray<ClientSeed> = [
  {
    id: seedIds.commerceData.clients.centroAna,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Ana Sousa",
    phoneNumber: "+559999101001",
    email: "ana.sousa@example.dev",
    cep: "65901-000",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Centro",
    street: "Rua Coronel Manoel Bandeira",
    number: "18",
    complement: null,
    notes: "Cliente recorrente do almoço.",
  },
  {
    id: seedIds.commerceData.clients.centroBruno,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Bruno Lima",
    phoneNumber: "+559999101002",
    email: "bruno.lima@example.dev",
    cep: "65915-010",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "São José",
    street: "Rua São José",
    number: "120",
    complement: "Ap 2",
    notes: "Entrega preferencial no periodo de pico.",
  },
  {
    id: seedIds.commerceData.clients.centroCarla,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Carla Gomes",
    phoneNumber: "+559999101003",
    email: "carla.gomes@example.dev",
    cep: "65906-030",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Bacuri",
    street: "Avenida Bernardo Sayão",
    number: "500",
    complement: null,
    notes: "Cliente com pedido de sobremesa frequente.",
  },
  {
    id: seedIds.commerceData.clients.farmaciaDiego,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Diego Rocha",
    phoneNumber: "+559999102001",
    email: "diego.rocha@example.dev",
    cep: "65916-050",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Bacuri",
    street: "Rua Dom Pedro II",
    number: "410",
    complement: null,
    notes: "Compra recorrente de itens de higiene.",
  },
  {
    id: seedIds.commerceData.clients.farmaciaElisa,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Elisa Martins",
    phoneNumber: "+559999102002",
    email: "elisa.martins@example.dev",
    cep: "65900-420",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Centro",
    street: "Rua Ceará",
    number: "300",
    complement: "Casa B",
    notes: "Solicita entrega rapida no periodo noturno.",
  },
  {
    id: seedIds.commerceData.clients.farmaciaFabio,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Fábio Nunes",
    phoneNumber: "+559999102003",
    email: "fabio.nunes@example.dev",
    cep: "65900-120",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Vila Lobão",
    street: "Rua Benedito Leite",
    number: "210",
    complement: null,
    notes: "Entrega com orientacao para portaria.",
  },
];

const PRODUCTS: ReadonlyArray<ProductSeed> = [
  {
    id: seedIds.commerceData.products.centroMarmitaFrango,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Marmita Frango",
    description: "Marmita media com frango grelhado.",
    priceBrl: "18.00",
    stock: 90,
    soldCount: 40,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.centroMarmitaCarne,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Marmita Carne",
    description: "Marmita media com carne assada.",
    priceBrl: "19.50",
    stock: 70,
    soldCount: 35,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.centroRefrigerante2L,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Refrigerante 2L",
    description: "Refrigerante cola 2 litros.",
    priceBrl: "12.00",
    stock: 120,
    soldCount: 55,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.centroSucoLaranja,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Suco de Laranja",
    description: "Suco natural de laranja 500ml.",
    priceBrl: "8.00",
    stock: 60,
    soldCount: 20,
    status: "paused",
  },
  {
    id: seedIds.commerceData.products.centroSobremesaPudim,
    commerceUserId: seedIds.users.commerceCentro,
    name: "Pudim",
    description: "Sobremesa individual de pudim.",
    priceBrl: "7.50",
    stock: 45,
    soldCount: 15,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.farmaciaDipirona,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Dipirona 1g",
    description: "Caixa com 10 comprimidos.",
    priceBrl: "9.90",
    stock: 130,
    soldCount: 60,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.farmaciaVitaminaC,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Vitamina C",
    description: "Suplemento de vitamina C com 30 capsulas.",
    priceBrl: "24.90",
    stock: 80,
    soldCount: 22,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.farmaciaProtetorSolar,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Protetor Solar FPS50",
    description: "Frasco 120ml para uso diario.",
    priceBrl: "39.90",
    stock: 50,
    soldCount: 18,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.farmaciaCurativo,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Curativo Adhesivo",
    description: "Caixa com 40 unidades.",
    priceBrl: "11.00",
    stock: 95,
    soldCount: 30,
    status: "active",
  },
  {
    id: seedIds.commerceData.products.farmaciaMascaraCirurgica,
    commerceUserId: seedIds.users.commerceFarmacia,
    name: "Mascara Cirurgica",
    description: "Pacote com 50 unidades.",
    priceBrl: "19.00",
    stock: 75,
    soldCount: 25,
    status: "hidden",
  },
];

export async function seedCommerceData({ prisma }: SeedContext): Promise<void> {
  for (const client of CLIENTS) {
    await prisma.commerce_clients.upsert({
      where: { id: client.id },
      update: {
        commerce_user_id: client.commerceUserId,
        name: client.name,
        phone_number: client.phoneNumber,
        email: client.email,
        cep: client.cep,
        state: client.state,
        city: client.city,
        neighborhood: client.neighborhood,
        street: client.street,
        number: client.number,
        complement: client.complement,
        notes: client.notes,
      },
      create: {
        id: client.id,
        commerce_user_id: client.commerceUserId,
        name: client.name,
        phone_number: client.phoneNumber,
        email: client.email,
        cep: client.cep,
        state: client.state,
        city: client.city,
        neighborhood: client.neighborhood,
        street: client.street,
        number: client.number,
        complement: client.complement,
        notes: client.notes,
      },
    });
  }

  for (const product of PRODUCTS) {
    await prisma.commerce_products.upsert({
      where: { id: product.id },
      update: {
        commerce_user_id: product.commerceUserId,
        name: product.name,
        description: product.description,
        price_brl: product.priceBrl,
        stock: product.stock,
        sold_count: product.soldCount,
        status: product.status,
      },
      create: {
        id: product.id,
        commerce_user_id: product.commerceUserId,
        name: product.name,
        description: product.description,
        price_brl: product.priceBrl,
        stock: product.stock,
        sold_count: product.soldCount,
        status: product.status,
      },
    });
  }
}
