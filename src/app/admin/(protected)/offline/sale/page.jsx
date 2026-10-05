"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  UserRound,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  X,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Store,
  QrCode,
  MessageCircle,
  Send,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const PRODUCTS_API = "/api/admin/offline-sales/products";
const SALE_API = "/api/admin/offline-sales";

const KRISHNA_UPI = "8512821709@indianba";

// Replace this with your real Radha UPI ID.
const RADHA_UPI = "radhasoemthing@";

const FREE_SHIPPING_LIMIT = 999;
const SHIPPING_CHARGE = 99;

/* =========================================================
   HELPERS
========================================================= */

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getProductId(product) {
  return (
    product?.product_id ||
    product?.id ||
    ""
  );
}

function getVariantId(product) {
  return (
    product?.variant_id ||
    product?.variantId ||
    null
  );
}

function getProductName(product) {
  return (
    product?.product_name ||
    product?.name ||
    product?.productName ||
    "Unnamed Product"
  );
}

function getProductPrice(product) {
  return Number(
    product?.price ??
      product?.base_price ??
      product?.selling_price ??
      product?.sale_price ??
      0
  );
}

function getProductComparePrice(product) {
  return Number(
    product?.compare_price ??
      product?.mrp ??
      product?.original_price ??
      0
  );
}

function getProductStock(product) {
  const value =
    product?.stock_quantity ??
    product?.stock ??
    product?.quantity ??
    product?.inventory_quantity ??
    product?.available_stock ??
    0;

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getProductImage(product) {
  return (
    product?.image_url ||
    product?.image ||
    product?.thumbnail ||
    product?.product_image ||
    product?.product_images?.[0]?.image_url ||
    product?.product_images?.[0]?.url ||
    ""
  );
}

function getProductSku(product) {
  return (
    product?.sku ||
    product?.product_sku ||
    product?.variant_sku ||
    ""
  );
}

function getProductCategory(product) {
  return (
    product?.category ||
    product?.category_name ||
    product?.categories?.name ||
    ""
  );
}

function getProductSize(product) {
  return product?.size || "";
}

function getProductColor(product) {
  return product?.color || "";
}

function normalizeProducts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product, onAdd }) {
  const stock = getProductStock(product);
  const price = getProductPrice(product);
  const image = getProductImage(product);
  const name = getProductName(product);
  const sku = getProductSku(product);

  const size = getProductSize(product);
  const color = getProductColor(product);

  const outOfStock = stock <= 0;

  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.09)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f3f0]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package
              size={42}
              className="text-black/15"
            />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
          Stock: {stock}
        </div>

        {size && (
          <div className="absolute right-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            {size}
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/35">
          {getProductCategory(product) || "Product"}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black">
          {name}
        </h3>

        {(size || color) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {size && (
              <span className="rounded-lg bg-black/[0.04] px-2 py-1 text-[10px] font-bold">
                Size: {size}
              </span>
            )}

            {color && (
              <span className="rounded-lg bg-black/[0.04] px-2 py-1 text-[10px] font-bold">
                {color}
              </span>
            )}
          </div>
        )}

        {sku && (
          <p className="mt-2 text-[10px] text-black/35">
            SKU: {sku}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black">
              {money(price)}
            </p>

            {getProductComparePrice(product) > price && (
              <p className="text-xs text-black/35 line-through">
                {money(
                  getProductComparePrice(product)
                )}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => onAdd(product)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/30 disabled:shadow-none"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CART ITEM
========================================================= */

function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const stock = getProductStock(item.product);
  const price = item.price;

  return (
    <div className="rounded-2xl border border-black/5 bg-black/[0.025] p-3">
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
          {getProductImage(item.product) ? (
            <img
              src={getProductImage(item.product)}
              alt={getProductName(item.product)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package
                size={22}
                className="text-black/15"
              />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="line-clamp-2 text-sm font-bold">
                {getProductName(item.product)}
              </p>

              <div className="mt-1 flex flex-wrap gap-1.5">
                {getProductSize(item.product) && (
                  <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-bold">
                    Size:{" "}
                    {getProductSize(item.product)}
                  </span>
                )}

                {getProductColor(item.product) && (
                  <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-bold">
                    {getProductColor(item.product)}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-black/40">
                {money(price)} each
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-lg p-1.5 text-black/30 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center rounded-xl border border-black/10 bg-white">
              <button
                type="button"
                onClick={() =>
                  onDecrease(item.id)
                }
                className="p-2 transition hover:bg-black/5"
              >
                <Minus size={13} />
              </button>

              <span className="min-w-[35px] text-center text-xs font-black">
                {item.quantity}
              </span>

              <button
                type="button"
                disabled={
                  item.quantity >= stock
                }
                onClick={() =>
                  onIncrease(item.id)
                }
                className="p-2 transition hover:bg-black/5 disabled:opacity-20"
              >
                <Plus size={13} />
              </button>
            </div>

            <p className="text-sm font-black">
              {money(price * item.quantity)}
            </p>
          </div>

          <p className="mt-2 text-[10px] text-black/35">
            Available stock: {stock}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT QR
========================================================= */

function PaymentQR({
  upiId,
  name,
  amount,
}) {
  const valid =
    typeof upiId === "string" &&
    upiId.includes("@") &&
    !upiId.endsWith("@");

  if (!valid) {
    return (
      <div className="flex h-[210px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10">
        <QrCode
          size={35}
          className="text-black/20"
        />

        <p className="mt-3 text-xs font-bold text-black/40">
          UPI ID not configured
        </p>
      </div>
    );
  }

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(name)}` +
    `&am=${Number(amount || 0).toFixed(2)}` +
    `&cu=INR`;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <div className="mb-3 text-center">
        <p className="text-sm font-black">
          {name} QR
        </p>

        <p className="mt-1 text-[10px] text-black/40">
          {upiId}
        </p>
      </div>

      <div className="flex justify-center">
        <QRCodeSVG
          value={upiUrl}
          size={190}
          level="M"
          includeMargin
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      <p className="mt-3 text-center text-lg font-black">
        {money(amount)}
      </p>
    </div>
  );
}

/* =========================================================
   SUCCESS CONTACT MODAL
========================================================= */

function ContactInvoiceActions({
  saleComplete,
  customerPhone,
  customerEmail,
}) {
  const sale =
    saleComplete?.sale || {};

  const invoiceNumber =
    sale?.invoice_number ||
    saleComplete?.invoice_number ||
    "";

  const saleId =
    sale?.id ||
    saleComplete?.sale_id ||
    saleComplete?.id ||
    "";

  const total =
    sale?.grand_total ??
    saleComplete?.grand_total ??
    0;

  const phone =
    sale?.whatsapp_number ||
    sale?.customer_phone ||
    customerPhone ||
    "";

  const email =
    sale?.customer_email ||
    sale?.email ||
    customerEmail ||
    "";

  const invoiceText =
    `Radha Outfit Collection\n\n` +
    `Invoice: ${invoiceNumber}\n` +
    `Sale ID: ${saleId}\n` +
    `Amount: ${money(total)}\n\n` +
    `Thank you for shopping with us.`;

  const whatsappNumber =
    String(phone)
      .replace(/\D/g, "")
      .replace(/^0/, "91");

  const whatsappUrl =
    whatsappNumber.length >= 10
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          invoiceText
        )}`
      : "";

  const emailUrl =
    email
      ? `mailto:${email}?subject=${encodeURIComponent(
          `Invoice ${invoiceNumber} - Radha Outfit Collection`
        )}&body=${encodeURIComponent(
          invoiceText
        )}`
      : "";

  return (
    <div className="mt-5">
      <p className="mb-3 text-center text-xs font-bold text-black/40">
        SEND INVOICE
      </p>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={whatsappUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (!whatsappUrl) {
              event.preventDefault();

              toast.error(
                "Customer WhatsApp number is not available."
              );
            }
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold ${
            whatsappUrl
              ? "bg-[#25D366] text-white"
              : "cursor-not-allowed bg-black/5 text-black/25"
          }`}
        >
          <MessageCircle size={15} />
          WhatsApp
        </a>

        <a
          href={emailUrl || undefined}
          onClick={(event) => {
            if (!emailUrl) {
              event.preventDefault();

              toast.error(
                "Customer email is not available."
              );
            }
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold ${
            emailUrl
              ? "bg-black text-white"
              : "cursor-not-allowed bg-black/5 text-black/25"
          }`}
        >
          <Mail size={15} />
          Email
        </a>
      </div>

      {!phone && !email && (
        <p className="mt-3 text-center text-[10px] text-black/35">
          No WhatsApp number or email was provided.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function OfflineSalePage() {
  const [products, setProducts] =
    useState([]);

  const [cart, setCart] =
    useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [productError, setProductError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("ALL");

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [processingSale, setProcessingSale] =
    useState(false);

  const [showQR, setShowQR] =
    useState(false);

  const [saleComplete, setSaleComplete] =
    useState(null);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingProducts(true);
        }

        setProductError("");

        const response = await fetch(
          PRODUCTS_API,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        const rawText =
          await response.text();

        if (
          !contentType
            .toLowerCase()
            .includes(
              "application/json"
            )
        ) {
          console.error(
            "Products API returned HTML:",
            rawText.slice(0, 1000)
          );

          throw new Error(
            `Products API returned HTML/non-JSON (${response.status}). Check ${PRODUCTS_API}`
          );
        }

        let data;

        try {
          data =
            JSON.parse(rawText);
        } catch {
          throw new Error(
            "Products API returned invalid JSON."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              `Products API failed (${response.status}).`
          );
        }

        const rows =
          normalizeProducts(data);

        const normalized =
          rows
            .map((product) => {
              const productId =
                getProductId(product);

              const variantId =
                getVariantId(product);

              return {
                ...product,

                id: productId,

                product_id:
                  productId,

                variant_id:
                  variantId,

                name:
                  getProductName(
                    product
                  ),

                product_name:
                  getProductName(
                    product
                  ),

                price:
                  getProductPrice(
                    product
                  ),

                base_price:
                  getProductPrice(
                    product
                  ),

                stock_quantity:
                  getProductStock(
                    product
                  ),

                image_url:
                  getProductImage(
                    product
                  ),

                sku:
                  getProductSku(
                    product
                  ),

                size:
                  getProductSize(
                    product
                  ),

                color:
                  getProductColor(
                    product
                  ),
              };
            })
            .filter(
              (product) =>
                product.product_id
            );

        setProducts(normalized);

        console.log(
          "Offline POS products:",
          normalized
        );
      } catch (error) {
        console.error(
          "loadProducts error:",
          error
        );

        setProducts([]);

        setProductError(
          error?.message ||
            "Unable to load products."
        );
      } finally {
        setLoadingProducts(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const values = products
      .map((product) =>
        getProductCategory(product)
      )
      .filter(Boolean);

    return [
      "ALL",
      ...new Set(values),
    ];
  }, [products]);

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const name =
            getProductName(
              product
            ).toLowerCase();

          const sku =
            getProductSku(
              product
            ).toLowerCase();

          const productCategory =
            getProductCategory(
              product
            ).toLowerCase();

          const size =
            getProductSize(
              product
            ).toLowerCase();

          const color =
            getProductColor(
              product
            ).toLowerCase();

          const searchMatch =
            !query ||
            name.includes(query) ||
            sku.includes(query) ||
            size.includes(query) ||
            color.includes(query) ||
            productCategory.includes(
              query
            );

          const categoryMatch =
            category === "ALL" ||
            productCategory ===
              category.toLowerCase();

          return (
            searchMatch &&
            categoryMatch
          );
        }
      );
    }, [
      products,
      search,
      category,
    ]);

  /* =======================================================
     TOTALS
  ======================================================= */

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          item.price *
            item.quantity,
        0
      ),
    [cart]
  );

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >=
          FREE_SHIPPING_LIMIT
        ? 0
        : SHIPPING_CHARGE;

  const grandTotal =
    subtotal + shipping;

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart(product) {
    const productId =
      getProductId(product);

    const variantId =
      getVariantId(product);

    const stock =
      getProductStock(product);

    if (!productId) {
      toast.error(
        "Product ID is missing."
      );
      return;
    }

    if (stock <= 0) {
      toast.error(
        "This product is out of stock."
      );
      return;
    }

    /*
     * VERY IMPORTANT:
     *
     * Variant products need:
     *
     * product_id + variant_id
     *
     * Otherwise different sizes/colors
     * become the same cart item.
     */

    const cartId = variantId
      ? `${productId}:${variantId}`
      : productId;

    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === cartId
        );

      if (existing) {
        if (
          existing.quantity >=
          stock
        ) {
          toast.error(
            `Only ${stock} item(s) available in stock.`
          );

          return current;
        }

        return current.map(
          (item) =>
            item.id === cartId
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    1,
                }
              : item
        );
      }

      return [
        ...current,
        {
          id: cartId,

          product,

          product_id:
            productId,

          variant_id:
            variantId,

          sku:
            getProductSku(
              product
            ) || null,

          size:
            getProductSize(
              product
            ) || null,

          color:
            getProductColor(
              product
            ) || null,

          price:
            getProductPrice(
              product
            ),

          quantity: 1,
        },
      ];
    });

    toast.success(
      variantId
        ? `Added ${getProductName(
            product
          )}${getProductSize(product)
            ? ` — ${getProductSize(
                product
              )}`
            : ""}`
        : "Product added to sale."
    );
  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function increaseQuantity(id) {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const stock =
          getProductStock(
            item.product
          );

        if (
          item.quantity >= stock
        ) {
          toast.error(
            `Only ${stock} item(s) available.`
          );

          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  }

  function decreaseQuantity(id) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantity:
              item.quantity - 1,
          };
        })
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  /* =======================================================
     COMPLETE SALE
  ======================================================= */

  async function completeSale() {
    if (cart.length === 0) {
      toast.error(
        "Add at least one product."
      );
      return;
    }

    /*
     * Validate cart before API.
     */

    for (const item of cart) {
      const productId =
        item.product_id ||
        item.product?.product_id;

      const variantId =
        item.variant_id ||
        item.product?.variant_id ||
        null;

      const stock =
        getProductStock(
          item.product
        );

      if (!productId) {
        toast.error(
          `Product ID missing for ${getProductName(
            item.product
          )}`
        );
        return;
      }

      /*
       * If the product API says it has
       * variants, variant_id is required.
       */

      if (
        item.product?.has_variants &&
        !variantId
      ) {
        toast.error(
          `Variant ID missing for ${getProductName(
            item.product
          )}`
        );
        return;
      }

      if (
        item.quantity > stock
      ) {
        toast.error(
          `${getProductName(
            item.product
          )} has only ${stock} in stock.`
        );
        return;
      }
    }

    try {
      setProcessingSale(true);

      const payload = {
        customer_name:
          customerName.trim() ||
          "Walk-in Customer",

        customer_phone:
          customerPhone.trim() ||
          null,

        customer_email:
          customerEmail.trim() ||
          null,

        whatsapp_number:
          customerPhone.trim() ||
          null,

        contact_type:
          customerEmail.trim()
            ? "EMAIL"
            : customerPhone.trim()
            ? "WHATSAPP"
            : null,

        contact_value:
          customerEmail.trim() ||
          customerPhone.trim() ||
          null,

        payment_method:
          paymentMethod,

        subtotal:
          Number(subtotal),

        discount_amount: 0,

        tax_amount: 0,

        shipping_amount:
          Number(shipping),

        grand_total:
          Number(grandTotal),

        items: cart.map(
          (item) => ({
            /*
             * DO NOT use item.id here.
             *
             * item.id is the POS cart ID:
             * productId:variantId
             */

            product_id:
              item.product_id ||
              item.product?.product_id,

            variant_id:
              item.variant_id ||
              item.product
                ?.variant_id ||
              null,

            sku:
              item.sku ||
              item.product?.sku ||
              null,

            size:
              item.size ||
              item.product?.size ||
              null,

            color:
              item.color ||
              item.product?.color ||
              null,

            quantity:
              Number(
                item.quantity
              ),

            unit_price:
              Number(
                item.price
              ),

            total_price:
              Number(
                item.price *
                  item.quantity
              ),
          })
        ),
      };

      console.log(
        "OFFLINE SALE PAYLOAD:",
        payload
      );

      const response =
        await fetch(
          SALE_API,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const rawText =
        await response.text();

      if (
        !contentType
          .toLowerCase()
          .includes(
            "application/json"
          )
      ) {
        console.error(
          "Sale API returned HTML:",
          rawText.slice(0, 1500)
        );

        throw new Error(
          `Sale API returned HTML/non-JSON (${response.status}). ` +
            `Make sure this file exists: ${SALE_API}/route.js`
        );
      }

      let data;

      try {
        data =
          JSON.parse(rawText);
      } catch {
        throw new Error(
          "Sale API returned invalid JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Sale failed (${response.status}).`
        );
      }

      /*
       * SUCCESS
       */

      setSaleComplete(
        data
      );

      toast.success(
        "Sale completed successfully."
      );

      setCart([]);

      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");

      /*
       * Reload inventory.
       */

      await loadProducts(
        true
      );
    } catch (error) {
      console.error(
        "completeSale error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to complete sale."
      );
    } finally {
      setProcessingSale(false);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 text-black sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-black/[0.035] blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-black/[0.03] blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <header className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/50 backdrop-blur-xl">
                <Store size={13} />

                Radha Outfit Collection
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                New Sale
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                Create an offline POS sale,
                select products, manage
                inventory and collect
                payment.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadProducts(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Products
            </button>
          </div>
        </header>

        {/* ERROR */}

        {productError && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <AlertCircle
                size={20}
                className="shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-black text-red-700">
                  Products could not be loaded
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {productError}
                </p>

                <p className="mt-3 rounded-xl bg-red-100 p-3 font-mono text-[10px] text-red-700">
                  {PRODUCTS_API}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadProducts()
                  }
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">

          {/* PRODUCTS */}

          <section className="min-w-0 rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">

            <div className="mb-5 flex flex-col gap-4">

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Products
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    {filteredProducts.length}{" "}
                    products available
                  </p>
                </div>

                <div className="rounded-full bg-black/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black/40">
                  Live Inventory
                </div>
              </div>

              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search product, SKU, size or color..."
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-4 focus:ring-black/5"
                />
              </div>

              {/* CATEGORIES */}

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setCategory(
                          item
                        )
                      }
                      className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${
                        category ===
                        item
                          ? "bg-black text-white"
                          : "border border-black/10 bg-white text-black/55 hover:bg-black/5"
                      }`}
                    >
                      {item ===
                      "ALL"
                        ? "All"
                        : item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* PRODUCT GRID */}

            {loadingProducts ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={34}
                    className="mx-auto animate-spin text-black/30"
                  />

                  <p className="mt-4 text-xs font-semibold text-black/40">
                    Loading products...
                  </p>
                </div>
              </div>
            ) : filteredProducts.length ===
              0 ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-black/[0.04] p-5">
                  <Package
                    size={34}
                    className="text-black/25"
                  />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  No products found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-black/40">
                  Check your product
                  API, search term,
                  category or
                  inventory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={
                        getVariantId(
                          product
                        )
                          ? `${getProductId(
                              product
                            )}:${getVariantId(
                              product
                            )}`
                          : getProductId(
                              product
                            )
                      }
                      product={
                        product
                      }
                      onAdd={
                        addToCart
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* CART */}

          <aside className="h-fit xl:sticky xl:top-5">
            <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/85 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">

              <div className="border-b border-black/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
                      POS
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Current Sale
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-black p-3 text-white">
                    <ShoppingCart
                      size={19}
                    />
                  </div>
                </div>

                <div className="mt-3 inline-flex rounded-full bg-black/[0.04] px-3 py-1.5 text-[10px] font-bold text-black/50">
                  {cart.length}{" "}
                  product
                  {cart.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  in cart
                </div>
              </div>

              {/* CART ITEMS */}

              <div className="max-h-[420px] space-y-3 overflow-y-auto p-5">
                {cart.length ===
                0 ? (
                  <div className="py-14 text-center">
                    <ShoppingCart
                      size={35}
                      className="mx-auto text-black/15"
                    />

                    <p className="mt-4 text-sm font-bold">
                      Cart is empty
                    </p>

                    <p className="mt-1 text-xs text-black/35">
                      Click Add on a
                      product to start
                      a sale.
                    </p>
                  </div>
                ) : (
                  cart.map(
                    (item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onIncrease={
                          increaseQuantity
                        }
                        onDecrease={
                          decreaseQuantity
                        }
                        onRemove={
                          removeFromCart
                        }
                      />
                    )
                  )
                )}
              </div>

              {/* CUSTOMER */}

              <div className="border-t border-black/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <UserRound size={16} />

                  <h3 className="text-sm font-black">
                    Customer
                  </h3>
                </div>

                <div className="space-y-3">

                  <input
                    value={
                      customerName
                    }
                    onChange={(e) =>
                      setCustomerName(
                        e.target
                          .value
                      )
                    }
                    placeholder="Customer name"
                    className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30 focus:ring-4 focus:ring-black/5"
                  />

                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                    />

                    <input
                      value={
                        customerPhone
                      }
                      onChange={(
                        e
                      ) =>
                        setCustomerPhone(
                          e.target
                            .value
                        )
                      }
                      placeholder="WhatsApp / phone number"
                      inputMode="tel"
                      className="h-11 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-black/30 focus:ring-4 focus:ring-black/5"
                    />
                  </div>

                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                    />

                    <input
                      value={
                        customerEmail
                      }
                      onChange={(
                        e
                      ) =>
                        setCustomerEmail(
                          e.target
                            .value
                        )
                      }
                      placeholder="Customer email (optional)"
                      type="email"
                      className="h-11 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-black/30 focus:ring-4 focus:ring-black/5"
                    />
                  </div>

                  <p className="text-[10px] leading-4 text-black/35">
                    After payment you can
                    send the invoice to the
                    customer's WhatsApp or
                    email.
                  </p>
                </div>
              </div>

              {/* PAYMENT */}

              <div className="border-t border-black/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard
                    size={16}
                  />

                  <h3 className="text-sm font-black">
                    Payment
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        "CASH"
                      )
                    }
                    className={`rounded-xl border p-3 text-center transition ${
                      paymentMethod ===
                      "CASH"
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    <Banknote
                      size={17}
                      className="mx-auto"
                    />

                    <span className="mt-1 block text-[10px] font-bold">
                      Cash
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        "UPI"
                      )
                    }
                    className={`rounded-xl border p-3 text-center transition ${
                      paymentMethod ===
                      "UPI"
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    <Smartphone
                      size={17}
                      className="mx-auto"
                    />

                    <span className="mt-1 block text-[10px] font-bold">
                      UPI
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        "CARD"
                      )
                    }
                    className={`rounded-xl border p-3 text-center transition ${
                      paymentMethod ===
                      "CARD"
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    <CreditCard
                      size={17}
                      className="mx-auto"
                    />

                    <span className="mt-1 block text-[10px] font-bold">
                      Card
                    </span>
                  </button>
                </div>

                {paymentMethod ===
                  "UPI" && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowQR(
                        true
                      )
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-bold transition hover:bg-black hover:text-white"
                  >
                    <QrCode
                      size={15}
                    />
                    Show UPI QR
                  </button>
                )}
              </div>

              {/* TOTAL */}

              <div className="border-t border-black/5 bg-black/[0.018] p-5">
                <div className="space-y-2 text-sm">

                  <div className="flex justify-between text-black/50">
                    <span>
                      Subtotal
                    </span>

                    <span className="font-semibold text-black">
                      {money(
                        subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-black/50">
                    <span>
                      Shipping
                    </span>

                    <span className="font-semibold text-black">
                      {shipping ===
                      0
                        ? "FREE"
                        : money(
                            shipping
                          )}
                    </span>
                  </div>

                  <div className="my-3 border-t border-black/10" />

                  <div className="flex items-end justify-between">
                    <span className="text-sm font-bold">
                      Grand Total
                    </span>

                    <span className="text-2xl font-black">
                      {money(
                        grandTotal
                      )}
                    </span>
                  </div>
                </div>

                {subtotal >
                  0 &&
                  subtotal <
                    FREE_SHIPPING_LIMIT && (
                    <p className="mt-3 rounded-xl bg-black/[0.04] p-3 text-[10px] leading-4 text-black/45">
                      Add{" "}
                      <strong className="text-black">
                        {money(
                          FREE_SHIPPING_LIMIT -
                            subtotal
                        )}
                      </strong>{" "}
                      more for free
                      shipping.
                    </p>
                  )}

                <button
                  type="button"
                  disabled={
                    processingSale ||
                    cart.length ===
                      0
                  }
                  onClick={
                    completeSale
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/30 disabled:shadow-none"
                >
                  {processingSale ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Completing
                      Sale...
                    </>
                  ) : (
                    <>
                      <Receipt
                        size={17}
                      />

                      Complete
                      Sale
                    </>
                  )}
                </button>

                {cart.length >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      clearCart
                    }
                    className="mt-2 w-full rounded-xl px-4 py-2.5 text-xs font-bold text-black/40 transition hover:bg-red-50 hover:text-red-600"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* =====================================================
          QR MODAL
      ===================================================== */}

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[#f7f7f5] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-[#f7f7f5]/90 p-5 backdrop-blur-xl">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
                  UPI PAYMENT
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Scan & Pay
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowQR(false)
                }
                className="rounded-xl border border-black/10 bg-white p-2.5 transition hover:bg-black hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">

              <PaymentQR
                upiId={
                  KRISHNA_UPI
                }
                name="Krishna"
                amount={
                  grandTotal
                }
              />

              <PaymentQR
                upiId={
                  RADHA_UPI
                }
                name="Radha"
                amount={
                  grandTotal
                }
              />

            </div>

            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-black/5 bg-white p-4 text-center">

                <p className="text-xs text-black/45">
                  Amount
                </p>

                <p className="mt-1 text-2xl font-black">
                  {money(
                    grandTotal
                  )}
                </p>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SALE SUCCESS
      ===================================================== */}

      {saleComplete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">

          <div className="w-full max-w-md rounded-[2rem] bg-[#f7f7f5] p-6 shadow-2xl">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                <CheckCircle2
                  size={30}
                />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Sale Completed
              </h2>

              <p className="mt-2 text-sm text-black/45">
                The offline sale was
                successfully created.
              </p>

              <div className="mt-5 rounded-2xl bg-white p-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
                  Invoice Number
                </p>

                <p className="mt-1 break-all font-mono text-sm font-bold">
                  {saleComplete
                    ?.sale
                    ?.invoice_number ||
                    saleComplete?.invoice_number ||
                    "Created"}
                </p>

                <div className="mt-4 border-t border-black/5 pt-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
                    Amount
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {money(
                      saleComplete
                        ?.sale
                        ?.grand_total ??
                        saleComplete?.grand_total ??
                        grandTotal
                    )}
                  </p>

                </div>
              </div>

              {/* SEND INVOICE */}

              <ContactInvoiceActions
                saleComplete={
                  saleComplete
                }
                customerPhone={
                  customerPhone
                }
                customerEmail={
                  customerEmail
                }
              />

              <button
                type="button"
                onClick={() =>
                  setSaleComplete(
                    null
                  )
                }
                className="mt-5 w-full rounded-2xl bg-black px-5 py-3.5 text-sm font-bold text-white"
              >
                Done
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}