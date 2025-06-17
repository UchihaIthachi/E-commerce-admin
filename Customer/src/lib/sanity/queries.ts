// Customer/src/lib/sanity/queries.ts

// Query for a single product by its slug
export const GET_PRODUCT_BY_SLUG_QUERY = `
  query GetProductBySlug($slug: String!) {
    allProduct(where: { slug: { current: { eq: $slug } }, status: {eq: "active"} }, limit: 1) {
      _id
      name
      slug { current }
      descriptionRaw: description // Fetch raw portable text blocks
      excerpt
      sku
      price
      salePrice
      isFeatured
      mainImage {
        asset {
          _id
          url
          metadata { dimensions { width, height } }
        }
        alt
      }
      additionalImages[] {
        asset {
          _id
          url
          metadata { dimensions { width, height } }
        }
        alt
      }
      categories[]-> {
        _id
        name
        slug { current }
      }
      subcategories[]-> {
        _id
        name
        slug { current }
      }
      status
      stockQuantity
      brand
      tags
      variants[] {
        _key
        name
        sku
        price
        salePrice
        stockQuantity
        image {
          asset {
            _id
            url
            metadata { dimensions { width, height } }
          }
          alt
        }
        color
        size
        weight
        dimensions {
          length
          width
          height
        }
      }
      seo {
        title
        description
        og_image {
          asset {
            _id
            url
          }
        }
      }
    }
  }
`;

// Query for products by category slug, including category details
export const GET_PRODUCTS_BY_CATEGORY_SLUG_QUERY = `
  query GetProductsByCategorySlug($categorySlug: String!, $limit: Int = 10, $offset: Int = 0) {
    # Fetch products in the category
    productsInCategory: allProduct(
      where: {
        categories_some: { slug: { current: { eq: $categorySlug } } }, # Assumes direct filtering capability
        status: { eq: "active" }
      },
      limit: $limit,
      offset: $offset,
      sort: { _createdAt: DESC }
    ) {
      _id
      name
      slug { current }
      price
      salePrice
      mainImage {
        asset {
          url
          metadata { dimensions { width, height } }
        }
        alt
      }
      excerpt
      categories[]->{name, slug{current}}
    }

    # Fetch category details for the page header
    categoryDetails: allCategory(where: { slug: { current: { eq: $categorySlug } } }, limit: 1) {
      _id
      name
      slug { current }
      # description // Assuming categories might have a description field in their Sanity schema
      seo { title, description, og_image { asset { url } } }
    }
  }
`;

// Query for featured products
export const GET_FEATURED_PRODUCTS_QUERY = `
  query GetFeaturedProducts($limit: Int = 4) {
    allProduct(
        where: { isFeatured: { eq: true }, status: {eq: "active"} },
        limit: $limit,
        sort: {_createdAt: DESC}
    ) {
      _id
      name
      slug { current }
      price
      salePrice
      mainImage {
        asset {
          url
          metadata { dimensions { width, height } }
        }
        alt
      }
      excerpt
      categories[]->{name, slug{current}}
    }
  }
`;

// Query for a single category's details by slug
export const GET_CATEGORY_BY_SLUG_QUERY = `
  query GetCategoryBySlug($slug: String!) {
    allCategory(where: {slug: {current: {eq: $slug}}}, limit: 1) {
      _id
      name
      slug { current }
      # description // If category schema has a description field
      seo { title, description, og_image { asset { url } } }
      # subcategories[]->{ _id, name, slug { current } } // If category schema has direct refs to subcategories
    }
  }
`;

// Query for all categories (e.g., for navigation)
export const GET_ALL_CATEGORIES_QUERY = `
  query GetAllCategories {
    allCategory(sort: {name: ASC}) {
      _id
      name
      slug { current }
      _updatedAt # For lastmod
      # subcategories[]-> { _id, name, slug { current } } // If category schema links to its subcategories
    }
  }
`;

// Add to Customer/src/lib/sanity/queries.ts
export const GET_ALL_ACTIVE_PRODUCTS_FOR_SITEMAP_QUERY = `
  query GetAllActiveProductsForSitemap {
    allProduct(where: { status: {eq: "active"} }) {
      slug { current }
      _updatedAt # For lastmod
    }
  }
`;

// Query for all subcategories (optional, if needed directly)
export const GET_ALL_SUBCATEGORIES_QUERY = `
  query GetAllSubcategories {
    allSubcategory(sort: {name: ASC}) {
      _id
      name
      slug { current }
      category-> { # Parent category
        _id
        name
        slug { current }
      }
    }
  }
`;
