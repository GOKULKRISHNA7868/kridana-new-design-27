import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { getDoc } from "firebase/firestore";
const PaymentsSubscriptionPage = () => {
  const { user } = useAuth();

  const [showPlans, setShowPlans] = useState(false);
  const [billingType, setBillingType] = useState("month"); // month / year
  const [currentPlan, setCurrentPlan] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("");
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  /* =============================
       🔹 HANDLE PAYMENT (BACKEND)
    ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const fetchPlan = async () => {
      try {
        const planRef = doc(db, "plans", user.uid);
        const snap = await getDoc(planRef);

        if (snap.exists()) {
          const data = snap.data();

          const cp = data?.currentPlan || {};

          setCurrentPlan(cp?.planType || "FREE");
          setStartDate(cp?.startDate?.toDate?.() || null);
          setEndDate(cp?.endDate?.toDate?.() || null);
          setStatus(data?.status || "");
          setFreeTrialUsed(!!data?.freeTrialUsed);
        }
      } catch (err) {
        console.error("🔥 Fetch Plan Error:", err);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlan();
  }, [user]);
  const formatDate = (date) => {
    if (!date) return "--";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProgressPercent = () => {
    if (!startDate || !endDate) return 0;

    const now = new Date().getTime();
    const start = startDate.getTime();
    const end = endDate.getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    return ((now - start) / (end - start)) * 100;
  };
  const handlePayment = async (planName, price) => {
    try {
      await setDoc(doc(db, "subscriptions", user.uid), {
        plan: planName,
        billing: billingType,
        amount: price,
        createdAt: serverTimestamp(),
      });

      alert("Subscription saved in backend!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ============================= */}
      {/* 🔶 HEADER */}
      {/* ============================= */}

      <h1 className="text-3xl sm:text-4xl font-bold mb-6">
        Choose Your Plan & Pay
      </h1>

      {/* ============================= */}
      {/* 🔶 TRIAL CARD */}
      {/* ============================= */}

      {/* ============================= */}
      {/* 🔶 TRIAL PERIOD CARD */}
      {/* ============================= */}

      <div className="bg-[#FF6A00] rounded-2xl p-6 sm:p-8 text-white relative mb-10 shadow-md">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="bg-[#ffffff] p-3 rounded-lg">
              <span className="text-black text-xl">
                {" "}
                <img
                  src="/calendar.png"
                  alt="Upload"
                  className="w-5 h-5 object-contain"
                />
              </span>
            </div>

            <h2 className="text-2xl font-semibold tracking-wide">
              Trail Period
            </h2>
          </div>

          {/* Right Active Box */}
          <div className="bg-white text-black px-6 py-3 rounded-xl shadow-sm text-center">
            <p className="font-semibold">Active Trial :</p>
            <p className="text-sm">
              {endDate
                ? `${Math.max(
                    0,
                    Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)),
                  )} Days Remaining`
                : "--"}
            </p>
          </div>
        </div>

        {/* ================= Progress Section ================= */}
        {/* ================= EXACT IMAGE STYLE BAR ================= */}

        <div className="mt-8 flex items-center gap-6">
          {/* LEFT TEXT */}
          <div className="min-w-[110px]">
            <p className="font-semibold text-white">Trail Started</p>
            <p className="text-xs text-white/80">{formatDate(startDate)}</p>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex-1 relative h-[8px] bg-[#8E8E8E] rounded-full overflow-hidden">
            {/* WHITE PROGRESS */}
            <div
              className="absolute left-0 top-0 h-full bg-white rounded-full"
              style={{ width: `${getProgressPercent()}%` }} // 🔥 Change this percentage only
            />
          </div>

          {/* RIGHT TEXT */}
          <div className="min-w-[90px] text-right">
            <p className="font-semibold text-white">Trail End</p>
            <p className="text-xs text-white/80">{formatDate(endDate)}</p>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* 🔶 CHOOSE PROFILE */}
      {/* ============================= */}

      <h2 className="text-2xl font-semibold mb-6">Choose Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
        {/* Trainer Plan */}
        <div className="border border-orange-400 rounded-xl p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Trainer's Plan</h3>
            <p className="text-orange-600 font-bold mt-2">₹ 499/-</p>
          </div>

          <button
            onClick={() => setShowPlans(true)}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg"
          >
            Pay Now
          </button>
        </div>

        {/* Institute Plan */}
        <div className="border border-orange-400 rounded-xl p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Institutes Plan</h3>
            <p className="text-orange-600 font-bold mt-2">₹ 999/-</p>
          </div>

          <button
            onClick={() => setShowPlans(true)}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg"
          >
            Pay Now
          </button>
        </div>
      </div>

      {/* ============================= */}
      {/* 🔶 POPUP MODAL */}
      {/* ============================= */}

      {showPlans && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-6xl rounded-xl p-6 relative overflow-y-auto max-h-[90vh]">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowPlans(false)}
              className="absolute top-4 right-4 text-gray-600 text-xl"
            >
              ✕
            </button>

            {/* BILLING TOGGLE */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setBillingType("month")}
                  className={`px-6 py-2 ${
                    billingType === "month" ? "bg-orange-500 text-white" : ""
                  }`}
                >
                  Month
                </button>

                <button
                  onClick={() => setBillingType("year")}
                  className={`px-6 py-2 ${
                    billingType === "year" ? "bg-orange-500 text-white" : ""
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            {/* ============================= */}
            {/* 🔶 PLANS GRID */}
            {/* ============================= */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <PlanCard
                title="FREE (1 Month)"
                subtitle="Trainer’s & Institutes"
                monthPrice="₹ 0/-"
                billingType="month" // 👈 VERY IMPORTANT CHANGE
                features={[
                  "Attendance Tracking",
                  "Fees Payment Tracking",
                  "Reports Generator",
                ]}
                onPay={() => handlePayment("Free", 0)}
              />
              <PlanCard
                title="Trainer's Plan"
                monthPrice="₹ 499/-"
                yearPrice="₹ 4,790"
                oldYearPrice="₹ 5,988/-"
                billingType={billingType}
                features={[
                  "Attendance Tracking",
                  "Fees Payment Tracking",
                  "Reports Generator",
                  "01 Free Ad Per Year",
                ]}
                onPay={() =>
                  handlePayment("Trainer", billingType === "month" ? 499 : 4790)
                }
              />

              {/* INSTITUTE */}
              <PlanCard
                title="Institutes Plan"
                monthPrice="₹ 999/-"
                yearPrice="₹ 9,590"
                oldYearPrice="₹ 11,988/-"
                billingType={billingType}
                features={[
                  "Trainers Management Attendance",
                  "Institutes Workforce Attendance",
                  "Institute Members Salary Tracking",
                  "Generate Reports",
                  "03 Ads Free Per Year",
                ]}
                onPay={() =>
                  handlePayment(
                    "Institute",
                    billingType === "month" ? 999 : 9590,
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =============================
   🔹 PLAN CARD COMPONENT
============================= */

const PlanCard = ({
  title,
  monthPrice,
  yearPrice,
  oldYearPrice,
  subtitle,
  features,
  onPay,
  billingType,
}) => {
  return (
    <div className="flex flex-col justify-between min-h-[540px] px-10 py-8">
      {/* PRICE SECTION */}
      <div>
        {billingType === "year" && oldYearPrice && (
          <p className="text-[14px] text-[#F25C05] line-through text-center mb-1">
            {oldYearPrice}
          </p>
        )}

        <div className="flex items-baseline justify-center gap-1 mb-4">
          <h2 className="text-[36px] font-extrabold text-[#F25C05] leading-none">
            {billingType === "month" ? monthPrice : yearPrice}
          </h2>

          {billingType === "year" && (
            <span className="text-[20px] font-semibold text-[#F25C05]">
              /Year
            </span>
          )}
        </div>

        <h3 className="text-[22px] font-bold text-black text-center mb-3">
          {title}
        </h3>

        {subtitle && (
          <p className="text-[18px] font-semibold text-black text-center mb-6">
            {subtitle}
          </p>
        )}
      </div>

      {/* FEATURES */}
      <ul className="space-y-4 text-[17px] text-black font-medium">
        {features.map((item, index) => (
          <li key={index} className="flex items-center gap-4 whitespace-nowrap">
            <span className="flex items-center justify-center min-w-[24px] h-[24px] rounded-full bg-[#19D100] text-white text-sm font-bold mt-1">
              ✓
            </span>

            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* BUTTON */}

      {/* BUTTON */}
      <div className="mt-10">
        <button
          onClick={onPay}
          className="bg-[#FF6A00] text-black font-semibold text-[18px] px-14 py-3 rounded-lg"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};
export default PaymentsSubscriptionPage;
