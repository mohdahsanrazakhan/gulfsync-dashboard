import type { Types } from "mongoose";
import type { Rand } from "@/seed/rng";
import { randomInt, randomFloat, pickOne, weightedPickFromMap } from "@/seed/rng";
import cities from "@/seed/data/cities.json";
import customers from "@/seed/data/customers.json";
import type { Channel, Country, DeliveryPartner, OrderStatus, PaymentMethod, ReturnReason } from "@/types";

export interface ProductRef {
  _id: Types.ObjectId;
  sku: string;
  nameEn: string;
  sellingPrice: number;
}

export interface GeneratedOrder {
  orderId: string;
  channel: Channel;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: Country;
    address: string;
  };
  items: {
    productId: Types.ObjectId;
    sku: string;
    nameEn: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  payment: {
    method: PaymentMethod;
    status: "pending" | "paid" | "failed" | "refunded";
    currency: "SAR" | "AED";
    subtotal: number;
    shippingCost: number;
    vatAmount: number;
    discount: number;
    totalAmount: number;
    codAmount: number | null;
  };
  shipping: {
    partner: DeliveryPartner;
    trackingNumber: string;
    estimatedDelivery: Date;
    actualDelivery: Date | null;
    deliveryAttempts: number;
    status:
      | "pending_pickup"
      | "picked_up"
      | "in_transit"
      | "out_for_delivery"
      | "delivered"
      | "failed_delivery"
      | "returned_to_sender";
  };
  return: {
    isReturned: boolean;
    returnReason: ReturnReason | null;
    returnDate: Date | null;
    refundAmount: number | null;
    refundStatus: "pending" | "processed" | "completed" | null;
  };
  notes: string;
  createdAt: Date;
}

const CHANNEL_WEIGHTS: Record<Channel, number> = { noon: 0.45, amazon: 0.3, shopify: 0.25 };

const STATUS_WEIGHTS: Record<OrderStatus, number> = {
  delivered: 0.6,
  shipped: 0.12,
  processing: 0.08,
  confirmed: 0.05,
  pending: 0.05,
  returned: 0.07,
  cancelled: 0.03,
};

const PAYMENT_WEIGHTS_DEFAULT: Record<PaymentMethod, number> = {
  cod: 0.4,
  credit_card: 0.15,
  debit_card: 0.1,
  mada: 0,
  apple_pay: 0.08,
  tabby: 0.07,
  tamara: 0.05,
};

// Mada is KSA-only; redistribute its 15% weight there and drop it for UAE orders.
const PAYMENT_WEIGHTS_KSA: Record<PaymentMethod, number> = {
  ...PAYMENT_WEIGHTS_DEFAULT,
  mada: 0.15,
};
const PAYMENT_WEIGHTS_UAE: Record<PaymentMethod, number> = {
  cod: 0.47,
  credit_card: 0.18,
  debit_card: 0.1,
  mada: 0,
  apple_pay: 0.1,
  tabby: 0.08,
  tamara: 0.07,
};

const PARTNER_WEIGHTS: Record<DeliveryPartner, number> = {
  aramex: 0.35,
  smsa: 0.25,
  fetchr: 0.2,
  jt_express: 0.12,
  dhl: 0.08,
};

const RETURN_REASON_WEIGHTS: Record<ReturnReason, number> = {
  cod_rejected: 0.35,
  changed_mind: 0.25,
  wrong_size: 0.15,
  damaged: 0.1,
  not_as_described: 0.1,
  not_needed: 0.05,
};

function buildMonthlyOrderCounts(totalOrders: number, months: number): number[] {
  const raw: number[] = [];
  for (let i = 0; i < months; i++) {
    raw.push(250 + (i * (600 - 250)) / (months - 1));
  }
  const rawSum = raw.reduce((s, v) => s + v, 0);
  const scaled = raw.map((v) => Math.round((v / rawSum) * totalOrders));
  const diff = totalOrders - scaled.reduce((s, v) => s + v, 0);
  scaled[scaled.length - 1] += diff;
  return scaled;
}

function randomNameAndCity(rand: Rand) {
  const bucket = rand();
  let pool: { first: string[]; last: string[] };
  if (bucket < 0.6) pool = customers.arabic;
  else if (bucket < 0.9) pool = customers.southAsian;
  else pool = customers.western;

  const first = pickOne(rand, pool.first);
  const last = pickOne(rand, pool.last);
  const city = weightedPickFromMap(
    rand,
    Object.fromEntries(cities.map((c) => [c.name, c.weight])) as Record<string, number>
  );
  const cityInfo = cities.find((c) => c.name === city)!;
  return { name: `${first} ${last}`, city: cityInfo.name, country: cityInfo.country as Country };
}

function randomPhone(rand: Rand, country: Country): string {
  const cc = country === "UAE" ? "+971" : "+966";
  const prefix = country === "UAE" ? pickOne(rand, ["50", "52", "54", "55", "56"]) : pickOne(rand, ["50", "53", "54", "55", "58"]);
  const rest = String(randomInt(rand, 1000000, 9999999));
  return `${cc}${prefix}${rest}`;
}

function randomTrackingNumber(rand: Rand, partner: DeliveryPartner): string {
  const prefixes: Record<DeliveryPartner, string> = {
    aramex: "ARX",
    smsa: "SMS",
    fetchr: "FCH",
    jt_express: "JNT",
    dhl: "DHL",
  };
  return `${prefixes[partner]}${randomInt(rand, 100000000, 999999999)}`;
}

function randomOrderDateInMonth(rand: Rand, monthStart: Date, maxDay?: number): Date {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = Math.min(new Date(year, month + 1, 0).getDate(), maxDay ?? Infinity);

  let day: number;
  // Weekday orders run ~15% higher than weekend (Fri-Sat) — resample if we
  // land on a weekend and the resample roll doesn't favor keeping it.
  do {
    day = randomInt(rand, 1, daysInMonth);
    const dow = new Date(year, month, day).getDay(); // 5 = Fri, 6 = Sat
    const isWeekend = dow === 5 || dow === 6;
    if (!isWeekend || rand() < 0.46) break;
  } while (true);

  // Peak shopping hours: 60% of orders between 6 PM - 12 AM.
  let hour: number;
  if (rand() < 0.6) {
    hour = randomInt(rand, 18, 23);
  } else {
    hour = randomInt(rand, 0, 17);
  }
  const minute = randomInt(rand, 0, 59);
  const second = randomInt(rand, 0, 59);
  return new Date(year, month, day, hour, minute, second);
}

export function generateOrders(rand: Rand, products: ProductRef[], totalOrders = 5000, months = 12): GeneratedOrder[] {
  const orders: GeneratedOrder[] = [];
  const now = new Date();
  const monthCounts = buildMonthlyOrderCounts(totalOrders, months);

  let noonSeq = 10000;
  let amazonSeq = 1000000;
  let shopifySeq = 10000;

  for (let m = 0; m < months; m++) {
    // months ago -> present; m=0 is 11 months ago, m=months-1 is current month
    const monthsAgo = months - 1 - m;
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    // The current month is still in progress, so only spread orders across the
    // days that have actually elapsed — otherwise every order that would land
    // "in the future" collapses onto today, producing an unrealistic spike.
    const isCurrentMonth = monthsAgo === 0;
    const maxDay = isCurrentMonth ? now.getDate() : undefined;
    // Scale the partial current month's order count down to the fraction of
    // the month that has actually elapsed, so the daily average stays in line
    // with prior full months instead of jumping (the same order volume the
    // ramp intended for ~30 days would otherwise land in ~12 days).
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const count = isCurrentMonth ? Math.round((monthCounts[m] * maxDay!) / daysInMonth) : monthCounts[m];

    for (let i = 0; i < count; i++) {
      const createdAt = randomOrderDateInMonth(rand, monthStart, maxDay);
      if (createdAt > now) createdAt.setTime(now.getTime() - randomInt(rand, 0, 3600) * 1000);

      const channel = weightedPickFromMap(rand, CHANNEL_WEIGHTS);
      const { name, city, country } = randomNameAndCity(rand);
      const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
      const phone = randomPhone(rand, country);
      const address = `Building ${randomInt(rand, 1, 200)}, Street ${randomInt(rand, 1, 60)}, ${city}, ${country}`;

      let orderId: string;
      if (channel === "noon") {
        orderId = `N-${monthStart.getFullYear()}-${String(noonSeq++).padStart(5, "0")}`;
      } else if (channel === "amazon") {
        orderId = `AZ-${randomInt(rand, 100, 999)}-${String(amazonSeq++).padStart(7, "0")}`;
      } else {
        orderId = `SH-${String(shopifySeq++).padStart(5, "0")}`;
      }

      const itemCount = randomInt(rand, 1, 3);
      const chosenProducts = Array.from({ length: itemCount }, () => pickOne(rand, products));
      const items = chosenProducts.map((p) => {
        const quantity = randomInt(rand, 1, 3);
        const unitPrice = p.sellingPrice;
        return {
          productId: p._id,
          sku: p.sku,
          nameEn: p.nameEn,
          quantity,
          unitPrice,
          totalPrice: Math.round(unitPrice * quantity * 100) / 100,
        };
      });
      const subtotal = Math.round(items.reduce((s, it) => s + it.totalPrice, 0) * 100) / 100;

      const paymentWeights = country === "KSA" ? PAYMENT_WEIGHTS_KSA : PAYMENT_WEIGHTS_UAE;
      const method = weightedPickFromMap(rand, paymentWeights);

      const status = weightedPickFromMap(rand, STATUS_WEIGHTS);

      const shippingCost = randomFloat(rand, 10, 35);
      const vatRate = country === "UAE" ? 0.05 : 0.15;
      const vatAmount = Math.round((subtotal + shippingCost) * vatRate * 100) / 100;
      const discount = rand() < 0.15 ? Math.round(subtotal * randomFloat(rand, 0.02, 0.1) * 100) / 100 : 0;
      const totalAmount = Math.round((subtotal + shippingCost + vatAmount - discount) * 100) / 100;
      const currency: "SAR" | "AED" = country === "UAE" ? "AED" : "SAR";

      const paymentStatus =
        status === "cancelled"
          ? "failed"
          : status === "returned"
            ? "refunded"
            : method === "cod" && ["pending", "confirmed", "processing"].includes(status)
              ? "pending"
              : "paid";

      const partner = weightedPickFromMap(rand, PARTNER_WEIGHTS);
      const estimatedDelivery = new Date(createdAt.getTime() + randomInt(rand, 2, 6) * 24 * 60 * 60 * 1000);

      let shippingStatus: GeneratedOrder["shipping"]["status"];
      let actualDelivery: Date | null = null;
      let deliveryAttempts = 0;

      switch (status) {
        case "pending":
          shippingStatus = "pending_pickup";
          break;
        case "confirmed":
          shippingStatus = "pending_pickup";
          break;
        case "processing":
          shippingStatus = "picked_up";
          deliveryAttempts = 0;
          break;
        case "shipped":
          shippingStatus = rand() < 0.5 ? "in_transit" : "out_for_delivery";
          deliveryAttempts = randomInt(rand, 0, 1);
          break;
        case "delivered":
          shippingStatus = "delivered";
          actualDelivery = new Date(estimatedDelivery.getTime() - randomInt(rand, -1, 2) * 24 * 60 * 60 * 1000);
          deliveryAttempts = randomInt(rand, 1, 2);
          break;
        case "returned":
          shippingStatus = rand() < 0.5 ? "returned_to_sender" : "failed_delivery";
          deliveryAttempts = randomInt(rand, 1, 3);
          if (shippingStatus === "returned_to_sender") {
            actualDelivery = new Date(estimatedDelivery.getTime());
          }
          break;
        case "cancelled":
          shippingStatus = "pending_pickup";
          break;
        default:
          shippingStatus = "pending_pickup";
      }

      const isReturned = status === "returned";
      const returnReason = isReturned ? weightedPickFromMap(rand, RETURN_REASON_WEIGHTS) : null;
      const returnDate = isReturned
        ? new Date(estimatedDelivery.getTime() + randomInt(rand, 1, 5) * 24 * 60 * 60 * 1000)
        : null;
      const refundAmount = isReturned ? totalAmount : null;
      const refundStatus = isReturned ? pickOne(rand, ["pending", "processed", "completed"] as const) : null;

      orders.push({
        orderId,
        channel,
        status,
        customer: { name, email, phone, city, country, address },
        items,
        payment: {
          method,
          status: paymentStatus,
          currency,
          subtotal,
          shippingCost,
          vatAmount,
          discount,
          totalAmount,
          codAmount: method === "cod" ? totalAmount : null,
        },
        shipping: {
          partner,
          trackingNumber: randomTrackingNumber(rand, partner),
          estimatedDelivery,
          actualDelivery,
          deliveryAttempts,
          status: shippingStatus,
        },
        return: {
          isReturned,
          returnReason,
          returnDate,
          refundAmount,
          refundStatus,
        },
        notes: "",
        createdAt,
      });
    }
  }

  return orders;
}
