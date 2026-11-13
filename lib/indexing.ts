/**
 * Search-engine indexing switch (runtime, no rebuild needed).
 * Indexing is OFF unless SITE_INDEXING=true — so staging and preview
 * deployments are never indexed by accident. Set it only on production.
 */
export function indexingEnabled(): boolean {
  return process.env.SITE_INDEXING === 'true';
}

/** Model-training crawlers (not search/answer crawlers). Blocked only when the owner opts out. */
export const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', 'meta-externalagent', 'Bytespider'];

/** Search & answer-engine crawlers DAMA wants to reach (documentation / llms.txt). */
export const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'Googlebot', 'Bingbot'];
