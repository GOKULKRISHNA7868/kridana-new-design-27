import React, { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  setDoc, // 🔥 ADD THIS
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import dayjs from "dayjs";
const inputClass =
  "h-11 px-3 w-full border border-orange-400 rounded-md bg-white outline-none focus:border-2 focus:border-orange-500";
const categories = [
  "Martial Arts",
  "Team Ball Sports",
  "Racket Sports",
  "Fitness",
  "Target & Precision Sports",
  "Equestrian Sports",
  "Adventure & Outdoor Sports",
  "Ice Sports",
  "Aquatic Sports",
  "Wellness",
  "Dance",
];

const subCategoryMap = {
  "Martial Arts": [
    "Karate",
    "Kung Fu",
    "Krav Maga",
    "Muay Thai",
    "Taekwondo",
    "Judo",
    "Brazilian Jiu-Jitsu",
    "Aikido",
    "Jeet Kune Do",
    "Capoeira",
    "Sambo",
    "Silat",
    "Kalaripayattu",
    "Hapkido",
    "Wing Chun",
    "Shaolin",
    "Ninjutsu",
    "Kickboxing",
    "Boxing",
    "Wrestling",
    "Shorinji Kempo",
    "Kyokushin",
    "Goju-ryu",
    "Shotokan",
    "Wushu",
    "Savate",
    "Lethwei",
    "Bajiquan",
    "Hung Gar",
    "Praying Mantis Kung Fu",
  ],
  "Team Ball Sports": [
    "Football / Soccer",
    "Basketball",
    "Handball",
    "Rugby",
    "Futsal",
    "Field Hockey",
    "Lacrosse",
    "Gaelic Football",
    "Volleyball",
    "Beach Volleyball",
    "Sepak Takraw",
    "Roundnet (Spikeball)",
    "Netball",
    "Cricket",
    "Baseball",
    "Softball",
    "Wheelchair Rugby",
    "Dodgeball",
    "Korfball",
  ],
  "Racket Sports": [
    "Tennis",
    "Table Tennis",
    "Badminton",
    "Squash",
    "Racquetball",
    "Padel",
    "Pickleball",
    "Platform Tennis",
    "Real Tennis",
    "Soft Tennis",
    "Frontenis",
    "Speedminton (Crossminton)",
    "Paddle Tennis (POP Tennis)",
    "Speed-ball",
    "Chaza",
    "Totem Tennis (Swingball)",
    "Matkot",
    "Jombola",
  ],
  Fitness: [
    "Gym Workout",
    "Weight Training",
    "Bodybuilding",
    "Powerlifting",
    "CrossFit",
    "Calisthenics",
    "Circuit Training",
    "HIIT",
    "Functional Training",
    "Core Training",
    "Mobility Training",
    "Stretching",
    "Resistance Band Training",
    "Kettlebell Training",
    "Boot Camp Training",
    "Spinning",
    "Step Fitness",
    "Pilates",
    "Yoga",
  ],
  "Target & Precision Sports": [
    "Archery",
    "Golf",
    "Bowling",
    "Darts",
    "Snooker",
    "Pool",
    "Billiards",
    "Target Shooting",
    "Clay Pigeon Shooting",
    "Air Rifle Shooting",
    "Air Pistol Shooting",
    "Croquet",
    "Petanque",
    "Bocce",
    "Lawn Bowls",
    "Carom Billiards",
    "Nine-Pin Bowling",
    "Disc Golf",
    "Kubb",
    "Pitch and Putt",
    "Shove Ha’penny",
    "Toad in the Hole",
    "Bat and Trap",
    "Boccia",
    "Gateball",
  ],
  "Equestrian Sports": [
    "Horse Racing",
    "Barrel Racing",
    "Rodeo",
    "Mounted Archery",
    "Tent Pegging",
  ],
  "Adventure & Outdoor Sports": [
    "Rock Climbing",
    "Mountaineering",
    "Trekking",
    "Hiking",
    "Mountain Biking",
    "Sandboarding",
    "Orienteering",
    "Obstacle Course Racing",
    "Skydiving",
    "Paragliding",
    "Hang Gliding",
    "Parachuting",
    "Hot-air Ballooning",
    "Skiing",
    "Snowboarding",
    "Ice Climbing",
    "Heli-skiing",
    "Bungee Jumping",
    "BASE Jumping",
    "Canyoning",
    "Kite Buggy",
    "Zorbing",
    "Zip Lining",
  ],
  "Aquatic Sports": [
    "Swimming",
    "Water Polo",
    "Surfing",
    "Scuba Diving",
    "Snorkeling",
    "Freediving",
    "Kayaking",
    "Canoeing",
    "Rowing",
    "Sailing",
    "Windsurfing",
    "Kite Surfing",
    "Jet Skiing",
    "Wakeboarding",
    "Water Skiing",
    "Stand-up Paddleboarding",
    "Whitewater Rafting",
    "Dragon Boat Racing",
    "Artistic Swimming",
    "Open Water Swimming",
  ],
  "Ice Sports": [
    "Ice Skating",
    "Figure Skating",
    "Ice Hockey",
    "Speed Skating",
    "Ice Dance",
    "Synchronized Skating",
    "Curling",
    "Broomball",
    "Bobsleigh",
    "Skiboarding",
    "Ice Dragon Boat Racing",
    "Ice Cross Downhill",
  ],
  Wellness: [
    "Yoga & Meditation",
    "Spa & Relaxation",
    "Mental Wellness",
    "Fitness",
    "Nutrition",
    "Traditional & Alternative Therapies",
    "Rehabilitation",
    "Lifestyle Coaching",
  ],
  Dance: [
    "Bharatanatyam",
    "Kathak",
    "Kathakali",
    "Kuchipudi",
    "Odissi",
    "Mohiniyattam",
    "Manipuri",
    "Sattriya",
    "Chhau",
    "Yakshagana",
    "Lavani",
    "Ghoomar",
    "Kalbelia",
    "Garba",
    "Dandiya Raas",
    "Bhangra",
    "Bihu",
    "Dollu Kunitha",
    "Theyyam",
    "Ballet",
    "Contemporary",
    "Hip Hop",
    "Breakdance",
    "Jazz Dance",
    "Tap Dance",
    "Modern Dance",
    "Street Dance",
    "House Dance",
    "Locking",
    "Popping",
    "Krumping",
    "Waacking",
    "Voguing",
    "Salsa",
    "Bachata",
    "Merengue",
    "Cha-Cha",
    "Rumba",
    "Samba",
    "Paso Doble",
    "Jive",
    "Tango",
    "Waltz",
    "Foxtrot",
    "Quickstep",
    "Flamenco",
    "Irish Stepdance",
    "Scottish Highland Dance",
    "Morris Dance",
    "Hula",
    "Maori Haka",
    "African Tribal Dance",
    "Zumba",
    "K-Pop Dance",
    "Shuffle Dance",
    "Electro Dance",
    "Pole Dance",
    "Ballroom Dance",
    "Line Dance",
    "Square Dance",
    "Folk Dance",
    "Contra Dance",
  ],
};
export default function StudentPerformanceReport() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [attendancePercent, setAttendancePercent] = useState(null);
  /* 🔽 AUTO-FILL EXISTING REPORT STATE */
  const [existingReportId, setExistingReportId] = useState(null);

  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
  });
  const [loadingReport, setLoadingReport] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  const [metrics, setMetrics] = useState({
    attendance: "",
    focus: "",
    skill: "",
    coach: "",
    fitness: "",
    team: "",
    discipline: "",
  });

  const [metricObservations, setMetricObservations] = useState({
    focus: "",
    skill: "",
    coach: "",
    fitness: "",
    team: "",
    discipline: "",
  });

  /* 🔽 NEW STATE ONLY */
  const [showPhysicalFitness, setShowPhysicalFitness] = useState(false);

  /* 🔽 NEW STATE (LOGIC ONLY, NO UI CHANGE) */
  const [physicalFitness, setPhysicalFitness] = useState({
    speed: { value: "", observation: "" },
    strength: { value: "", observation: "" },
    flexibility: { value: "", observation: "" },
    stamina: { value: "", observation: "" },
    agility: { value: "", observation: "" },
  });

  useEffect(() => {
    console.log("[INIT] Component Mounted");
    fetchInstituteStudents();
  }, []);

  useEffect(() => {
    console.log("[MONTH CHANGE]", selectedMonth);
    filterByMonth();
  }, [selectedMonth, students]);

  useEffect(() => {
    if (
      selectedStudent &&
      selectedMonth &&
      selectedCategory &&
      selectedSubCategory
    ) {
      console.log("[AUTO FETCH TRIGGERED]", {
        selectedStudent,
        selectedMonth,
        selectedCategory,
        selectedSubCategory,
      });

      fetchAttendance();
      fetchExistingPerformance();
    }
  }, [selectedStudent, selectedMonth, selectedCategory, selectedSubCategory]);
  const fetchInstituteStudents = async () => {
    try {
      const user = auth.currentUser;
      console.log("[AUTH USER]", user?.uid);
      if (!user) return;

      console.log("[FETCH MODE] instituteId based student fetch");

      const q = query(
        collection(db, "students"),
        where("instituteId", "==", user.uid),
      );

      const snap = await getDocs(q);

      console.log("[INSTITUTE STUDENTS COUNT]", snap.size);

      const list = [];
      snap.forEach((d) => {
        console.log("[STUDENT FOUND]", d.id, d.data());
        list.push({ id: d.id, ...d.data() });
      });

      console.log("[FINAL STUDENT LIST]", list);
      setStudents(list);
    } catch (err) {
      console.error("[ERROR fetchInstituteStudents]", err);
    }
  };

  const filterByMonth = () => {
    console.log("[FILTER BY MONTH] START");
    const month = dayjs(selectedMonth);
    const filtered = students.filter((s) => {
      if (!s.createdAt) {
        console.log("[NO CREATEDAT]", s.id);
        return false;
      }
      const joinDate = dayjs(s.createdAt.toDate());
      const valid =
        joinDate.isSame(month, "month") || joinDate.isBefore(month, "month");
      console.log("[MONTH FILTER]", s.id, joinDate.format(), valid);
      return valid;
    });
    console.log("[FILTERED STUDENTS]", filtered);
    setFilteredStudents(filtered);
  };
  const [manualAttendance, setManualAttendance] = useState({
    total: "",
    present: "",
    absent: 0,
    percent: "0%",
  });
  useEffect(() => {
    const total = Number(manualAttendance.total);
    const present = Number(manualAttendance.present);

    if (total > 0 && present >= 0 && present <= total) {
      const absent = total - present;
      const percent = ((present / total) * 100).toFixed(2) + "%";

      setManualAttendance((prev) => ({
        ...prev,
        absent,
        percent,
      }));
    }
  }, [manualAttendance.total, manualAttendance.present]);
  const fetchAttendance = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !selectedStudent) return;

      console.log("[FETCH ATTENDANCE] START");

      const start = dayjs(selectedMonth).startOf("month").format("YYYY-MM-DD");
      const end = dayjs(selectedMonth).endOf("month").format("YYYY-MM-DD");

      console.log("[MONTH RANGE]", start, "→", end);

      const colPath = `institutes/${user.uid}/attendance`;

      const snap = await getDocs(collection(db, colPath));

      const records = [];

      snap.forEach((d) => {
        const data = d.data();

        // 🔥 MATCHING NEW DATA STRUCTURE
        if (
          data.studentId === selectedStudent &&
          typeof data.date === "string" &&
          data.date >= start &&
          data.date <= end
        ) {
          records.push(data);
        }
      });

      console.log("[ATTENDANCE RECORDS]", records);

      if (records.length === 0) {
        console.log("[NO ATTENDANCE DATA]");
        setAttendancePercent(null);
        setAttendanceStats({ total: 0, present: 0 });
        setMetrics((prev) => ({ ...prev, attendance: "No Data" }));
        return;
      }

      let total = records.length;

      let present = records.filter(
        (r) => String(r.status).toLowerCase() === "present",
      ).length;

      const percent = ((present / total) * 100).toFixed(2);

      console.log("[ATTENDANCE CALC]", { total, present, percent });

      setAttendanceStats({ total, present });
      setAttendancePercent(percent);
      setMetrics((prev) => ({ ...prev, attendance: `${percent}%` }));
    } catch (err) {
      console.error("[ERROR fetchAttendance]", err);
    }
  };
  const resetFormState = () => {
    setAttendancePercent(null);
    setAttendanceStats({ total: 0, present: 0 });

    setManualAttendance({
      total: "",
      present: "",
      absent: 0,
      percent: "0.00%",
    });

    setMetrics({
      attendance: "",
      focus: "",
      skill: "",
      coach: "",
      fitness: "",
      team: "",
      discipline: "",
    });

    setMetricObservations({
      focus: "",
      skill: "",
      coach: "",
      fitness: "",
      team: "",
      discipline: "",
    });

    setPhysicalFitness({
      speed: { value: "", observation: "" },
      strength: { value: "", observation: "" },
      flexibility: { value: "", observation: "" },
      stamina: { value: "", observation: "" },
      agility: { value: "", observation: "" },
    });
  };
  const fetchExistingPerformance = async () => {
    try {
      setLoadingReport(true);

      const user = auth.currentUser;
      if (!user || !selectedStudent || !selectedMonth) return;

      const monthKey = dayjs(selectedMonth).format("YYYY-MM");

      const q = query(
        collection(db, `institutes/${user.uid}/performancestudents`),
        where("studentId", "==", selectedStudent),
        where("month", "==", monthKey),
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        console.log("[NO EXISTING REPORT]");
        resetFormState(); // ✅ clear old data
        setExistingReportId(null);
        return;
      }

      const docSnap = snap.docs[0];
      const data = docSnap.data();

      if (!data.categories || !Array.isArray(data.categories)) {
        console.log("[NO CATEGORIES ARRAY FOUND]");
        resetFormState(); // ✅
        return;
      }

      const categoryObj = data.categories.find(
        (c) => c.category === selectedCategory,
      );

      if (!categoryObj) {
        console.log("[CATEGORY NOT FOUND]", selectedCategory);
        resetFormState(); // ✅
        return;
      }

      const subObj = categoryObj.subCategories?.find(
        (s) => s.name === selectedSubCategory,
      );

      if (!subObj) {
        console.log("[SUBCATEGORY NOT FOUND]", selectedSubCategory);
        resetFormState(); // ✅
        return;
      }

      console.log("[AUTO FILL DATA]", subObj);

      // 🔽 FILL DATA
      setManualAttendance({
        total: subObj.attendance?.totalClasses || "",
        present: subObj.attendance?.presentClasses || "",
        absent: subObj.attendance?.absentClasses || 0,
        percent: subObj.attendance?.percent || "0.00%",
      });

      setMetrics(
        subObj.metrics || {
          attendance: "",
          focus: "",
          skill: "",
          coach: "",
          fitness: "",
          team: "",
          discipline: "",
        },
      );

      setMetricObservations(
        subObj.metricObservations || {
          focus: "",
          skill: "",
          coach: "",
          fitness: "",
          team: "",
          discipline: "",
        },
      );

      setPhysicalFitness(
        subObj.physicalFitness || {
          speed: { value: "", observation: "" },
          strength: { value: "", observation: "" },
          flexibility: { value: "", observation: "" },
          stamina: { value: "", observation: "" },
          agility: { value: "", observation: "" },
        },
      );
    } catch (err) {
      console.error("[ERROR fetchExistingPerformance]", err);
      resetFormState(); // ✅ safety clear
    } finally {
      setLoadingReport(false);
    }
  };
  const handleSave = async () => {
    try {
      if (savingReport) return; // ✅ block multi-click
      setSavingReport(true); // ✅ start saving

      const user = auth.currentUser;
      if (!user) return;

      // 🔐 HARD VALIDATIONS
      if (!selectedStudent) {
        alert("Select student");
        return;
      }

      if (!selectedCategory) {
        alert("Select category");
        return;
      }

      if (!selectedSubCategory) {
        alert("Select sub-category");
        return;
      }

      if (!manualAttendance.total || !manualAttendance.present) {
        alert("Enter total classes and present classes");
        return;
      }
      // 🔒 METRIC VALIDATION
      const metricKeys = ["focus", "skill", "coach", "fitness", "team", "discipline"];

      for (let key of metricKeys) {

        if (!metrics[key]) {
          alert(`${key.toUpperCase()} score is required`);
          return;
        }

        if (isNaN(metrics[key])) {
          alert(`${key.toUpperCase()} must be numeric`);
          return;
        }

      }
      const totalNum = Number(manualAttendance.total);
      const presentNum = Number(manualAttendance.present);

      if (isNaN(totalNum) || isNaN(presentNum)) {
        alert("Attendance values must be numbers");
        return;
      }

      const monthKey = dayjs(selectedMonth).format("YYYY-MM");
      const savePath = `institutes/${user.uid}/performancestudents`;

      const q = query(
        collection(db, savePath),
        where("studentId", "==", selectedStudent),
        where("month", "==", monthKey),
      );

      const snap = await getDocs(q);

      const subCategoryPayload = {
        name: selectedSubCategory,

        attendance: {
          totalClasses: totalNum,
          presentClasses: presentNum,
          absentClasses: manualAttendance.absent,
          percent: manualAttendance.percent,
        },

        attendanceHistory: [
          {
            month: monthKey,
            totalClasses: totalNum,
            presentClasses: presentNum,
            absentClasses: manualAttendance.absent,
            percent: manualAttendance.percent,
            updatedAt: Timestamp.now(), // ✅ allowed inside arrays
          },
        ],

        metrics,
        metricObservations,
        physicalFitness: {
          speed: physicalFitness.speed,
          strength: physicalFitness.strength,
          flexibility: physicalFitness.flexibility,
          stamina: physicalFitness.stamina,
          agility: physicalFitness.agility,
        },
      };

      // 🆕 CREATE DOC
      if (snap.empty) {
        await addDoc(collection(db, savePath), {
          studentId: selectedStudent,
          month: monthKey,
          categories: [
            {
              category: selectedCategory,
              subCategories: [subCategoryPayload],
            },
          ],
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        });

        alert("Performance Report Saved Successfully ✅");
        return;
      }

      // 🔁 UPDATE DOC
      const docSnap = snap.docs[0];
      const docRef = doc(db, savePath, docSnap.id);
      const data = docSnap.data();

      let categories = Array.isArray(data.categories)
        ? [...data.categories]
        : [];

      // 🔍 FIND CATEGORY
      const catIndex = categories.findIndex(
        (c) => c.category === selectedCategory,
      );

      if (catIndex === -1) {
        // ➕ New category
        categories.push({
          category: selectedCategory,
          subCategories: [subCategoryPayload],
        });
      } else {
        // ✅ ENSURE subCategories ARRAY EXISTS
        if (!Array.isArray(categories[catIndex].subCategories)) {
          categories[catIndex].subCategories = [];
        }

        const subIndex = categories[catIndex].subCategories.findIndex(
          (s) => s.name === selectedSubCategory,
        );

        if (subIndex === -1) {
          // ➕ New subcategory
          categories[catIndex].subCategories.push(subCategoryPayload);
        } else {
          // 🔁 Update existing subcategory
          categories[catIndex].subCategories[subIndex] = subCategoryPayload;
        }
      }

      await setDoc(
        docRef,
        {
          categories,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        },
        { merge: true },
      );

      alert("Performance Report Updated Successfully ✅");
    } catch (err) {
      console.error("🔥 [SAVE ERROR FULL]", err);
      alert("Save failed — check console");
    } finally {
      setSavingReport(false); // ✅ stop saving
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }

      if (
        subCategoryRef.current &&
        !subCategoryRef.current.contains(e.target)
      ) {
        setShowSubCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Student <span className="text-orange-500">Performance</span> Report
          </h2>
          <p className="text-gray-500">
            Create comprehensive performance evaluations for students
          </p>
        </div>
        <select
          className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const m = dayjs().month(i).format("YYYY-MM");
            return (
              <option key={i} value={m}>
                {dayjs(m).format("MMMM YYYY")}
              </option>
            );
          })}
        </select>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        <select
          className="border border-orange-300 rounded-lg p-3 w-full"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Select Student Name*</option>
          {filteredStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <div ref={categoryRef} className="relative">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`${inputClass} flex items-center justify-between text-left`}
          >
            <span>
              {selectedCategory ? selectedCategory : "Select Category"}
            </span>

            <ChevronDown
              size={18}
              className={`ml-2 transition-transform ${showCategoryDropdown ? "rotate-180" : ""
                }`}
            />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-50 mt-1 w-full left-0 bg-white border rounded-lg shadow-md max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubCategory("");
                    setAvailableSubCategories(
                      subCategoryMap[cat] ? [...subCategoryMap[cat]] : [],
                    );
                    setShowSubCategoryDropdown(false);
                    setShowCategoryDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={subCategoryRef} className="relative">
          <button
            type="button"
            disabled={!selectedCategory}
            onClick={() =>
              selectedCategory &&
              setShowSubCategoryDropdown(!showSubCategoryDropdown)
            }
            className={`${inputClass} flex items-center justify-between text-left ${!selectedCategory && "bg-gray-100 cursor-not-allowed"
              }`}
          >
            <span>
              {selectedSubCategory
                ? selectedSubCategory
                : selectedCategory
                  ? "Select Sub Category"
                  : "Select Category First"}
            </span>

            <ChevronDown
              size={18}
              className={`ml-2 transition-transform ${showSubCategoryDropdown ? "rotate-180" : ""
                }`}
            />
          </button>

          {showSubCategoryDropdown && (
            <div className="absolute z-50 mt-1 w-full left-0 bg-white border rounded-lg shadow-md max-h-48 overflow-y-auto">
              {availableSubCategories.map((sub) => (
                <div
                  key={sub}
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setShowSubCategoryDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {sub}
                </div>
              ))}
            </div>
          )}
        </div>
        <select className="border border-orange-300 rounded-lg p-3">
          <option value="">Select Age</option>
          <option>01 – 10 years Kids</option>
          <option>11 – 20 years Teenage</option>
          <option>21 – 45 years Adults</option>
          <option>45 – 60 years Middle Age</option>
          <option>61 – 100 years Senior Citizens</option>
        </select>
        <select className="border border-orange-300 rounded-lg p-3">
          <option value="">Select Belt</option>
          <option>White</option>
          <option>Yellow</option>
          <option>Orange</option>
          <option>Blue</option>
          <option>Brown</option>
          <option>Black</option>
          <option>Green</option>
        </select>
      </div>
      {loadingReport && (
        <div className="mt-6 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 font-semibold text-center animate-pulse">
          Loading student performance data...
        </div>
      )}
      {/* GENERAL METRICS */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-3">General Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Attendance Auto */}
          <div className="border border-orange-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-orange-500">Attendance</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <input
                type="number"
                placeholder="Total Classes"
                className="p-2 border border-orange-300 rounded-lg"
                value={manualAttendance.total}
                onChange={(e) =>
                  setManualAttendance({
                    ...manualAttendance,
                    total: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Present Classes"
                className="p-2 border border-orange-300 rounded-lg"
                value={manualAttendance.present}
                onChange={(e) =>
                  setManualAttendance({
                    ...manualAttendance,
                    present: e.target.value,
                  })
                }
              />

              <input
                readOnly
                className="p-2 border border-orange-300 rounded-lg bg-gray-100"
                value={`Absent: ${manualAttendance.absent}`}
              />

              <input
                readOnly
                className="p-2 border border-orange-300 rounded-lg bg-gray-100"
                value={`Attendance: ${manualAttendance.percent}`}
              />
            </div>
          </div>

          {["focus", "skill", "coach", "fitness", "team", "discipline"].map(
            (key, i) => (
              <div
                key={i}
                className="border border-orange-200 rounded-xl p-4 flex flex-col"
              >
                <p className="text-sm font-semibold text-orange-500">
                  {key.toUpperCase()}
                </p>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full mt-2 p-2 border border-orange-300 rounded-lg"
                  placeholder="Score (1-10)"
                  value={metrics[key]}
                  onChange={(e) => {

                    const val = e.target.value;

                    // allow only numbers 0–10
                    if (val === "" || (Number(val) >= 0 && Number(val) <= 10)) {
                      setMetrics({ ...metrics, [key]: val });
                    }

                  }}
                />
                <input
                  className="w-full mt-2 p-2 border border-orange-300 rounded-lg"
                  placeholder="Add Observation"
                  value={metricObservations[key]}
                  onChange={(e) =>
                    setMetricObservations({
                      ...metricObservations,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* PHYSICAL FITNESS */}
      <div className="mt-6">
        <div
          onClick={() => setShowPhysicalFitness(!showPhysicalFitness)}
          className="bg-slate-800 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-between"
        >
          <span>Physical Fitness</span>
          <span className="text-lg flex items-center">
            {showPhysicalFitness ? "▲" : "▼"}
          </span>
        </div>

        {showPhysicalFitness && (
          <div className="mt-4 space-y-4">
            {["Speed", "Strength", "Flexibility", "Stamina", "Agility"].map(
              (item, i) => (
                <div
                  key={i}
                  className="border border-orange-200 rounded-xl p-4 bg-orange-50"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="font-semibold text-orange-500">{item}</p>
                      <p className="text-xs text-gray-500">
                        Rate 1-10 or add custom value
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Measured Value</p>
                      <input
                        className="w-full mt-2 p-2 border border-orange-300 rounded-lg bg-white"
                        placeholder="Value"
                        value={physicalFitness[item.toLowerCase()]?.value || ""}
                        onChange={(e) =>
                          setPhysicalFitness((prev) => ({
                            ...prev,
                            [item.toLowerCase()]: {
                              ...prev[item.toLowerCase()],
                              value: e.target.value,
                            },
                          }))
                        }
                      />
                      ...
                      <input
                        className="w-full mt-2 p-2 border border-orange-300 rounded-lg bg-white"
                        placeholder="Observation"
                        value={
                          physicalFitness[item.toLowerCase()]?.observation || ""
                        }
                        onChange={(e) =>
                          setPhysicalFitness((prev) => ({
                            ...prev,
                            [item.toLowerCase()]: {
                              ...prev[item.toLowerCase()],
                              observation: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
        <button
          onClick={() => window.history.back()}
          className="text-orange-500 font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={savingReport}
          className={`px-6 py-2 rounded-lg font-semibold w-full sm:w-auto transition-all
    ${savingReport
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
            }
  `}
        >
          {savingReport ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}