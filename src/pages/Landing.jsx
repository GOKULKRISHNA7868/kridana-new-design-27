import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
/* ================= DISTANCE ================= */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/* ===================================================== */
/* ================= LANDING PAGE ====================== */
/* ===================================================== */

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("top"); 
  const [instituteMode, setInstituteMode] = useState("top");
  const [trainers, setTrainers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [reels, setReels] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  /* ================= AUTH ================= */

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  /* ================= LOCATION ================= */

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(null)
    );
  }, []);

  /* ================= FETCH TRAINERS + INSTITUTES ================= */

  useEffect(() => {
    const fetchData = async () => {
      const trainerSnap = await getDocs(collection(db, "trainers"));
      const instituteSnap = await getDocs(collection(db, "institutes"));

      setTrainers(
        trainerSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      setInstitutes(
        instituteSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    };

    fetchData();
  }, []);

  /* ================= FETCH REELS ================= */

  useEffect(() => {
    const fetchReels = async () => {
      const trainerSnap = await getDocs(collection(db, "trainers"));
      const instituteSnap = await getDocs(collection(db, "institutes"));

      let all = [];

      trainerSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.reels) {
          data.reels.forEach((video) => {
            all.push({
              id: doc.id,
              videoUrl: video,
              title: data.trainerName || "Trainer Reel",
            });
          });
        }
      });

      instituteSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.reels) {
          data.reels.forEach((video) => {
            all.push({
              id: doc.id,
              videoUrl: video,
              title: data.instituteName || "Institute Reel",
            });
          });
        }
      });

      all = all.sort(() => Math.random() - 0.5);
      setReels(all.slice(0, 4));
    };

    fetchReels();
  }, []);



  return (
   <div className="w-full font-sans">
    
    {/* 3px white line */}
    <div className="w-full h-[5px] bg-white"></div>

      {/* ================================================= */}
      {/* ================= HERO SECTION =================== */}
      {/* ================================================= */}
<section className="bg-black text-white px-6 md:px-20 h-[65vh] flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden">

  {/* TEXT SECTION */}
  <div className="w-full md:w-3/5">

    <h1 className="text-4xl md:text-5xl font-bold leading-[1.35] md:leading-[1.3]">
      Connecting Trainers, Institutes & Learners Through Sports & Growth
    </h1>

    <p className="mt-6 text-gray-300 text-lg max-w-lg">
      Empowering Sports Institutes & Trainers to Manage,
      Grow & Succeed.
    </p>

<div className="mt-8 grid grid-cols-2 gap-6 max-w-2xl">

  <button className="border border-orange-500 px-6 py-3 rounded-md text-orange-500">
    Manage & Engage Seamlessly
  </button>

  <button className="border border-orange-500 px-6 py-3 rounded-md text-orange-500">
    Grow & Scale Your Business
  </button>

  <button className="col-span-2 justify-self-center border border-orange-500 px-6 py-3 rounded-md text-orange-500">
    Create & Showcase Your Profile
  </button>

</div>

  </div>

  {/* IMAGE SECTION */}
  <div className="w-full md:w-2/5 relative flex justify-center items-end">

    {/* Orange Circle */}
    <div className="absolute 
      w-[200px] h-[200px] 
      md:w-[340px] md:h-[340px] 
      bg-orange-500 
      rounded-full 
      right-4">
    </div>

<img
  src="/images/hero.png"
  alt="Hero"
  className="relative z-10 
    h-[60vh] 
    md:h-[80vh] 
    w-auto 
    object-contain
    translate-y-8 md:translate-y-12"
/>

  </div>

</section>

      {/* ================================================= */}
      {/* ================= DOMAINS SECTION ================= */}
      {/* ================================================= */}

{/* ================================================= */}
{/* ================= DOMAINS SECTION ================= */}
{/* ================================================= */}

<section className="px-6 md:px-20 py-16 bg-white">
  <h2 className="text-3xl md:text-4xl font-bold mb-10">
    Categories
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

    {[
      {
        name: "Martial Arts",
        image: "/images/karate.jpeg",
        route: "/services/martial-arts",
      },
      {
        name: "Adventure & Outdoor Sports",
        image: "/images//bungee-jumping.jpeg",
        route: "/services/adventure-outdoor-sports",
      },
      {
        name: "Team Ball Sports",
        image: "/images/team-ball-sports.jpg",
        route: "/services/teamball",
      },
      {
        name: "Fitness",
        image: "/images/fitness.jpg",
        route: "/services/fitness",
      },
      {
        name: "Wellness",
        image: "/images/traditional-therapies.jpeg",
        route: "/services/wellness",
      },
      {
        name: "Target & Precision Sports",
        image: "/images/archery.jpeg",
        route: "/services/target-precision-sports",
      },
      {
        name: "Ice Sports",
        image: "/images/ice-sports.jpg",
        route: "/services/ice-sports",
      },
      {
        name: "Aquatic Sports",
        image: "/images/swimming.jpeg",
        route: "/services/aquatic",
      },
      {
        name: "Dance",
        image: "/images/dance.jpg",
        route: "/services/dance",
      },
      {
        name: "Racket Sports",
        image: "/images/racket-sports.jpg",
        route: "/services/racketsports",
      },
      {
        name: "Equestrian Sports",
        image: "/images/equestrian-sports.jpg",
        route: "/services/equestrian-sports",
      },
    ].map((domain) => (

      <motion.div
        key={domain.name}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          navigate(domain.route);
          window.scrollTo(0, 0);
        }}
        className="bg-white rounded-2xl border border-orange-200 overflow-hidden cursor-pointer
                   transition-all duration-300
                   hover:-translate-y-2
                   hover:shadow-[0_12px_35px_rgba(249,115,22,0.35)]"
      >
        {/* IMAGE */}
        <div className="h-48 overflow-hidden">
          <img
            src={domain.image}
            alt={domain.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* TITLE */}
        <div className="p-5 text-center">
          <h3 className="text-orange-600 font-bold text-lg">
            {domain.name}
          </h3>
        </div>

      </motion.div>

    ))}

  </div>
</section>

      {/* ================================================= */}
      {/* ================= ADS SECTION ==================== */}
      {/* ================================================= */}

      <section className="bg-gray-200 py-20 text-center">
        <h2 className="text-3xl font-bold">
          ADS Section
        </h2>
      </section>

      {/* ================================================= */}
      {/* ================= TOP TRAINERS =================== */}
      {/* ================================================= */}

<section className="px-6 md:px-20 py-16 bg-white">

  {/* Header Row */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

    <h2 className="text-3xl md:text-4xl font-bold">
      Top Trainers
    </h2>

    {/* Filter Buttons */}
    <div className="flex gap-3">

      <button
  onClick={() => setMode("top")}
  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
    mode === "top"
      ? "bg-orange-500 text-white"
      : "border border-orange-500 text-orange-500"
  }`}
>
  ⭐ Top Rated
</button>

<button
  onClick={() => setMode("nearby")}
  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
    mode === "nearby"
      ? "bg-orange-500 text-white"
      : "border border-orange-500 text-orange-500"
  }`}
>
  📍 Near Me
</button>

    </div>
  </div>

  {/* Trainers Grid */}
  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">

    {
  (mode === "top"
    ? [...trainers]
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
: userLocation
  ? trainers
      .filter(
        (t) =>
          t.latitude !== undefined &&
          t.longitude !== undefined &&
          t.latitude !== null &&
          t.longitude !== null
      )
      .map((t) => ({
        ...t,
distance: getDistance(
  userLocation.lat,
  userLocation.lng,
  Number(t.latitude),
  Number(t.longitude)
),
      }))
      .sort((a, b) => a.distance - b.distance)
  : []
  )
    .slice(0, 3)
    .map((t) => (
      <div
        key={t.id}
        className="rounded-xl overflow-hidden border border-orange-400 shadow-sm bg-white"
      >

        {/* Image */}
        <div className="h-72 w-full bg-gray-200 overflow-hidden">
          <img
            src={t.profileImageUrl || "/images/default-avatar.png"}
            alt={t.trainerName}
            className="w-full h-full object-contain bg-gray-100"
          />
        </div>

        {/* Bottom Content */}
        <div className="p-4 flex justify-between items-start">

          {/* Left */}
          <div>
            <h3 className="font-bold text-lg">
              {t.firstName} {t.lastName}
            </h3>

            <p className="text-sm text-gray-500">
               {t.category || "No Category"} – {t.subCategory || "No Subcategory"}
            </p>
            {t.distance && (
  <p className="text-xs text-gray-500 mt-1">
    {t.distance.toFixed(1)} km away
  </p>
)}
          </div>

          {/* Right */}
          <button
            onClick={() => navigate(`/trainers/${t.id}`)}
            className="text-orange-500 font-semibold hover:underline"
          >
            View Profile
          </button>

        </div>

      </div>
    ))}

  </div>

  {/* See More */}
  <div className="text-center mt-10">
    <button
      onClick={() => navigate("/trainers")}
      className="bg-orange-500 text-white px-8 py-3 rounded-md text-lg hover:bg-orange-600 transition"
    >
      See more
    </button>
  </div>

</section>

      {/* ================================================= */}
      {/* ================= TOP INSTITUTES ================= */}
      {/* ================================================= */}

{/* ================================================= */}
{/* ================= TOP INSTITUTES ================= */}
{/* ================================================= */}

<section className="px-6 md:px-20 py-16 bg-gray-50">

  {/* Header + Filters */}
  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
    
    <h2 className="text-3xl md:text-4xl font-bold">
      Top Institutes
    </h2>

    <div className="flex gap-3">

      <button
        onClick={() => setInstituteMode("top")}
        className={`px-4 py-2 rounded-md ${
          instituteMode === "top"
            ? "bg-orange-500 text-white"
            : "border border-orange-500 text-orange-500"
        }`}
      >
        ⭐ Top Rated
      </button>

      <button
        onClick={() => setInstituteMode("nearby")}
        className={`px-4 py-2 rounded-md ${
          instituteMode === "nearby"
            ? "bg-orange-500 text-white"
            : "border border-orange-500 text-orange-500"
        }`}
      >
        📍 Near Me
      </button>

    </div>
  </div>

  {/* Institutes Grid */}
  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">

    {(instituteMode === "top"
      ? [...institutes].sort(
          (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
        )

      : userLocation
        ? institutes
            .filter(
              (i) =>
                i.latitude !== undefined &&
                i.longitude !== undefined &&
                i.latitude !== null &&
                i.longitude !== null
            )
            .map((i) => ({
              ...i,
              distance: getDistance(
                userLocation.lat,
                userLocation.lng,
                Number(i.latitude),
                Number(i.longitude)
              ),
            }))
            .sort((a, b) => a.distance - b.distance)

        : []
    )
      .slice(0, 3)
      .map((i) => (

        <div
          key={i.id}
          className="bg-white rounded-2xl overflow-hidden shadow-md border border-orange-400 hover:shadow-xl transition"
        >

          {/* Image */}
          <div className="h-64 w-full overflow-hidden">
           <img
  src={
    i.profileImageUrl && !i.profileImageUrl.endsWith(".mp4")
      ? i.profileImageUrl
      : "/images/default-institute.png"
  }
  alt={i.instituteName}
  className="w-full h-full object-contain bg-gray-100"
/>
          </div>

          {/* Content */}
          <div className="p-4 flex justify-between items-start">

            {/* Left Side */}
            <div>
              <h3 className="font-bold text-lg">
                {i.instituteName}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                📍 {i.city || "Unknown"}, {i.state || ""}
              </p>

              {i.distance && (
                <p className="text-xs text-gray-500 mt-1">
                  {i.distance.toFixed(1)} km away
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {i.category && (
                  <span className="px-3 py-1 text-xs border border-orange-400 text-orange-500 rounded-full">
                    {i.category}
                  </span>
                )}
                {i.subCategory && (
                  <span className="px-3 py-1 text-xs border border-orange-400 text-orange-500 rounded-full">
                    {i.subCategory}
                  </span>
                )}
              </div>
            </div>

            {/* Right Side Button */}
            <button
              onClick={() => navigate(`/institutes/${i.id}`)}
              className="text-orange-500 font-semibold hover:underline"
            >
              View Profile
            </button>

          </div>

        </div>
      ))}

  </div>

  {/* See More Button */}
  <div className="flex justify-center mt-10">
    <button
      onClick={() => navigate("/institutes")}
      className="bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition"
    >
      See More
    </button>
  </div>

</section>
      {/* ================================================= */}
      {/* ================= SPOTLIGHT REELS ================ */}
      {/* ================================================= */}
<section className="px-6 md:px-20 py-16 bg-white">
        <h2 className="text-2xl font-semibold mb-6">Spotlight Reels</h2>

        <div className="flex gap-6 overflow-x-auto">
          {reels.slice(0, 3).map((r, index) => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                navigate("/reels", {
                  state: {
                    clickedReel: r,
                  },
                });
              }}
              className="min-w-[230px] h-[420px] rounded-3xl overflow-hidden shadow-xl cursor-pointer bg-black relative"
            >
              <video
                src={r.videoUrl}
                className="w-full h-full object-cover"
                muted
              />

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-semibold text-sm">
                  {r.title || "Training Reel"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;