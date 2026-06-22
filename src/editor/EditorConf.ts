import { Link as LinkExtension, type LinkOptions } from "@tiptap/extension-link";

const ALLOWED_PROTOCOLS = ["http", "https"];
const DISALLOWED_PROTOCOLS = ["ftp", "file", "mailto"];

interface IsAllowedUriContext {
  defaultProtocol: string;
  defaultValidate: (url: string) => boolean;
  protocols: (string | { scheme: string })[];
}

/**
 * Validate a URL the user is trying to turn into (or autolink as) a link.
 * Rejects anything that isn't an http(s) URL — closes the door on
 * `javascript:`, `data:`, `file:`, etc.
 */
const isAllowedUri = (url: string, ctx: IsAllowedUriContext): boolean => {
  try {
    const parsedUrl = url.includes(":") ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`);
    if (!ctx.defaultValidate(parsedUrl.href)) return false;
    const protocol = parsedUrl.protocol.replace(":", "");
    if (DISALLOWED_PROTOCOLS.includes(protocol)) return false;
    const allowed = ctx.protocols.map((p) => (typeof p === "string" ? p : p.scheme));
    if (!allowed.includes(protocol)) return false;
    return true;
  } catch {
    return false;
  }
};

// Domains that should never be auto-linked when typed as bare text.
const DISALLOWED_AUTOLINK_DOMAINS = ["example-no-autolink.com", "another-no-autolink.com"];

const shouldAutoLink = (url: string): boolean => {
  try {
    const parsedUrl = url.includes(":") ? new URL(url) : new URL(`https://${url}`);
    return !DISALLOWED_AUTOLINK_DOMAINS.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
};

const linkOptions: Partial<LinkOptions> = {
  openOnClick: true,
  HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
  autolink: true,
  defaultProtocol: "https",
  protocols: ALLOWED_PROTOCOLS as unknown as LinkOptions["protocols"],
  isAllowedUri,
  shouldAutoLink,
};

const linkExtensionInstance = LinkExtension.configure(linkOptions);

export const getLinkExtension = () => linkExtensionInstance;

export default getLinkExtension;
