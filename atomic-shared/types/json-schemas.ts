import { z } from 'zod';

// ____________________Manifest Json____________________
export const VersionSchema = z.object({
  id: z.string(),
  type: z.string(),
  url: z.string(),
  time: z.string(),
  releaseTime: z.string(),
});

export const VersionManifestSchema = z.object({
  latest: z.object({
    release: z.string(),
    snapshot: z.string(),
  }),
  versions: z.array(VersionSchema),
});

export type VersionManifest = z.infer<typeof VersionManifestSchema>;
export type Version = z.infer<typeof VersionSchema>;

// ____________________Version Json____________________
const RuleSchema = z.object({
  action: z.enum(['allow', 'disallow']),
  os: z
    .object({
      name: z.string().optional(),
      arch: z.string().optional(),
    })
    .optional(),
  features: z.record(z.union([z.string(), z.boolean()])).optional(),
});

const RuleWithValueSchema = z.object({
  rules: z.array(RuleSchema),
  value: z.union([z.string(), z.array(z.string())]),
});

const ArgumentsSchema = z.object({
  game: z.array(z.union([z.string(), RuleWithValueSchema])),
  jvm: z.array(z.union([RuleWithValueSchema, z.string()])),
});

const AssetArtifactSchema = z.object({
  sha1: z.string(),
  size: z.number(),
  url: z.string().url(),
});

const ArtifactSchema = z.object({
  path: z.string(),
  sha1: z.string(),
  size: z.number(),
  url: z.string().url(),
});

const LibrarySchema = z.object({
  downloads: z.object({
    artifact: ArtifactSchema,
  }),
  name: z.string(),
  rules: z.array(RuleSchema).optional(),
});

const AssetsSchema = z.object({
  client: AssetArtifactSchema,
  client_mappings: AssetArtifactSchema.optional(),
  server: AssetArtifactSchema.optional(),
  server_mappings: AssetArtifactSchema.optional(),
});

const AssetIndexScheme = z.object({
  id: z.string(),
  sha1: z.string(),
  size: z.number(),
  totalSize: z.number(),
  url: z.string().url(),
});

const LoggingSchema = z.object({
  argument: z.string(),
  file: z.object({
    id: z.string(),
    sha1: z.string(),
    size: z.number(),
    url: z.string().url(),
  }),
  type: z.string(),
});

export const VanillaJsonSchema = z.object({
  arguments: ArgumentsSchema,
  assetIndex: AssetIndexScheme,
  assets: z.string(),
  complianceLevel: z.number(),
  downloads: AssetsSchema,
  id: z.string(),
  javaVersion: z.object({
    component: z.string(),
    majorVersion: z.number(),
  }),
  libraries: z.array(LibrarySchema),
  logging: z.object({
    client: LoggingSchema.optional(),
  }),
  mainClass: z.string(),
  minimumLauncherVersion: z.number(),
  releaseTime: z.string(),
  time: z.string(),
  type: z.string(),
});

export const ForgeJsonSchema = z.object({
  _comment_: z.array(z.string()),
  id: z.string(),
  time: z.string(),
  releaseTime: z.string(),
  type: z.string(),
  mainClass: z.string(),
  inheritsFrom: z.string(),
  logging: z.object({
    client: LoggingSchema.optional(),
  }),
  arguments: ArgumentsSchema,
  libraries: z.array(LibrarySchema),
});

export type VanillaJson = z.infer<typeof VanillaJsonSchema>;
export type ForgeJson = z.infer<typeof ForgeJsonSchema>;
export type Library = z.infer<typeof LibrarySchema>;
export type Rule = z.infer<typeof RuleSchema>;

// ____________________Asset Index____________________
export const AssetIndexJsonSchema = z.object({
  objects: z.record(
    z.object({
      hash: z.string(),
      size: z.number(),
    })
  ),
});

export type AssetIndexJson = z.infer<typeof AssetIndexJsonSchema>;

// ____________________S3 Profile Version Index____________________
const MinecraftVersionSchema = z.object({
  version: z.string(),
  type: z.enum(['vanilla', 'forge']),
  vanillaVersion: z.string().optional(),
});

const ProfileVersionSchema = z.object({
  id: z.string(),
  file: z.string(),
  sha256: z.string(),
  size: z.number(),
  timestamp: z.string(),
  minecraft: MinecraftVersionSchema,
});

export const ProfileVersionListSchema = z.object({
  profileType: z.enum(['map', 'server']),
  versions: z.array(ProfileVersionSchema),
});

export type ProfileVersionList = z.infer<typeof ProfileVersionListSchema>;

export const LatestProfileVersionSchema = ProfileVersionSchema.extend({
  profileType: z.enum(['map', 'server']),
});

export type LatestProfileVersion = z.infer<typeof LatestProfileVersionSchema>;

// ____________________Version Config____________________
export const VersionConfigSchema = z.array(z.string());

export type VersionConfig = z.infer<typeof VersionConfigSchema>;

// ____________________Profile Config____________________
export const ProfileConfigSchema = z.record(
  z.object({
    minecraft: MinecraftVersionSchema,
    version: z.string(),
  })
);

export type ProfileConfig = z.infer<typeof ProfileConfigSchema>;
