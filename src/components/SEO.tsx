import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({ title, description, image, url, type = "website" }: SEOProps) => (
  <Helmet>
    <title>{`${title} — Fonte de Alegria`}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={`${title} — Fonte de Alegria`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    {image && <meta property="og:image" content={image} />}
    {url && <meta property="og:url" content={url} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@fontedealegriadiaria" />
  </Helmet>
);