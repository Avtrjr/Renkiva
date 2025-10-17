/**
 * URL Validation Utility - SSRF Protection
 * Prevents Server-Side Request Forgery attacks by validating webhook URLs
 */

const PRIVATE_IP_RANGES = [
  /^127\./,                           // 127.0.0.0/8 (localhost)
  /^10\./,                            // 10.0.0.0/8 (private)
  /^172\.(1[6-9]|2[0-9]|3[01])\./,   // 172.16.0.0/12 (private)
  /^192\.168\./,                      // 192.168.0.0/16 (private)
  /^169\.254\./,                      // 169.254.0.0/16 (link-local)
  /^0\./,                             // 0.0.0.0/8 (invalid)
  /^224\./,                           // 224.0.0.0/4 (multicast)
  /^240\./,                           // 240.0.0.0/4 (reserved)
  /^::1$/,                            // IPv6 localhost
  /^fe80:/i,                          // IPv6 link-local
  /^fc00:/i,                          // IPv6 private
  /^fd00:/i,                          // IPv6 private
];

const METADATA_ENDPOINTS = [
  'metadata.google.internal',
  '169.254.169.254',
  'fd00:ec2::254',
];

export interface URLValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a webhook URL to prevent SSRF attacks
 */
export function validateWebhookURL(urlString: string): URLValidationResult {
  try {
    const url = new URL(urlString);

    // Only allow HTTPS protocol
    if (url.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Only HTTPS URLs are allowed for webhooks',
      };
    }

    // Check for metadata endpoints
    if (METADATA_ENDPOINTS.some(endpoint => url.hostname.includes(endpoint))) {
      return {
        valid: false,
        error: 'Metadata endpoints are not allowed',
      };
    }

    // Check for localhost
    if (url.hostname === 'localhost' || url.hostname === '0.0.0.0') {
      return {
        valid: false,
        error: 'Localhost URLs are not allowed',
      };
    }

    // Check if hostname is an IP address
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(url.hostname)) {
      // Check against private IP ranges
      if (PRIVATE_IP_RANGES.some(range => range.test(url.hostname))) {
        return {
          valid: false,
          error: 'Private IP addresses are not allowed',
        };
      }
    }

    // Hostname must have at least one dot (prevent single-word hostnames)
    if (!url.hostname.includes('.')) {
      return {
        valid: false,
        error: 'Invalid hostname format',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
}
