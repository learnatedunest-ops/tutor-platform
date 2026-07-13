import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
}

const DEFAULT_IMAGE = "/api/img/og-social-banner_a6bd98e7.png";
const SITE_NAME = "EduNest";
const BASE_URL = "https://edunest.courses";

export default function SEO({
  title = "EduNest - Find Verified Home Tutors in Bengaluru",
  description = "EduNest connects students with verified, experienced home tutors in Bengaluru. CBSE, ICSE, IB, and all boards. Free demo class. Serving Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar and more.",
  keywords = "home tutor Bengaluru, tutor near me, home tuition Bengaluru, CBSE tutor, ICSE tutor, EduNest",
  url = BASE_URL,
  image = DEFAULT_IMAGE,
}: SEOProps) {
  const fullTitle = title.includes("EduNest") ? title : `${title} | EduNest`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
