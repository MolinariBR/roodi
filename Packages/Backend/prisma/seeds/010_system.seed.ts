import type { SeedContext } from "./_shared/context";

const SYSTEM_FLAGS: ReadonlyArray<{
  flag_key: string;
  enabled: boolean;
  description: string;
}> = [
  {
    flag_key: "allow_new_orders",
    enabled: true,
    description: "Permite criacao de novos pedidos pelos comerciantes.",
  },
  {
    flag_key: "allow_dispatch",
    enabled: true,
    description: "Permite distribuicao de pedidos para riders.",
  },
  {
    flag_key: "allow_payments",
    enabled: true,
    description: "Permite fluxos financeiros de creditos e pagamentos.",
  },
  {
    flag_key: "show_weather_addon",
    enabled: true,
    description: "Aplica adicional de clima na precificacao quando ativo.",
  },
  {
    flag_key: "pricing_admin_only",
    enabled: true,
    description: "Regras de precificacao sao exclusivas do painel admin.",
  },
  {
    flag_key: "reject_quote_on_distance_time_failure",
    enabled: true,
    description: "Falha total de distancia/tempo deve rejeitar cotacao.",
  },
];

export async function seedSystem({ prisma }: SeedContext): Promise<void> {
  await prisma.system_runtime_state.upsert({
    where: { singleton_id: 1 },
    update: {
      maintenance_enabled: false,
      maintenance_message: null,
      expected_back_at: null,
      min_supported_app_version: "1.0.0",
      force_update_enabled: false,
      updated_by_user_id: null,
    },
    create: {
      singleton_id: 1,
      maintenance_enabled: false,
      maintenance_message: null,
      expected_back_at: null,
      min_supported_app_version: "1.0.0",
      force_update_enabled: false,
      updated_by_user_id: null,
    },
  });

  for (const flag of SYSTEM_FLAGS) {
    await prisma.system_flags.upsert({
      where: { flag_key: flag.flag_key },
      update: {
        enabled: flag.enabled,
        description: flag.description,
        updated_by_user_id: null,
      },
      create: {
        flag_key: flag.flag_key,
        enabled: flag.enabled,
        description: flag.description,
        updated_by_user_id: null,
      },
    });
  }
}
