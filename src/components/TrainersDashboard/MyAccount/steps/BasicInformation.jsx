import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../../context/AuthContext";

const BasicInformation = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    institutionName: "",
    establishedYear: "",
    type: "",
    logo: "",
    sports: "",
    headCoach: "",
    tagline: "",
    about: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ LOAD EXISTING DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "trainers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFormData({
            institutionName: data.institutionName || "",
            establishedYear: data.establishedYear
              ? String(data.establishedYear)
              : "",
            type: data.type || "",
            logo: data.logo || "",
            sports: data.sports || "",
            headCoach: data.headCoach || "",
            tagline: data.tagline || "",
            about: data.about || "",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ✅ VALIDATION
  const validate = () => {
    let newErrors = {};

    // Required fields list
    const requiredFields = [
      "institutionName",
      "establishedYear",
      "type",
      "logo",
      "sports",
      "headCoach",
      "tagline",
      "about",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];

      if (!value || String(value).trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Year validation
    const year = String(formData.establishedYear || "").trim();
    const currentYear = new Date().getFullYear();

    if (year) {
      if (!/^\d{4}$/.test(year)) {
        newErrors.establishedYear = "Enter valid 4 digit year";
      } else if (parseInt(year) > currentYear) {
        newErrors.establishedYear = "Year cannot be in the future";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ✅ SAVE
  const handleSave = async () => {
    console.log("Save button clicked");

    if (!user?.uid) {
      alert("User not logged in");
      return;
    }

    const isValid = validate();

    if (!isValid) {
      alert("Please fill all required details correctly.");
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "trainers", user.uid),
        {
          ...formData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }, // keeps existing trainer data safe
      );

      alert("Saved Successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  const handleCancel = () => {
    setFormData({
      institutionName: "",
      establishedYear: "",
      type: "",
      logo: "",
      sports: "",
      headCoach: "",
      tagline: "",
      about: "",
    });

    setErrors({});
  };

  const inputClass = (field) =>
    `border ${
      errors[field] ? "border-red-500" : "border-gray-300"
    } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500`;

  return (
    <div className="w-full">
      <h2 className="text-orange-500 font-semibold text-lg sm:text-xl mb-6">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: "Trainer Name", name: "trainerName" },

          { label: "Type (Institution / Independent Trainer)", name: "type" },
          { label: "Logo / Cover / Banner Images", name: "logo" },
          { label: "Sports (offered)", name: "sports" },
          { label: "Head Coach Name", name: "headCoach" },

          // 🔥 ADD THIS HERE
          { label: "Short Tag Line (1 line preferred)", name: "tagline" },
        ].map((field) => (
          <div className="flex flex-col" key={field.name}>
            <label className="text-sm font-medium mb-2">
              {field.label} <span className="text-red-500">*</span>
            </label>
            <input
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className={inputClass(field.name)}
            />
            {errors[field.name] && (
              <span className="text-red-500 text-sm mt-1">
                {errors[field.name]}
              </span>
            )}
          </div>
        ))}

        {/* Tagline */}

        {/* About */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium mb-2">
            About Us (Detailed Description)
            <span className="text-red-500">*</span>
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={5}
            className={inputClass("about")}
          />
          {errors.about && (
            <span className="text-red-500 text-sm mt-1">{errors.about}</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-600 hover:text-black transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default BasicInformation;
