/**
 * related-posts.ts
 *
 * Picks the "More from the journal" posts at the foot of each blog post.
 * Before this, a post was linked only from the /blog index, so Google had one
 * path to each of them and left most "Discovered – currently not indexed".
 *
 * Order: posts sharing topic words in the title or slug (penthouse, nri,
 * sindhu, rental…), then the same category; ties go to the next posts in
 * listing order (wrapping round). The last slot is always the next post in
 * listing order, so every post is picked by at least one other post instead
 * of a few topic-heavy posts collecting every link.
 */

import type { BlogPost } from "@/types/blog";

// Words on nearly every post: they say nothing about the topic.
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "by", "for", "from", "guide", "how", "in", "is", "of", "on",
  "or", "the", "to", "vs", "what", "why", "with", "your", "you",
  "ahmedabad", "gujarat", "india", "luxury", "real", "estate", "property", "properties", "market",
  "2025", "2026", "2027", "pikorua", "premium", "investor", "investors", "investment",
]);

function topicWords(post: BlogPost): Set<string> {
  const text = `${post.title} ${post.slug.replace(/-/g, " ")}`.toLowerCase();
  return new Set(
    text
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
      .map((word) => word.replace(/s$/, ""))
  );
}

export function getRelatedPosts(current: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const pool = posts.filter((post) => post.slug !== current.slug);
  if (pool.length === 0) return [];

  const words = topicWords(current);
  const startIndex = Math.max(0, posts.findIndex((post) => post.slug === current.slug));
  const distance = (post: BlogPost) => (posts.indexOf(post) - startIndex + posts.length) % posts.length;
  const shared = (post: BlogPost) => [...topicWords(post)].filter((word) => words.has(word)).length;
  const score = (post: BlogPost) => Math.min(shared(post), 3) * 2 + (post.category === current.category ? 1 : 0);

  // Best topic matches fill all but the last slot. The last slot is the next
  // post in listing order not already chosen, so every post is linked from at
  // least the post before it, however its title words score.
  const byTopic = [...pool].sort((a, b) => score(b) - score(a) || distance(a) - distance(b));
  const picked = byTopic.slice(0, Math.max(0, limit - 1));
  const next = [...pool].sort((a, b) => distance(a) - distance(b)).find((post) => !picked.includes(post));
  return next && picked.length < limit ? [...picked, next] : picked;
}
