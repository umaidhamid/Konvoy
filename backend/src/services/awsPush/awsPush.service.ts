import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";
import { projectFileService } from "../ProjectFile/projectfile.service.js";
import { AppError } from "../../utils/AppError.js";
import { parseEnv } from "../../utils/parseEnv.js";

const MAX_KEYS_PER_PUSH = 200;
const REGION_PATTERN = /^[a-z]{2}(-gov)?-[a-z]+-\d$/;

// Error codes the AWS SDK raises for bad/expired/unauthorized credentials - once we see one of
// these there's no point retrying the remaining keys, they'll all fail the same way.
const AUTH_ERROR_NAMES = new Set([
  "UnrecognizedClientException",
  "InvalidClientTokenId",
  "AccessDeniedException",
  "AccessDenied",
  "ExpiredTokenException",
  "SignatureDoesNotMatch",
  "InvalidSignatureException",
  "AuthFailure",
  "CredentialsProviderError",
]);

export interface AwsPushCredentials {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AwsPushKeyResult {
  key: string;
  name: string;
  status: "created" | "updated" | "failed" | "skipped";
  error?: string;
}

const normalizePrefix = (prefix: string) => {
  const trimmed = prefix.trim().replace(/\/+$/, "");
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  // Each '/'-separated segment must be non-empty, so "//" or a leading "/" beyond the first
  // can't sneak through and produce a malformed parameter name like "/konvoy//prod/KEY".
  if (!/^\/[a-zA-Z0-9_.\-]+(\/[a-zA-Z0-9_.\-]+)*$/.test(withLeadingSlash)) {
    throw new AppError("Parameter prefix can only contain letters, numbers, '.', '-', '_' and '/' between non-empty segments", 400);
  }
  // AWS rejects any parameter name that STARTS WITH "aws" or "ssm" (case-insensitive) in its
  // first path segment - not just an exact "aws"/"ssm" segment, e.g. "/awsome/x" is rejected too.
  // Catch it here instead of burning a failed API call per key to discover the same thing.
  const firstSegment = (withLeadingSlash.split("/")[1] || "").toLowerCase();
  if (firstSegment.startsWith("aws") || firstSegment.startsWith("ssm")) {
    throw new AppError('Parameter names can\'t start with "aws" or "ssm" - those prefixes are reserved by AWS', 400);
  }
  return withLeadingSlash;
};

const validateCredentials = (creds: AwsPushCredentials) => {
  if (!REGION_PATTERN.test(creds.region)) {
    throw new AppError('That doesn\'t look like a valid AWS region (e.g. "us-east-1")', 400);
  }
  if (!/^[A-Z0-9]{16,128}$/.test(creds.accessKeyId)) {
    throw new AppError("That access key ID doesn't look valid - it should be an uppercase alphanumeric string", 400);
  }
  if (creds.secretAccessKey.trim().length < 20) {
    throw new AppError("That secret access key looks too short to be valid", 400);
  }
};

export const awsPushService = {
  // Pushes a project file's KEY=VALUE lines into AWS SSM Parameter Store. Credentials come from
  // the request only - never stored, never logged - the same trust model as running
  // `aws ssm put-parameter` yourself.
  async pushToParameterStore(
    fileId: string,
    userId: string,
    creds: AwsPushCredentials,
    prefix: string,
    overwrite: boolean,
    secure: boolean
  ): Promise<{ file: { id: string; name: string }; prefix: string; results: AwsPushKeyResult[] }> {
    const file = await projectFileService.getProjectFileById(fileId, userId);
    const map = parseEnv(file.content || "");
    const keys = Object.keys(map);

    if (keys.length === 0) {
      throw new AppError("This file doesn't have any KEY=VALUE lines to push", 400);
    }
    if (keys.length > MAX_KEYS_PER_PUSH) {
      throw new AppError(`This file has more than ${MAX_KEYS_PER_PUSH} keys - split it before pushing`, 400);
    }

    validateCredentials(creds);
    const normalizedPrefix = normalizePrefix(prefix);
    const client = new SSMClient({
      region: creds.region,
      credentials: { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey },
    });

    const results: AwsPushKeyResult[] = [];
    let stopReason: string | null = null;

    for (const key of keys) {
      const name = `${normalizedPrefix}/${key}`;

      if (stopReason) {
        results.push({ key, name, status: "skipped", error: `Skipped after the error above (${stopReason})` });
        continue;
      }

      try {
        const response = await client.send(
          new PutParameterCommand({
            Name: name,
            Value: map[key],
            Type: secure ? "SecureString" : "String",
            Overwrite: overwrite,
          })
        );
        // Version 1 means this parameter didn't exist before; the overwrite flag only says
        // whether we WOULD replace an existing one, not whether this particular key already did.
        results.push({ key, name, status: response.Version && response.Version > 1 ? "updated" : "created" });
      } catch (error: any) {
        const isAuthError = AUTH_ERROR_NAMES.has(error?.name);
        const message =
          error?.name === "ParameterAlreadyExists"
            ? "Already exists (enable overwrite to replace it)"
            : error?.message || "Failed to write parameter";
        results.push({ key, name, status: "failed", error: message });
        if (isAuthError) stopReason = message;
      }
    }

    return { file: { id: String(file._id), name: file.name }, prefix: normalizedPrefix, results };
  },
};
