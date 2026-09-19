import { products } from "./products";

export const shopCategories = Array.from(
  new Map(
    products.map((product) => [
      product.category.slug,
      {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
    ]),
  ).values(),
);

export const shopBrands = Array.from(
  new Map(
    products
      .filter((product) => product.brand !== null)
      .map((product) => [
        product.brand!.slug,
        {
          id: product.brand!.id,
          name: product.brand!.name,
          slug: product.brand!.slug,
        },
      ]),
  ).values(),
);