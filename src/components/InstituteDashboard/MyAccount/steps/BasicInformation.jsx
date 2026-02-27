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
        // 🔥 Dynamic instituteId
        const instituteId = user.uid;

        const docRef = doc(db, "institutes", instituteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFormData({
            institutionName: data.instituteName || "",
            establishedYear: data.yearFounded || "",
            type: data.organizationType || "",
            logo: data.profileImageUrl || "",
            sports: data?.categories?.category || "",
            headCoach: data.founderName || "",
            tagline: data.designation || "",
            about: data.description || "",
          });
        } else {
          // No institute doc → keep empty
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
        }
      } catch (error) {
        console.error("Error loading institute data:", error);
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

      // 🔥 Dynamic instituteId
      const instituteId = user.uid;
      const docRef = doc(db, "institutes", instituteId);

      await setDoc(
        docRef,
        {
          instituteName: formData.institutionName,
          yearFounded: formData.establishedYear,
          organizationType: formData.type,
          profileImageUrl: formData.logo,
          categories: {
            category: formData.sports,
          },
          founderName: formData.headCoach,
          designation: formData.tagline,
          description: formData.about,
          updatedAt: serverTimestamp(),
        },
        { merge: true }, // ✅ keeps existing fields safe
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
          { label: "Institution / Academy Name", name: "institutionName" },
          { label: "Established Year", name: "establishedYear" },
          { label: "Type (Institution / Independent Trainer)", name: "type" },
          { label: "Logo / Cover / Banner Images", name: "logo" },
          { label: "Sports (offered)", name: "sports" },
          { label: "Head Coach Name", name: "headCoach" },
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
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium mb-2">
            Short Tag Line (1 line preferred){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            className={inputClass("tagline")}
          />
          {errors.tagline && (
            <span className="text-red-500 text-sm mt-1">{errors.tagline}</span>
          )}
        </div>

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
