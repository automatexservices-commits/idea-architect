import { getSession, refreshSessionToken } from "@/features/auth";
import { requestInsforgeJson } from "@/lib/insforge-backend";
import { type PricingPlanId } from "./pricing-config";

type BillingPlan = "pro" | "enterprise";
export type { PricingPlanId } from "./pricing-config";

type CreateOrderResponse = {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  keyId: string;
  receipt: string;
  error?: string;
};

export type BillingPaymentRecord = {
  id: string;
  user_id: string;
  plan: BillingPlan;
  amount_in_paise: number;
  amount_in_inr: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  order_id: string;
  payment_id: string;
  receipt: string;
  method: string | null;
  upi_id: string | null;
  signature: string;
  notes: Record<string, unknown>;
  paid_at: string;
  created_at: string;
  updated_at: string;
};

export type BillingDashboardResponse = {
  success: boolean;
  summary: {
    accountRole: "free" | "pro" | "enterprise";
    currentPlan: string;
    totalSpentInPaise: number;
    totalSpentInInr: number;
    paymentCount: number;
    memberSince: string | null;
    upiId: string;
    upiName: string;
    latestPaymentAt: string | null;
  };
  payments: BillingPaymentRecord[];
  error?: string;
};

type PaymentConfirmationResponse = {
  success: boolean;
  recorded: boolean;
  payment: BillingPaymentRecord;
  error?: string;
};

function getBillingUpiId() {
  return import.meta.env.VITE_BILLING_UPI_ID ?? "7984390066@ptyes";
}

function getPlanAmountInInr(plan: BillingPlan) {
  if (plan === "pro") {
    return Number(import.meta.env.VITE_RAZORPAY_PRO_AMOUNT_INR ?? "49");
  }

  if (plan === "enterprise") {
    return Number(import.meta.env.VITE_RAZORPAY_ENTERPRISE_AMOUNT_INR ?? "150");
  }

  return Number(import.meta.env.VITE_RAZORPAY_CUSTOM_AMOUNT_INR ?? "0");
}

function buildUpiIntentUrl(plan: BillingPlan, options?: { name?: string; note?: string }) {
  const amount = getPlanAmountInInr(plan);
  const params = new URLSearchParams({
    pa: getBillingUpiId(),
    pn: options?.name ?? "PLANNR",
    am: amount.toFixed(2),
    cu: "INR",
    tn: options?.note ?? `${plan.toUpperCase()} plan payment for PLANNR`,
  });
  return `upi://pay?${params.toString()}`;
}

async function getAuthToken() {
  const session = await getSession();
  if (session?.accessToken) return session.accessToken;
  const refreshed = await refreshSessionToken();
  return refreshed?.accessToken ?? null;
}

async function fetchBillingDashboard() {
  let token = await getAuthToken();
  if (!token) {
    throw new Error("Please sign in to view billing history.");
  }

  let { response, body } = await requestInsforgeJson<BillingDashboardResponse>(
    "/payments/history",
    {},
    { Authorization: `Bearer ${token}` },
  );

  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    token = refreshed?.accessToken ?? null;
    if (!token) {
      throw new Error("Please sign in to view billing history.");
    }

    ({ response, body } = await requestInsforgeJson<BillingDashboardResponse>(
      "/payments/history",
      {},
      { Authorization: `Bearer ${token}` },
    ));
  }

  if (!response.ok) {
    if (response.status === 404) {
      // Return an empty-but-valid dashboard so the UI shows no error/message.
      return {
        success: true,
        summary: {
          accountRole: "free",
          currentPlan: "Hobby",
          totalSpentInPaise: 0,
          totalSpentInInr: 0,
          paymentCount: 0,
          memberSince: null,
          upiId: getBillingUpiId(),
          upiName: "PLANNR",
          latestPaymentAt: null,
        },
        payments: [],
      } as BillingDashboardResponse;
    }

    throw new Error(body && typeof body === "object" && "error" in body ? String((body as BillingDashboardResponse).error ?? `Failed to load billing history (${response.status}).`) : `Failed to load billing history (${response.status}).`);
  }

  if (!body?.success) {
    throw new Error(body?.error || "Failed to load billing history.");
  }

  return body;
}

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."));
  }

  if ((window as Window & { Razorpay?: unknown }).Razorpay) {
    return Promise.resolve();
  }

  const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay checkout.")), {
        once: true,
      });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.head.appendChild(script);
  });
}

async function createOrder(plan: BillingPlan) {
  const { response, body } = await requestInsforgeJson<CreateOrderResponse>(
    "/payments/order",
    {
      method: "POST",
      body: JSON.stringify({ plan }),
    },
    {
      "Content-Type": "application/json",
    },
  );

  if (!response.ok || !body?.success) {
    throw new Error(body?.error || `Failed to create ${plan} payment order.`);
  }

  return body;
}

async function confirmRazorpayPayment(
  plan: BillingPlan,
  razorpayResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  options?: { upiId?: string; method?: string },
) {
  let token = await getAuthToken();
  if (!token) {
    throw new Error("Please sign in before paying.");
  }

  const { response, body } = await requestInsforgeJson<PaymentConfirmationResponse>(
    "/payments/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        plan,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        upiId: options?.upiId ?? getBillingUpiId(),
        method: options?.method ?? "razorpay",
      }),
    },
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  );

  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    token = refreshed?.accessToken ?? null;
    if (!token) {
      throw new Error("Please sign in before paying.");
    }

    const retry = await requestInsforgeJson<PaymentConfirmationResponse>(
      "/payments/confirm",
      {
        method: "POST",
        body: JSON.stringify({
          plan,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          upiId: options?.upiId ?? getBillingUpiId(),
          method: options?.method ?? "razorpay",
        }),
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    );

    if (!retry.response.ok || !retry.body?.success) {
      throw new Error(retry.body?.error || `Failed to record ${plan} payment.`);
    }

    return retry.body.payment;
  }

  if (!response.ok || !body?.success) {
    throw new Error(body?.error || `Failed to record ${plan} payment.`);
  }

  return body.payment;
}

export async function openRazorpayCheckout(
  plan: BillingPlan,
  options?: { email?: string; name?: string; upiId?: string; amountInInr?: number; description?: string; receiptPrefix?: string },
) {
  await loadRazorpayScript();

  const order = await createOrder(plan);
  const RazorpayCheckout = (window as Window & {
    Razorpay?: new (config: Record<string, unknown>) => { open: () => void; on?: (event: string, handler: () => void) => void };
  }).Razorpay;

  if (!RazorpayCheckout) {
    throw new Error("Razorpay checkout is not available.");
  }

  return await new Promise<BillingPaymentRecord>((resolve, reject) => {
    const instance = new RazorpayCheckout({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.orderId,
      prefill: {
        email: options?.email,
        name: options?.name,
      },
      theme: {
        color: "#22c55e",
      },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const payment = await confirmRazorpayPayment(plan, response, {
            upiId: options?.upiId,
            method: "razorpay",
          });
          resolve(payment);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Razorpay checkout was closed before payment completed.")),
      },
    });
    instance.open();
  });
}

export async function openPricingCheckout(
  plan: PricingPlanId,
  options?: { email?: string; name?: string; upiId?: string },
) {
  if (plan === "free") {
    return null;
  }

  if (plan === "pro") {
    return await openRazorpayCheckout("pro", options);
  }

  if (plan === "enterprise") {
    return await openRazorpayCheckout("enterprise", options);
  }

  return null;
}

export async function payViaUpiIntent(plan: BillingPlan, options?: { name?: string; note?: string }) {
  if (typeof window === "undefined") {
    throw new Error("UPI payments are only available in the browser.");
  }

  const intent = buildUpiIntentUrl(plan, options);
  window.location.assign(intent);
  return intent;
}

export { buildUpiIntentUrl, fetchBillingDashboard };
