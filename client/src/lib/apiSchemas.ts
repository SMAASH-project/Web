import { z } from "zod";

const loginResponseSchema = z.object({
  id: z.number(),
  role: z.string(),
});

const whoAmIResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  role: z.string(),
  is_banned: z.boolean(),
  last_login: z.string(),
});

const profileResponseSchema = z.object({
  id: z.number(),
  display_name: z.string(),
  coins: z.number(),
  last_login: z.string(),
  avatar_url: z.string().optional(),
});

const addProfileResponseSchema = z.object({
  id: z.number(),
  display_name: z.string(),
  coins: z.number(),
  last_login: z.string(),
});

const itemReadSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  rarity: z.string(),
  categories: z.array(z.string()),
});

const purchaseReadSchema = z.object({
  id: z.number(),
  item: z.string(),
  count: z.number(),
  total: z.number(),
  profile: z.string(),
  date: z.string(),
});

const profileListSchema = z.array(profileResponseSchema);
const itemListSchema = z.array(itemReadSchema);
const purchaseListSchema = z.array(purchaseReadSchema).nullable();

interface KnownSchemaRule {
  method: "get" | "post";
  path: RegExp;
  schema: z.ZodTypeAny;
}

const KNOWN_RESPONSE_SCHEMAS: KnownSchemaRule[] = [
  {
    method: "post",
    path: /^\/auth\/login$/,
    schema: loginResponseSchema,
  },
  {
    method: "get",
    path: /^\/users\/whoami$/,
    schema: whoAmIResponseSchema,
  },
  {
    method: "get",
    path: /^\/users\/\d+\/profiles$/,
    schema: profileListSchema,
  },
  {
    method: "post",
    path: /^\/users\/\d+\/profiles$/,
    schema: addProfileResponseSchema,
  },
  {
    method: "get",
    path: /^\/items$/,
    schema: itemListSchema,
  },
  {
    method: "get",
    path: /^\/profiles\/\d+\/purchases$/,
    schema: purchaseListSchema,
  },
];

function normalizePath(url: string | undefined): string {
  if (!url) return "";

  let value = url;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      value = new URL(value).pathname;
    } catch {
      // fallback to raw
    }
  }

  const queryIndex = value.indexOf("?");
  const pathOnly = queryIndex >= 0 ? value.slice(0, queryIndex) : value;
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
}

export function validateKnownApiResponse(
  method: string | undefined,
  url: string | undefined,
  data: unknown,
): { matched: boolean; data: unknown } {
  const normalizedMethod = (method ?? "get").toLowerCase();
  const normalizedPath = normalizePath(url);

  for (const rule of KNOWN_RESPONSE_SCHEMAS) {
    if (rule.method !== normalizedMethod || !rule.path.test(normalizedPath)) {
      continue;
    }

    const parsed = rule.schema.safeParse(data);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      throw new Error(
        `[API schema validation failed] ${normalizedMethod.toUpperCase()} ${normalizedPath} -> ${details}`,
      );
    }

    return { matched: true, data: parsed.data };
  }

  return { matched: false, data };
}
