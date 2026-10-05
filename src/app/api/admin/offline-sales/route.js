import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
|--------------------------------------------------------------------------
| POST /api/admin/offline-sales
|--------------------------------------------------------------------------
| Creates an offline POS sale.
|
| Uses:
|   offline_sales
|   offline_sale_items
|   product_variants
|
| IMPORTANT:
| variant_id belongs to offline_sale_items,
| NOT offline_sales.
|--------------------------------------------------------------------------
*/

export async function POST(request) {
  try {
    const supabase = await createClient();

    /*
    |--------------------------------------------------------------------------
    | 1. READ REQUEST
    |--------------------------------------------------------------------------
    */

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const {
      customer_id = null,
      customer_name = "Walk-in Customer",
      customer_phone = null,
      customer_email = null,

      email = null,
      whatsapp_number = null,

      contact_type = null,
      contact_value = null,

      payment_method = "CASH",

      subtotal = 0,
      discount_amount = 0,
      tax_amount = 0,
      shipping_amount = 0,
      total_amount = null,
      grand_total = null,

      notes = null,

      items = [],
    } = body;

    /*
    |--------------------------------------------------------------------------
    | 2. VALIDATE ITEMS
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one sale item is required.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. NORMALIZE ITEMS
    |--------------------------------------------------------------------------
    */

    const normalizedItems = items.map((item) => {
      const productId =
        item?.product_id ||
        item?.productId ||
        null;

      const variantId =
        item?.variant_id ||
        item?.variantId ||
        null;

      const quantity = Number(item?.quantity || 0);

      const unitPrice = Number(
        item?.unit_price ??
          item?.price ??
          0
      );

      const discount = Number(
        item?.discount_amount || 0
      );

      const totalPrice = Number(
        item?.total_price ??
          unitPrice * quantity
      );

      return {
        product_id: productId,
        variant_id: variantId,

        product_name:
          item?.product_name ||
          item?.name ||
          "Product",

        sku:
          item?.sku ||
          null,

        size:
          item?.size ||
          null,

        color:
          item?.color ||
          null,

        quantity,

        unit_price: unitPrice,

        discount_amount: discount,

        total_price: totalPrice,
      };
    });

    /*
    |--------------------------------------------------------------------------
    | 4. VALIDATE EACH ITEM
    |--------------------------------------------------------------------------
    */

    for (const item of normalizedItems) {
      if (!item.product_id) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A sale item is missing product_id.",
          },
          { status: 400 }
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Invalid quantity for ${item.product_name}.`,
          },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(item.unit_price) ||
        item.unit_price < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Invalid price for ${item.product_name}.`,
          },
          { status: 400 }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 5. CALCULATE TOTALS SERVER-SIDE
    |--------------------------------------------------------------------------
    */

    const calculatedSubtotal = normalizedItems.reduce(
      (sum, item) =>
        sum + item.unit_price * item.quantity,
      0
    );

    const safeDiscount = Number(discount_amount || 0);
    const safeTax = Number(tax_amount || 0);
    const safeShipping = Number(shipping_amount || 0);

    const calculatedGrandTotal =
      calculatedSubtotal -
      safeDiscount +
      safeTax +
      safeShipping;

    /*
    |--------------------------------------------------------------------------
    | 6. VERIFY STOCK
    |--------------------------------------------------------------------------
    |
    | For variants:
    |   product_variants.stock_quantity
    |
    | We DO NOT use an inventory table.
    |--------------------------------------------------------------------------
    */

    for (const item of normalizedItems) {
      /*
      |--------------------------------------------------------------------------
      | PRODUCT WITH VARIANT
      |--------------------------------------------------------------------------
      */

      if (item.variant_id) {
        const {
          data: variant,
          error: variantError,
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
          .eq("id", item.variant_id)
          .eq("product_id", item.product_id)
          .maybeSingle();

        if (variantError) {
          console.error(
            "VARIANT LOOKUP ERROR:",
            variantError
          );

          return NextResponse.json(
            {
              success: false,
              error:
                variantError.message ||
                "Unable to verify product variant.",
            },
            { status: 500 }
          );
        }

        if (!variant) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Product variant not found for ${item.product_name}.`,
            },
            { status: 400 }
          );
        }

        const currentStock = Number(
          variant.stock_quantity || 0
        );

        if (item.quantity > currentStock) {
          return NextResponse.json(
            {
              success: false,
              error:
                `${item.product_name}` +
                `${variant.size ? ` (${variant.size})` : ""}` +
                `${variant.color ? ` - ${variant.color}` : ""}` +
                ` has only ${currentStock} item(s) in stock.`,
            },
            { status: 400 }
          );
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 7. GENERATE INVOICE NUMBER
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    const random = Math.floor(
      1000 + Math.random() * 9000
    );

    const invoiceNumber =
      `ROC-OFF-${year}${month}${day}-${random}`;

    /*
    |--------------------------------------------------------------------------
    | 8. INSERT SALE
    |--------------------------------------------------------------------------
    |
    | NOTE:
    | offline_sales DOES NOT contain variant_id.
    |--------------------------------------------------------------------------
    */

    const salePayload = {
      invoice_number: invoiceNumber,

      customer_id:
        customer_id || null,

      customer_name:
        customer_name?.trim() ||
        "Walk-in Customer",

      customer_phone:
        customer_phone?.trim() ||
        null,

      customer_email:
        customer_email?.trim() ||
        email?.trim() ||
        null,

      email:
        email?.trim() ||
        customer_email?.trim() ||
        null,

      whatsapp_number:
        whatsapp_number?.trim() ||
        customer_phone?.trim() ||
        null,

      contact_type:
        contact_type || null,

      contact_value:
        contact_value ||
        email?.trim() ||
        customer_email?.trim() ||
        whatsapp_number?.trim() ||
        customer_phone?.trim() ||
        null,

      subtotal:
        calculatedSubtotal,

      discount_amount:
        safeDiscount,

      tax_amount:
        safeTax,

      total_amount:
        calculatedGrandTotal,

      shipping_amount:
        safeShipping,

      grand_total:
        calculatedGrandTotal,

      payment_method:
        payment_method || "CASH",

      payment_status:
        "PAID",

      sale_status:
        "COMPLETED",

      status:
        "COMPLETED",

      notes:
        notes || null,
    };

    const {
      data: sale,
      error: saleError,
    } = await supabase
      .from("offline_sales")
      .insert(salePayload)
      .select("*")
      .single();

    if (saleError) {
      console.error(
        "OFFLINE SALE INSERT ERROR:",
        saleError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            saleError.message ||
            "Failed to create offline sale.",

          code: saleError.code,

          details:
            saleError.details,

          hint:
            saleError.hint,
        },
        { status: 500 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 9. CREATE SALE ITEMS
    |--------------------------------------------------------------------------
    */

    const saleItems = normalizedItems.map(
      (item) => ({
        sale_id: sale.id,

        product_id:
          item.product_id,

        product_name:
          item.product_name,

        quantity:
          item.quantity,

        unit_price:
          item.unit_price,

        discount_amount:
          item.discount_amount,

        total_price:
          item.total_price,

        variant_id:
          item.variant_id,

        sku:
          item.sku,

        size:
          item.size,

        color:
          item.color,
      })
    );

    const {
      data: createdItems,
      error: itemsError,
    } = await supabase
      .from("offline_sale_items")
      .insert(saleItems)
      .select("*");

    /*
    |--------------------------------------------------------------------------
    | 10. ROLLBACK SALE IF ITEMS FAILED
    |--------------------------------------------------------------------------
    */

    if (itemsError) {
      console.error(
        "OFFLINE SALE ITEMS ERROR:",
        itemsError
      );

      await supabase
        .from("offline_sales")
        .delete()
        .eq("id", sale.id);

      return NextResponse.json(
        {
          success: false,
          error:
            itemsError.message ||
            "Failed to create sale items.",

          code:
            itemsError.code,

          details:
            itemsError.details,

          hint:
            itemsError.hint,
        },
        { status: 500 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 11. UPDATE VARIANT STOCK
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | We directly update product_variants.stock_quantity.
    |--------------------------------------------------------------------------
    */

    for (const item of normalizedItems) {
      if (!item.variant_id) {
        continue;
      }

      /*
      | Fetch current stock again.
      */

      const {
        data: variant,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select(`
          id,
          stock_quantity
        `)
        .eq("id", item.variant_id)
        .eq("product_id", item.product_id)
        .single();

      if (variantError || !variant) {
        console.error(
          "STOCK FETCH ERROR:",
          variantError
        );

        /*
        | Delete sale because inventory update failed.
        */

        await supabase
          .from("offline_sale_items")
          .delete()
          .eq("sale_id", sale.id);

        await supabase
          .from("offline_sales")
          .delete()
          .eq("id", sale.id);

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to update inventory.",
          },
          { status: 500 }
        );
      }

      const currentStock = Number(
        variant.stock_quantity || 0
      );

      const newStock =
        currentStock - item.quantity;

      if (newStock < 0) {
        await supabase
          .from("offline_sale_items")
          .delete()
          .eq("sale_id", sale.id);

        await supabase
          .from("offline_sales")
          .delete()
          .eq("id", sale.id);

        return NextResponse.json(
          {
            success: false,
            error:
              `${item.product_name} does not have enough stock.`,
          },
          { status: 400 }
        );
      }

      const {
        error: stockUpdateError,
      } = await supabase
        .from("product_variants")
        .update({
          stock_quantity: newStock,
        })
        .eq("id", item.variant_id)
        .eq("product_id", item.product_id);

      if (stockUpdateError) {
        console.error(
          "STOCK UPDATE ERROR:",
          stockUpdateError
        );

        await supabase
          .from("offline_sale_items")
          .delete()
          .eq("sale_id", sale.id);

        await supabase
          .from("offline_sales")
          .delete()
          .eq("id", sale.id);

        return NextResponse.json(
          {
            success: false,
            error:
              stockUpdateError.message ||
              "Failed to update stock.",
          },
          { status: 500 }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 12. SUCCESS
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Offline sale completed successfully.",

        sale: {
          ...sale,

          subtotal:
            Number(sale.subtotal || 0),

          discount_amount:
            Number(
              sale.discount_amount || 0
            ),

          tax_amount:
            Number(
              sale.tax_amount || 0
            ),

          shipping_amount:
            Number(
              sale.shipping_amount || 0
            ),

          total_amount:
            Number(
              sale.total_amount || 0
            ),

          grand_total:
            Number(
              sale.grand_total || 0
            ),
        },

        items:
          createdItems || [],

        invoice_number:
          invoiceNumber,

        customer: {
          name:
            sale.customer_name,

          phone:
            sale.customer_phone,

          email:
            sale.customer_email,

          whatsapp:
            sale.whatsapp_number,
        },

        contact: {
          type:
            sale.contact_type,

          value:
            sale.contact_value,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "OFFLINE SALE API UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unexpected error while creating offline sale.",
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
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Useful for testing that the route exists.
|--------------------------------------------------------------------------
*/

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message:
        "Offline sales API is working.",
      endpoint:
        "/api/admin/offline-sales",
      methods: ["GET", "POST"],
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}