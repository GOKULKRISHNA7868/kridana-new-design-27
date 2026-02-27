// src/components/InstituteDashboard/InstituteDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CustomerCentricPolicies from "../../pages/CustomerCentricPolicies";
import PrivacyPolicy from "../../pages/Privacy";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

// 
import ChatBox from "./ChatBox";
import Timetables from "./Timetables.jsx";

import MyAccount from "./MyAccount";
import Dashboard from "./Dashboard";
import FeesDetailsPage from "./FeesDetailsPage";
/* =============================
   SIDEBAR ITEMS
============================= */


const sidebarItems = [
  "Dashboard",
  "Time Table",
  "Chat Box",
  "My Account",
  "Fees Details",
];
const SettingsItems = [
  "Customer Policy",
  "Privacy Policy",
  "Logout",
];

// ✅ for OTHER USERS




const UserDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const idleTimer = useRef(null);

  const [role, setRole] = useState(null);

  // ✅ NEW: Role Loading Fix (Avoid Flash)
  const [roleLoading, setRoleLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [familyStudents, setFamilyStudents] = useState([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState("");

  /* =============================
     ⏱ AUTO LOGOUT (5 MIN)
  ============================= */

  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(handleLogout, 5 * 60 * 1000);
    };

    ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
      window.addEventListener(e, resetTimer),
    );
    resetTimer();

    return () => {
      ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
        window.removeEventListener(e, resetTimer),
      );
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  /* =============================
     🚪 LOGOUT
  ============================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  /* =============================
     🔑 ROLE DETECTION
  ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const detectRole = async () => {
      setRoleLoading(true); // ✅ Start Loading

      const studentSnap = await getDoc(doc(db, "students", user.uid));
      if (studentSnap.exists()) {
        setRole("student");
        setRoleLoading(false);
        return;
      }

      const trainerSnap = await getDoc(doc(db, "InstituteTrainers", user.uid));
      if (trainerSnap.exists()) {
        setRole("trainer");
        setRoleLoading(false);
        return;
      }

      const trainerStudentSnap = await getDoc(
        doc(db, "trainerstudents", user.uid),
      );
      if (trainerStudentSnap.exists()) {
        setRole("trainerstudent");
        setRoleLoading(false);
        return;
      }
      const familySnap = await getDoc(doc(db, "families", user.uid));
      if (familySnap.exists()) {
        setRole("trainerstudent"); // treat family as trainerstudent
        setFamilyStudents(familySnap.data().students || []);
        setSelectedStudentUid(familySnap.data().students?.[0] || "");
        setRoleLoading(false);
        return;
      }

      // ✅ other users
      setRole("other");
      setRoleLoading(false);
    };

    detectRole();
  }, [user]);

  /* =============================
     📂 FETCH DATA (UNCHANGED)
  ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const studentsQuery = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid),
    );

    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      setStudents(
        snap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })),
      );
    });

    const trainersQuery = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid),
    );

    const unsubTrainers = onSnapshot(trainersQuery, (snap) => {
      setTrainers(
        snap.docs.map((doc) => ({
          trainerUid: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => {
      unsubStudents();
      unsubTrainers();
    };
  }, [user]);

  /* =============================
     📂 MAIN CONTENT
  ============================= */
  const renderMainContent = () => {
    switch (activeMenu) {
      case "Dashboard":
  return <Dashboard />;

    case "Time Table":
  return <Timetables />;

      case "Chat Box":
        return <ChatBox />;

    case "My Account":
  return <MyAccount />;
      case "Fees Details":
        return <FeesDetailsPage />;

case "Customer Policy":
  return <CustomerCentricPolicies />;

case "Privacy Policy":
  return <PrivacyPolicy />;

      default:
        return null;
    }
  };

  /* =============================
     🧭 SIDEBAR BASED ON ROLE
  ============================= */

  /* =============================
     ✅ LOADING SCREEN (NO FLASH)
  ============================= */
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-orange-700">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen flex bg-gray-700 overflow-hidden">
      {/* Sidebar */}
      {/* ===== SIDEBAR ===== */}
      <aside className="w-72 bg-gray-700 p-3 overflow-y-auto">

        {/* ===== INSTITUTE CARD ===== */}
        <div className="bg-black rounded-xl p-4 flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-orange-400">
            <span className="text-orange-400 font-bold">
              {user?.displayName?.charAt(0) || "U"}
            </span>
          </div>

          <span className="text-orange-500 font-bold text-lg">
            {user?.displayName || "User"}
          </span>
        </div>

        {/* ===== MENU CARD ===== */}
        <div className="bg-black rounded-xl p-3 mb-3">

          {sidebarItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 transition-all
        ${activeMenu === item
                  ? "text-orange-500 font-semibold"
                  : "text-white hover:text-orange-400"
                }`}
            >
              {item === "Dashboard" && (
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-orange-500 w-1.5 h-1.5"></div>
                  <div className="bg-orange-500 w-1.5 h-1.5"></div>
                  <div className="bg-orange-500 w-1.5 h-1.5"></div>
                  <div className="bg-orange-500 w-1.5 h-1.5"></div>
                </div>
              )}

              {item}
            </button>
          ))}

        </div>

        {/* ===== SETTINGS CARD ===== */}
        <div className="bg-black rounded-xl p-4">

          <h3 className="text-white font-bold text-lg mb-3">
            Settings
          </h3>

{SettingsItems.map((item) => (
  <button
    key={item}
    onClick={() => {
      if (item === "Logout") return handleLogout();
      setActiveMenu(item);
    }}
    className={`block w-full text-left py-2 ${
      activeMenu === item
        ? "text-orange-500 font-semibold"
        : "text-white hover:text-orange-400"
    }`}
  >
    {item}
  </button>
))}

        </div>

      </aside>

      {/* Main */}
      <main className="flex-1 bg-white px-10 py-8 overflow-y-auto h-full">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default UserDashboard;