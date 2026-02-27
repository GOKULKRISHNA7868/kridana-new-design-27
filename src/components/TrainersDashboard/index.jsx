import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import TrainersTable from "./TrainersTable";
import StudentsAttendancePage from "./StudentsAttendancePage";
import FeesDetailsPage from "./FeesDetailsPage";
import AddStudentDetailsPage from "./AddStudentDetailsPage";
import PaymentsPage from "./PaymentsPage";
import { Pagination } from "./shared";
import Editprofile from "./Editprofile";
import MyStudents from "./MyStudents";
import DemoClasses from "./DemoClasses";
import InstituteBookedDemos from "./InstituteBookedDemos";
import TermsAndConditions from "../../pages/Terms";
import PrivacyPolicy from "../../pages/Privacy";
import PerformanceReports from "./PerformanceReports";
import Timetable from "./Timetable";
import PaymentsSubscriptionPage from "./PaymentsSubscriptionPage";
import MyAccountPage from "./MyAccountPage";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Reelsdata from "./Reelsdata";
import ChatBox from "./ChatBox";
import TrainerEventsPage from "./Events/EventsPage";
import TrainerMyAccountLayout from "./MyAccount/MyAccountLayout";
/* =============================
   🔥 NEW ROLE STATE
============================= */
const TrainersDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Home");
  const [view, setView] = useState("trainersData");
  const [trainers, setTrainers] = useState([]);
  const [trainerType, setTrainerType] = useState("Trainer"); // NEW
  const { institute } = useAuth();
const [trainerData, setTrainerData] = useState(null);

  const studentLabel = trainerType === "Therapist" ? "Patients" : "Students";
  const trainerLabel = trainerType === "Therapist" ? "Therapist" : "Trainer";

const sidebarItems = [
  { label: "Dashboard", value: "Home" },
  { label: "Customers Attendance", value: "Customers Attendance" },
  { label: "Customer Details", value: "Customer Details" },
  { label: "Performance Reports", value: "Performance Reports" },
  { label: "Fees Details", value: "Fees Details" },
  { label: "Time Table", value: "Time Table" },
  { label: "Add Events", value: "Add Events" },
  { label: "Analytics", value: "Analytics" },
  { label: "Chat Box", value: "Chat Box" },
  { label: "My Account", value: "My Account" },
  { label: "Payment & Subscription", value: "Payment & Subscription" },
];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =============================
     🔥 FETCH TRAINER TYPE
  ============================= */
  useEffect(() => {
    const fetchTrainerType = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "trainers"),
          where("__name__", "==", user.uid),
        );

        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setTrainerType(data.trainerType || "Trainer");
        }
      } catch (err) {
        console.error("Error fetching trainer type:", err);
      }
    };

    fetchTrainerType();
  }, []);

  /* =============================
   🔥 FETCH STUDENTS
============================= */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, "trainerstudents"),
          where("trainerUID", "==", user.uid),
        );

        const snap = await getDocs(q);

        const studentsData = snap.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName || ""} ${doc.data().lastName || ""}`,
          batch: doc.data().category || "N/A",
          phone: doc.data().phoneNumber || "N/A",
          createdAt: doc.data().createdAt || null,
        }));

        setTrainers(studentsData);
      } catch (error) {
        console.error("Error fetching trainer students:", error);
      }
    };

    fetchStudents();
  }, []);
  useEffect(() => {
  const fetchTrainerData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "trainers", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTrainerData(docSnap.data());
      }
    } catch (err) {
      console.error("Error fetching trainer data:", err);
    }
  };

  fetchTrainerData();
}, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);

  const isSameDay = (firestoreDate, selectedDate) => {
    if (!selectedDate) return true;
    if (!firestoreDate) return false;

    let d1;

    if (firestoreDate.seconds) {
      d1 = new Date(firestoreDate.seconds * 1000);
    } else if (firestoreDate instanceof Date) {
      d1 = firestoreDate;
    } else {
      return false;
    }

    const d2 = new Date(selectedDate);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

      const matchesDate = isSameDay(t.createdAt, selectedDate);

      return matchesSearch && matchesDate;
    });
  }, [trainers, search, selectedDate]);

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);

  const paginatedTrainers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrainers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrainers, currentPage]);

  const handleMenuClick = (item) => {
    setActiveMenu(item);
    setSidebarOpen(false);
   if (item === "Home") return setView("trainersData");

if (item === "Customers Attendance")
  return setView("studentsAttendance");

if (item === "Customer Details")
  return setView("addStudent");

if (item === "Performance Reports")
  return setView("performance");

if (item === "Fees Details")
  return setView("feesDetails");

if (item === "Time Table")
  return setView("timetable");

if (item === "Add Events")
  return setView("events");

if (item === "Analytics")
  return setView("analytics");

if (item === "Chat Box")
  return setView("chatBox");

if (item === "My Account")
  return setView("myAccount");

if (item === "Payment & Subscription")
  return setView("PaymentsSubscriptionPage");
   

    setView("notConnected");
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "trainerstudents", id));
      setTrainers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  const renderMainContent = () => {
    if (view === "MyStudents") return <MyStudents />;
    if (view === "Editprofile") return <Editprofile />;
    if (view === "studentsAttendance") return <StudentsAttendancePage />;
    if (view === "feesDetails") return <FeesDetailsPage />;
    if (view === "addStudent") return <AddStudentDetailsPage />;
    if (view === "paymentDetails") return <PaymentsPage />;
    if (view === "demoClasses") return <DemoClasses />;
    if (view === "bookedDemos") return <InstituteBookedDemos />;
    if (view === "terms") return <TermsAndConditions />;
    if (view === "privacy") return <PrivacyPolicy />;
    if (view === "performance") return <PerformanceReports />;
    if (view === "analytics") return <Reelsdata />;
    if (view === "myAccount") return <TrainerMyAccountLayout />;
    if (view === "chatBox") return <ChatBox />;
if (view === "timetable") return <Timetable />;
if (view === "events") return <TrainerEventsPage />;

if (view === "PaymentsSubscriptionPage")
  return <PaymentsSubscriptionPage />;
    if (view === "notConnected") {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <h1 className="text-3xl font-bold text-orange-500 mb-3">
              🚧 Page Not Connected
            </h1>
            <p className="text-gray-500">
              This section is not implemented yet.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center mb-4 w-full">
          <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-5 py-2 w-full max-w-md">
            <span className="mr-2 text-lg text-[#7C4A1D]">🔍</span>
            <input
              type="text"
              placeholder={`Search ${trainerLabel.toLowerCase()} by name...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-[#5D3A09]"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Calendar */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border bg-orange-500 text-white rounded-full px-4 py-2 text-sm"
            />

            {/* Add Button */}
            <button
              onClick={() => setView("addStudent")}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-orange-500 mb-4">
          {trainerLabel}s Data
        </h1>

        <TrainersTable
          rows={paginatedTrainers}
          onDelete={handleDeleteStudent}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </>
    );
  };

  return (
    <div className="h-screen flex bg-gray-700 overflow-hidden relative">
      {/* Mobile Header */}
<div className="lg:hidden fixed top-0 left-0 right-0 bg-black z-40 flex items-center justify-between px-4 py-3">
  <button
    onClick={() => setSidebarOpen(true)}
    className="text-orange-500 text-2xl"
  >
    ☰
  </button>

  <span className="text-orange-500 font-bold">
    {institute?.instituteName || "Institute"}
  </span>
</div>
     <aside
  className={`
    fixed lg:static top-0 left-0 h-full w-72 bg-gray-700 p-3 overflow-y-auto
    transform transition-transform duration-300 z-50
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
>

  {/* ===== INSTITUTE CARD ===== */}
  <div className="bg-black rounded-xl p-4 flex items-center gap-3 mb-3">
<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-400">
  {trainerData?.profileImageUrl ? (
    <img
      src={trainerData.profileImageUrl}
      alt="profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <span className="text-orange-400 font-bold">
        {trainerData?.instituteName?.charAt(0) || "I"}
      </span>
    </div>
  )}
</div>

<span className="text-orange-500 font-bold text-lg">
  {trainerData?.instituteName || "Institute Name"}
</span>
  </div>

  {/* ===== MENU CARD ===== */}
  <div className="bg-black rounded-xl p-3 mb-3">
{sidebarItems.map((item) => (
  <button
    key={item.value}
    onClick={() => handleMenuClick(item.value)}
    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 transition-all
      ${
        activeMenu === item.value
          ? "text-orange-500 font-semibold"
          : "text-white hover:text-orange-400"
      }`}
  >
    {item.value === "Home" && (
      <div className="grid grid-cols-2 gap-1 w-4 h-4">
        <div className="bg-orange-500 w-1.5 h-1.5"></div>
        <div className="bg-orange-500 w-1.5 h-1.5"></div>
        <div className="bg-orange-500 w-1.5 h-1.5"></div>
        <div className="bg-orange-500 w-1.5 h-1.5"></div>
      </div>
    )}

    {item.label}
  </button>
))}
  </div>

  {/* ===== SETTINGS CARD ===== */}
  <div className="bg-black rounded-xl p-4">

    <h3 className="text-white font-bold text-lg mb-3">
      Settings
    </h3>

    <button
      onClick={() => handleMenuClick("Terms & Conditions")}
      className={`block w-full text-left py-2 ${
        activeMenu === "Terms & Conditions"
          ? "text-orange-500 font-semibold"
          : "text-white hover:text-orange-400"
      }`}
    >
      Terms & Conditions
    </button>

    <button
      onClick={() => handleMenuClick("Privacy Policy")}
      className={`block w-full text-left py-2 ${
        activeMenu === "Privacy Policy"
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
{/* Mobile Overlay */}
{sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  />
)}

      <main className="flex-1 bg-white px-4 sm:px-6 md:px-8 lg:px-10 py-8 overflow-y-auto h-full mt-14 lg:mt-0">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default TrainersDashboard;