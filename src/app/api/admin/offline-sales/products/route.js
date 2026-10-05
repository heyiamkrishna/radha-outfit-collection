import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        base_price,
        compare_price,
        is_active
      `)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (productsError) {
      console.error("PRODUCTS QUERY ERROR:", productsError);

      return NextResponse.json(
        {
          success: false,
          error: productsError.message,
          code: productsError.code,
          details: productsError.details,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const safeProducts = Array.isArray(products) ? products : [];

    if (safeProducts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          products: [],
          count: 0,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const productIds = safeProducts.map((product) => product.id);

    const {
      data: variants,
      error: variantsError,
    } = await supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        sku,
        size,
        color,
        stock_quantity,
        price
      `)
      .in("product_id", productIds)
      .order("created_at", {
        ascending: true,
      });

    if (variantsError) {
      console.error("VARIANTS QUERY ERROR:", variantsError);

      return NextResponse.json(
        {
          success: false,
          error: variantsError.message,
          code: variantsError.code,
          details: variantsError.details,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const safeVariants = Array.isArray(variants)
      ? variants
      : [];

    const variantsByProduct = new Map();

    for (const variant of safeVariants) {
      if (!variantsByProduct.has(variant.product_id)) {
        variantsByProduct.set(variant.product_id, []);
      }

      variantsByProduct
        .get(variant.product_id)
        .push(variant);
    }

    const result = [];

    for (const product of safeProducts) {
      const productVariants =
        variantsByProduct.get(product.id) || [];

      /*
       * PRODUCTS WITH VARIANTS
       */
      if (productVariants.length > 0) {
        const availableVariants =
          productVariants.filter(
            (variant) =>
              Number(variant.stock_quantity || 0) > 0
          );

        for (const variant of availableVariants) {
          const stock = Number(
            variant.stock_quantity || 0
          );

          const price =
            variant.price !== null &&
            variant.price !== undefined
              ? Number(variant.price)
              : Number(product.base_price || 0);

          result.push({
            id: variant.id,

            product_id: product.id,

            name: product.name,

            product_name: product.name,

            slug: product.slug,

            variant_id: variant.id,

            sku: variant.sku || null,

            size: variant.size || null,

            color: variant.color || null,

            price,

            base_price: Number(
              product.base_price || 0
            ),

            compare_price:
              product.compare_price !== null &&
              product.compare_price !== undefined
                ? Number(product.compare_price)
                : null,

            stock_quantity: stock,

            available: stock > 0,

            has_variants: true,
          });
        }

        continue;
      }

      /*
       * PRODUCTS WITHOUT VARIANTS
       */
      result.push({
        id: product.id,

        product_id: product.id,

        name: product.name,

        product_name: product.name,

        slug: product.slug,

        variant_id: null,

        sku: null,

        size: null,

        color: null,

        price: Number(product.base_price || 0),

        base_price: Number(
          product.base_price || 0
        ),

        compare_price:
          product.compare_price !== null &&
          product.compare_price !== undefined
            ? Number(product.compare_price)
            : null,

        stock_quantity: null,

        available: true,

        has_variants: false,
      });
    }

    return NextResponse.json(
      {
        success: true,
        products: result,
        count: result.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "OFFLINE PRODUCTS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load offline products.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

/*
 * Explicitly reject unsupported methods.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "POST is not allowed on this endpoint. Use GET.",
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
      },
    }
  );
}