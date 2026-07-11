import { assertCredentialReference } from "./security/redaction.js";

export interface CredentialStore {
  resolve(reference: string): Promise<string>;
  set(reference: string, value: string): Promise<void>;
  delete(reference: string): Promise<boolean>;
}

export class CompositeCredentialStore implements CredentialStore {
  readonly serviceName: string;

  constructor(serviceName = "appsforgood-agent-kit") {
    this.serviceName = serviceName;
  }

  async resolve(reference: string): Promise<string> {
    assertCredentialReference(reference);
    if (reference.startsWith("env:")) {
      const name = reference.slice("env:".length);
      const value = process.env[name];
      if (!value) throw new Error(`Credential environment variable is not set: ${name}`);
      return value;
    }
    const account = reference.slice("keychain:".length);
    const { AsyncEntry } = await this.loadKeyring();
    const value = await new AsyncEntry(this.serviceName, account).getPassword();
    if (!value) throw new Error(`No OS keychain credential exists for account: ${account}`);
    return value;
  }

  async set(reference: string, value: string): Promise<void> {
    assertCredentialReference(reference);
    if (reference.startsWith("env:")) throw new Error("Environment credentials are read-only; set them in the process environment.");
    if (!value) throw new Error("Credential value is required.");
    const account = reference.slice("keychain:".length);
    const { AsyncEntry } = await this.loadKeyring();
    await new AsyncEntry(this.serviceName, account).setPassword(value);
  }

  async delete(reference: string): Promise<boolean> {
    assertCredentialReference(reference);
    if (reference.startsWith("env:")) throw new Error("Environment credentials cannot be deleted by Agent Kit.");
    const account = reference.slice("keychain:".length);
    const { AsyncEntry } = await this.loadKeyring();
    return new AsyncEntry(this.serviceName, account).deleteCredential();
  }

  private async loadKeyring(): Promise<typeof import("@napi-rs/keyring")> {
    try {
      return await import("@napi-rs/keyring");
    } catch {
      throw new Error("OS keychain support is unavailable on this machine. Use an env:NAME reference or reinstall the optional keyring package.");
    }
  }
}
