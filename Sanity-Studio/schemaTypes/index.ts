// Sanity-Studio/schemaTypes/index.ts
import color from './color.schema'
import category from './category.schema'
import subcategory from './subcategory.schema'
import banner from './banner.schema'
import griditem from './grid_item.schema'
import product from './product.schema' // Import the new product schema
import size from './size.schema'     // Import the size schema

export const schemaTypes = [
  product,
  category,
  subcategory,
  banner,
  griditem,
  color,
  size,
]
