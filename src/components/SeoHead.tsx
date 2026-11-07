import React, { useEffect } from 'react';

export interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  urlPath?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  jsonLd?: Record<string, unknown>;
}

/**
 * Helper to update or create a meta tag by attribute selector
 */
function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create link tag (canonical)
 */
function setCanonicalTag(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Dynamic SEO Head component for React SPA:
 * Updates page title, meta description, OpenGraph tags, Twitter cards,
 * canonical link, and Schema.org JSON-LD structured data.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  image = '/assets/portfolio_crops/card_ipt.png',
  imageAlt,
  urlPath = '',
  type = 'article',
  publishedTime,
  author = 'Digital Effect | ديجيتال إفكت للحلول الرقمية',
  section,
  tags = [],
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const originalTitle = document.title;
    document.title = title;

    // 2. Resolve absolute URLs
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://digitaleffect.net';
    const canonicalUrl = urlPath 
      ? (urlPath.startsWith('http') ? urlPath : `${origin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`)
      : (typeof window !== 'undefined' ? window.location.href : 'https://digitaleffect.net');

    const absoluteImageUrl = image.startsWith('http') 
      ? image 
      : `${origin}${image.startsWith('/') ? '' : '/'}${image}`;

    // 3. Update Standard Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 4. Update OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', absoluteImageUrl);
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt || title);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Digital Effect | ديجيتال إفكت');

    if (publishedTime) {
      setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', publishedTime);
    }
    if (author) {
      setMetaTag('meta[property="article:author"]', 'property', 'article:author', author);
    }
    if (section) {
      setMetaTag('meta[property="article:section"]', 'property', 'article:section', section);
    }

    // 5. Update Twitter / X Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@digitaleffect');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', absoluteImageUrl);

    // 6. Update Canonical Link
    setCanonicalTag(canonicalUrl);

    // 7. Inject Schema.org JSON-LD Structured Data
    const scriptId = 'project-schema-ld-json';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = jsonLd || {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      headline: title,
      description: description,
      image: absoluteImageUrl,
      url: canonicalUrl,
      author: {
        '@type': 'Organization',
        name: 'Digital Effect',
        alternateName: 'ديجيتال إفكت للحلول الرقمية والتسويق',
        url: 'https://digitaleffect.net',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Digital Effect',
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/assets/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      keywords: tags.join(', '),
    };

    scriptTag.textContent = JSON.stringify(structuredData, null, 2);

    // Cleanup on unmount (restore base agency metadata)
    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, image, imageAlt, urlPath, type, publishedTime, author, section, tags, jsonLd]);

  return null;
};
