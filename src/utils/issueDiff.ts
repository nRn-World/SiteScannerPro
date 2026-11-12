import type { ScannerIssue } from '../rules/types';

export interface IssueDiff {
  resolved: ScannerIssue[];
  remaining: ScannerIssue[];
  added: ScannerIssue[];
}

const DEVICE_SUFFIX = /\s*\((?:mobil|mobile|dator|desktop)[^)]*\)\s*$/i;

/** Stable across device-scoped scans: titles such as "… (Mobil)" compare to "…". */
function normalizeTitle(title: string): string {
  return title
    .replace(DEVICE_SUFFIX, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function issueKey(issue: ScannerIssue): string {
  return `${issue.category}::${normalizeTitle(issue.title)}`;
}

/**
 * Match findings by category + title. Duplicate findings with the same key are
 * consumed one-for-one so the counts stay honest.
 */
export function diffIssues(previous: ScannerIssue[], current: ScannerIssue[]): IssueDiff {
  const buckets = new Map<string, ScannerIssue[]>();
  for (const issue of previous) {
    const key = issueKey(issue);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(issue);
    else buckets.set(key, [issue]);
  }

  const remaining: ScannerIssue[] = [];
  const added: ScannerIssue[] = [];

  for (const issue of current) {
    const bucket = buckets.get(issueKey(issue));
    if (bucket?.length) {
      bucket.shift();
      remaining.push(issue);
    } else {
      added.push(issue);
    }
  }

  const resolved = [...buckets.values()].flat();
  return { resolved, remaining, added };
}

export function hasIssueChanges(diff: IssueDiff): boolean {
  return diff.resolved.length > 0 || diff.added.length > 0;
}
