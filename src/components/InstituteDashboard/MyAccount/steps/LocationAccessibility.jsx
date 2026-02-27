import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../../context/AuthContext";

const LocationAccessibility = ({ setStep }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullAddress: "",
    landmark: "",
    distance: "",
    contactNumber: "",
    email: "",
    website: "",
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
        // 🔥 Dynamic institute
        const instituteId = user.uid;
        const docRef = doc(db, "institutes", instituteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          const addressParts = [
            data.street,
            data.building,
            data.city,
            data.district,
            data.state,
            data.zipCode,
            data.country,
          ].filter(Boolean);

          setFormData({
            fullAddress: addressParts.join(", "),
            landmark: data.landmark || "",
            distance: "", // keep empty / auto later
            contactNumber: data.phoneNumber || "",
            email: data.email || "",
            website: data.websiteLink || "",
          });
        } else {
          // no doc → empty
          setFormData({
            fullAddress: "",
            landmark: "",
            distance: "",
            contactNumber: "",
            email: "",
            website: "",
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

    const requiredFields = [
      "fullAddress",
      "landmark",
      "distance",
      "contactNumber",
      "email",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];

      if (!value || String(value).trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Email format validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter valid email address";
      }
    }

    // Contact number validation (10 digits example)
    if (formData.contactNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.contactNumber)) {
        newErrors.contactNumber = "Enter valid 10 digit number";
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

      // 🔥 Dynamic institute
      const instituteId = user.uid;
      const docRef = doc(db, "institutes", instituteId);

      await setDoc(
        docRef,
        {
          street: formData.fullAddress, // storing full address string
          landmark: formData.landmark,
          phoneNumber: formData.contactNumber,
          email: formData.email,
          websiteLink: formData.website,
          updatedAt: serverTimestamp(),
        },
        { merge: true }, // ✅ keeps other fields safe
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
      fullAddress: "",
      landmark: "",
      distance: "",
      contactNumber: "",
      email: "",
      website: "",
    });

    setErrors({});
  };

  const inputClass = (field) =>
    `border ${
      errors[field] ? "border-red-500" : "border-gray-300"
    } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500`;

  return (
    <div className="w-full">
      {/* BACK */}
      <div
        onClick={() => setStep(1)}
        className="flex items-center gap-2 text-orange-600 font-medium mb-4 cursor-pointer"
      >
        ← Back
      </div>

      <div className="border-b border-gray-300 mb-6"></div>

      {/* TITLE */}
      <h2 className="text-orange-500 font-semibold text-lg sm:text-xl mb-6">
        Location & Accessibility
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Full Address */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="fullAddress"
            value={formData.fullAddress}
            onChange={handleChange}
            rows={4}
            className={`${inputClass("fullAddress")} resize-none`}
          />
          {errors.fullAddress && (
            <span className="text-red-500 text-sm mt-1">
              {errors.fullAddress}
            </span>
          )}
        </div>

        {[
          { label: "Land Mark", name: "landmark" },
          { label: "Distance From User (Auto)", name: "distance" },
          { label: "Contact Number", name: "contactNumber" },
          { label: "E-mail Address", name: "email" },
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

        {/* Website */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium mb-2">
            Website / Social Media Links
          </label>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={inputClass("website")}
          />
          {errors.website && (
            <span className="text-red-500 text-sm mt-1">{errors.website}</span>
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
        <button
          onClick={handleCancel}
          className="text-orange-600 font-medium hover:text-black transition"
        >
          Cancel
        </button>

        <button
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

export default LocationAccessibility;
