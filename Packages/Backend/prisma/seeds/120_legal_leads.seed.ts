import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";

export async function seedLegalAndPublicLeads({
  prisma,
}: SeedContext): Promise<void> {
  await prisma.legal_documents.upsert({
    where: { id: seedIds.legal.termosV1 },
    update: {
      doc_type: "termos",
      version: "2026.02",
      content:
        "Termos de uso do Roodi. Documento de referencia para ambiente de desenvolvimento.",
      is_active: true,
      updated_by_user_id: seedIds.users.admin,
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
    create: {
      id: seedIds.legal.termosV1,
      doc_type: "termos",
      version: "2026.02",
      content:
        "Termos de uso do Roodi. Documento de referencia para ambiente de desenvolvimento.",
      is_active: true,
      updated_by_user_id: seedIds.users.admin,
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
  });

  await prisma.legal_documents.upsert({
    where: { id: seedIds.legal.privacidadeV1 },
    update: {
      doc_type: "privacidade",
      version: "2026.02",
      content:
        "Politica de privacidade do Roodi para dados de comercio, rider e administracao.",
      is_active: true,
      updated_by_user_id: seedIds.users.admin,
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
    create: {
      id: seedIds.legal.privacidadeV1,
      doc_type: "privacidade",
      version: "2026.02",
      content:
        "Politica de privacidade do Roodi para dados de comercio, rider e administracao.",
      is_active: true,
      updated_by_user_id: seedIds.users.admin,
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
  });

  await prisma.legal_documents.upsert({
    where: { id: seedIds.legal.cookiesV1 },
    update: {
      doc_type: "cookies",
      version: "2026.02",
      content:
        "Politica de cookies utilizada pelos frontends web administrativos e landing page.",
      is_active: true,
      updated_by_user_id: seedIds.users.admin,
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
    create: {
      id: seedIds.legal.cookiesV1,
      doc_type: "cookies",
      version: "2026.02",
      content:
        "Politica de cookies utilizada pelos frontends web administrativos e landing page.",
      is_active: true,
      updated_by_user_id: seedIds.users.admin,
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
  });

  await prisma.public_leads.upsert({
    where: { id: seedIds.publicLeads.commerceLead },
    update: {
      lead_type: "commerce",
      name: "Mercado Avenida",
      contact: "contato@mercadoavenida.com.br",
      message: "Interesse em usar o Roodi para entregas no horario de pico.",
      source: "landing:hero-form",
      created_at: new Date("2026-02-16T10:30:00.000Z"),
    },
    create: {
      id: seedIds.publicLeads.commerceLead,
      lead_type: "commerce",
      name: "Mercado Avenida",
      contact: "contato@mercadoavenida.com.br",
      message: "Interesse em usar o Roodi para entregas no horario de pico.",
      source: "landing:hero-form",
      created_at: new Date("2026-02-16T10:30:00.000Z"),
    },
  });

  await prisma.public_leads.upsert({
    where: { id: seedIds.publicLeads.riderLead },
    update: {
      lead_type: "rider",
      name: "Lucas Rider",
      contact: "+559998887766",
      message: "Quero me cadastrar como rider no bairro Centro.",
      source: "landing:rider-section",
      created_at: new Date("2026-02-16T10:40:00.000Z"),
    },
    create: {
      id: seedIds.publicLeads.riderLead,
      lead_type: "rider",
      name: "Lucas Rider",
      contact: "+559998887766",
      message: "Quero me cadastrar como rider no bairro Centro.",
      source: "landing:rider-section",
      created_at: new Date("2026-02-16T10:40:00.000Z"),
    },
  });

  await prisma.public_leads.upsert({
    where: { id: seedIds.publicLeads.partnerLead },
    update: {
      lead_type: "partnership",
      name: "Associacao Comercial de Imperatriz",
      contact: "parcerias@aci.example",
      message: "Solicitamos proposta de parceria para rede local de comercios.",
      source: "landing:contact",
      created_at: new Date("2026-02-16T10:50:00.000Z"),
    },
    create: {
      id: seedIds.publicLeads.partnerLead,
      lead_type: "partnership",
      name: "Associacao Comercial de Imperatriz",
      contact: "parcerias@aci.example",
      message: "Solicitamos proposta de parceria para rede local de comercios.",
      source: "landing:contact",
      created_at: new Date("2026-02-16T10:50:00.000Z"),
    },
  });
}
