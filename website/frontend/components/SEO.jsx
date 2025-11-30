import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Axolop - The New Age CRM with Local AI Second Brain | All-in-One Platform', 
  description = 'Axolop: The New Age CRM with Local AI Second Brain. Replace 10+ tools with our all-in-one platform. HubSpot competitor for ECOMMERCE, B2B BUSINESS, REAL ESTATE. Features: AI assistant, Project Management, Mind Maps, Marketing Automation.',
  keywords = 'CRM, Axolop, HubSpot alternative, AI CRM, sales automation, marketing automation, project management, mind maps, business automation, GoHighLevel competitor, e-commerce CRM, B2B CRM, real estate CRM, AI assistant',
  url = 'https://www.axolop.com',
  image = 'https://www.axolop.com/axolop-og-image.jpg',
  twitterImage = 'https://www.axolop.com/axolop-twitter-image.jpg',
  type = 'website',
  author = 'Axolop LLC',
  rating = '4.8',
  reviewCount = '250',
  price = '149.00',
  priceCurrency = 'USD',
  affiliateName = null
}) => {
  // Dynamic content based on affiliate
  const seoTitle = affiliateName 
    ? `Join ${affiliateName}'s Team - ${title}` 
    : title;
  
  const seoDescription = affiliateName
    ? `Join ${affiliateName}'s team with a 30-day free trial of Axolop. ${description}`
    : description;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#3F0D28" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="Axolop - All-in-One Business Platform" />
      <meta property="og:site_name" content="Axolop" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:image:alt" content="Axolop - All-in-One Business Platform" />
      <meta name="twitter:site" content="@axolopcrm" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Axolop",
          "description": seoDescription,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": price,
            "priceCurrency": priceCurrency,
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewCount
          },
          "creator": {
            "@type": "Organization",
            "name": author
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;