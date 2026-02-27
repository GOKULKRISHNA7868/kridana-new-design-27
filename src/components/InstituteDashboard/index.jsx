// src/components/InstituteDashboard/InstituteDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TermsAndConditions from "../../pages/Terms";
import PrivacyPolicy from "../../pages/Privacy";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import PerformanceReports from "./PerformanceReports";
import InstituteDataPage from "./InstituteDataPage";
import StudentsAttendancePage from "./StudentsAttendancePage";
import TrainersAttendancePage from "./TrainersAttendancePage";
import FeesDetailsPage from "./FeesDetailsPage";
import SalaryDetailsPage from "./SalaryDetailsPage";
import AddTrainerDetailsPage from "./AddTrainerDetailsPage";
import AddStudentDetailsPage from "./AddStudentDetailsPage";
import PaymentsPage from "./PaymentsPage";
import Editprofile from "./Editprofile";
import Timetable from "./Timetable";
import SellSportsMaterial from "./SellSportsMaterial";
import UploadProductDetails from "./UploadProductDetails";
import Orders from "./Orders";
import DemoClasses from "./DemoClasses";
import InstituteBookedDemos from "./InstituteBookedDemos";
import Reelsdata from "./Reelsdata";
import MyAccountLayout from "./MyAccount/MyAccountLayout";
import PaymentsSubscriptionPage from "./PaymentsSubscriptionPage";
import ChatBox from "./ChatBox";
import EventsPage from "./Events/EventsPage";
import EventsSidebar from "./Events/EventsSidebar";
const sidebarItems = [
  "Dashboard",
  "Customers Attendance",
  "Customer Details",
  "Performance Reports",
  "Fees Details",
  "Management Attendance",
  "Management Details",
  "Salary Details",
  "Time Table",
  "Add Events",
  "Analytics",
  "Chat Box",
  "My Account",
  "Payment & Subscription",
];


const InstituteDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const { institute, user } = useAuth();
  const idleTimer = useRef(null);
  const mainContentRef = useRef(null);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [dataType, setDataType] = useState("students");


  /* =============================
     📂 FETCH STUDENTS & TRAINERS
  ============================= */

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeMenu]);

  useEffect(() => {
    if (!user?.uid) return;

    const studentsQuery = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid),
    );

    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      const data = snap.docs.map((doc) => {
        const raw = doc.data();

        return {
          uid: doc.id,
          ...raw,

          // ✅ keep category fallback logic
          batch: raw.batch || raw.category || "",

          createdAt: raw.createdAt
            ? raw.createdAt.toDate().toISOString().split("T")[0]
            : null,
        };
      });

      setStudents(data);
    });

    const trainersQuery = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid),
    );

    const unsubTrainers = onSnapshot(trainersQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        trainerUid: doc.id,
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        category: doc.data().category || "",
        phone: doc.data().phone || "",
        createdAt: doc.data().createdAt
          ? doc.data().createdAt.toDate().toISOString().split("T")[0]
          : null,
      }));

      setTrainers(data);
    });

    return () => {
      unsubStudents();
      unsubTrainers();
    };
  }, [user]);

  /* =============================
     📂 RENDER MAIN CONTENT
  ============================= */
  const renderMainContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return (
          <InstituteDataPage
            students={students}
            trainers={trainers}
            studentLabel="Customers"
            trainerLabel="Management"
            setDataType={setDataType}
            setActiveMenu={setActiveMenu}
            onDeleteStudent={(uid) =>
              setStudents((prev) => prev.filter((s) => s.uid !== uid))
            }
            onDeleteTrainer={(trainerUid) =>
              setTrainers((prev) =>
                prev.filter((t) => t.trainerUid !== trainerUid)
              )
            }
          />
        );

      case "Customers Attendance":
        return <StudentsAttendancePage />;
      case "Management Attendance":
        return <TrainersAttendancePage />;
      case "Fees Details":
        return <FeesDetailsPage />;
      case "Salary Details":
        return <SalaryDetailsPage />;
      case "Management Details":
        return <AddTrainerDetailsPage />;
      case "Customer Details":
        return <AddStudentDetailsPage />;
      case "Add Events":
        return <EventsPage />;
      case "Sell Sports Material":
        return <SellSportsMaterial setActiveMenu={setActiveMenu} />;
      case "Upload Product Details":
        return <UploadProductDetails />;
      case "Orders":
        return <Orders />;
      case "Terms & Conditions":
        return <TermsAndConditions />;
      case "Privacy Policy":
        return <PrivacyPolicy />;
      case "Performance Reports":
        return <PerformanceReports />;
      case "Analytics":
        return <Reelsdata />;
        case "Time Table":
  return <Timetable />;
      case "Chat Box":
  return <ChatBox />;
      case "My Account":
        return <MyAccountLayout />;

      case "Payment & Subscription":
        return <PaymentsSubscriptionPage />;
      default:
        return (
          <div className="text-black">
            <h1 className="text-4xl font-extrabold mb-4">{activeMenu}</h1>
            <p className="text-lg max-w-xl">
              This section will be connected to data later.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-gray-700 overflow-hidden">


      <aside className="w-72 bg-gray-700 p-3 overflow-y-auto">

{/* ===== INSTITUTE CARD ===== */}
<div className="bg-black rounded-xl p-4 flex items-center gap-3 mb-3">

  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-black font-bold">
    {institute?.profileImageUrl ? (
      <img
        src={institute.profileImageUrl}
        alt="Institute"
        className="w-full h-full object-cover"
      />
    ) : (
      institute?.instituteName?.charAt(0)?.toUpperCase() || "I"
    )}
  </div>

  <span className="text-orange-500 font-bold text-lg">
    {institute?.instituteName || "Institute name"}
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
              {/* Orange icon only for active Dashboard */}
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

          <button
            onClick={() => setActiveMenu("Terms & Conditions")}
            className={`block w-full text-left py-2 ${activeMenu === "Terms & Conditions"
              ? "text-orange-500 font-semibold"
              : "text-white hover:text-orange-400"
              }`}
          >
            Terms & Conditions
          </button>

          <button
            onClick={() => setActiveMenu("Privacy Policy")}
            className={`block w-full text-left py-2 ${activeMenu === "Privacy Policy"
              ? "text-orange-500 font-semibold"
              : "text-white hover:text-orange-400"
              }`}
          >
            Privacy Policy
          </button>

          <button
            onClick={() => signOut(auth)}
            className="block w-full text-left py-2 text-white hover:text-red-400"
          >
            Logout
          </button>

        </div>

      </aside>




      <main
        ref={mainContentRef}
        className="flex-1 bg-white px-10 py-8 overflow-y-auto h-full"
      >
        {/* 🔝 TOP HEADER (ONLY FOR HOME) */}

        {renderMainContent()}
      </main>
    </div>
  );
};

export default InstituteDashboard;