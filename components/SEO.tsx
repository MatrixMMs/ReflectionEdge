import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Trade Report Card - Trading Analysis Dashboard',
  description = 'Analyze your trading performance with detailed reports, charts, and journaling. Import CSV data, track trades, and visualize your progress.',
  keywords = 'trading analysis, trade journal, trading dashboard, performance tracking, trading charts, CSV import',
  image = 'https://MatrixMMs.github.io/ReflectionEdge/og-image.png'
}) => {
  const siteUrl = 'https://MatrixMMs.github.io/ReflectionEdge';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}; 