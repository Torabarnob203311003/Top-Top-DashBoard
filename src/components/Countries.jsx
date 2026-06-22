import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Loader, Plus, RefreshCw, Save, Trash2, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "/api/v1";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createEmptyCity = (id = 1) => ({
  id,
  city: "",
  slug: "",
  areas: [""],
});

const emptyForm = {
  countryCode: "",
  name: "",
  dialCode: "",
  currencyCode: "",
  merchantCountryCode: "",
  fixedTransactionFee: "",
  isActive: true,
  cities: [],
};

function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.countryCode === selectedCode),
    [countries, selectedCode]
  );

  const headers = (json = true) => {
    const token = localStorage.getItem("accessToken");
    return {
      ...(json && { "Content-Type": "application/json" }),
      ...(token && { Authorization: token }),
    };
  };

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/countries?includeInactive=true`, {
        headers: headers(false),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load countries");
      }
      setCountries(result.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setForm(emptyForm);
      return;
    }

    setForm({
      countryCode: selectedCountry.countryCode || "",
      name: selectedCountry.name || "",
      dialCode: selectedCountry.dialCode || "",
      currencyCode: selectedCountry.currencyCode || "",
      merchantCountryCode: selectedCountry.merchantCountryCode || selectedCountry.countryCode || "",
      fixedTransactionFee: selectedCountry.fixedTransactionFee ?? 0,
      isActive: Boolean(selectedCountry.isActive),
      cities: (selectedCountry.cities || []).map((city, index) => ({
        id: city.id || index + 1,
        city: city.city || "",
        slug: city.slug || slugify(city.city || ""),
        areas: city.areas?.length ? city.areas : [""],
      })),
    });
  }, [selectedCountry]);

  const startNew = () => {
    setSelectedCode(null);
    setForm(emptyForm);
  };

  const updateCity = (cityIndex, updates) => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: currentForm.cities.map((city, index) =>
        index === cityIndex ? { ...city, ...updates } : city
      ),
    }));
  };

  const updateCityName = (cityIndex, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: currentForm.cities.map((city, index) => {
        if (index !== cityIndex) return city;
        const currentAutoSlug = slugify(city.city || "");
        const shouldUpdateSlug = !city.slug || city.slug === currentAutoSlug;
        return {
          ...city,
          city: value,
          slug: shouldUpdateSlug ? slugify(value) : city.slug,
        };
      }),
    }));
  };

  const addCity = () => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: [...currentForm.cities, createEmptyCity(currentForm.cities.length + 1)],
    }));
  };

  const removeCity = (cityIndex) => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: currentForm.cities
        .filter((_, index) => index !== cityIndex)
        .map((city, index) => ({ ...city, id: index + 1 })),
    }));
  };

  const addArea = (cityIndex) => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: currentForm.cities.map((city, index) =>
        index === cityIndex ? { ...city, areas: [...city.areas, ""] } : city
      ),
    }));
  };

  const updateArea = (cityIndex, areaIndex, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: currentForm.cities.map((city, index) =>
        index === cityIndex
          ? {
              ...city,
              areas: city.areas.map((area, currentAreaIndex) =>
                currentAreaIndex === areaIndex ? value : area
              ),
            }
          : city
      ),
    }));
  };

  const removeArea = (cityIndex, areaIndex) => {
    setForm((currentForm) => ({
      ...currentForm,
      cities: currentForm.cities.map((city, index) =>
        index === cityIndex
          ? {
              ...city,
              areas: city.areas.filter((_, currentAreaIndex) => currentAreaIndex !== areaIndex),
            }
          : city
      ),
    }));
  };

  const buildCitiesPayload = () => {
    return form.cities.map((city, index) => {
      const cityName = city.city.trim();
      const slug = (city.slug || slugify(cityName)).trim().toLowerCase();

      if (!cityName) {
        throw new Error(`City ${index + 1} needs a name`);
      }
      if (!slug) {
        throw new Error(`City ${index + 1} needs a slug`);
      }

      return {
        id: index + 1,
        city: cityName,
        slug,
        areas: city.areas.map((area) => area.trim()).filter(Boolean),
      };
    });
  };

  const duplicateCitySlug = useMemo(() => {
    const slugs = form.cities.map((city) => city.slug || slugify(city.city || "")).filter(Boolean);
    return slugs.find((slug, index) => slugs.indexOf(slug) !== index);
  }, [form.cities]);

  const duplicateCityName = useMemo(() => {
    const names = form.cities.map((city) => city.city.trim().toLowerCase()).filter(Boolean);
    return names.find((name, index) => names.indexOf(name) !== index);
  }, [form.cities]);

  const hasEmptyCity = form.cities.some((city) => !city.city.trim());

  const citySummary = useMemo(() => {
    const areaCount = form.cities.reduce(
      (total, city) => total + city.areas.filter((area) => area.trim()).length,
      0
    );
    return `${form.cities.length} ${form.cities.length === 1 ? "city" : "cities"} / ${areaCount} ${areaCount === 1 ? "area" : "areas"}`;
  }, [form.cities]);

  const saveDisabled = saving || Boolean(duplicateCitySlug) || Boolean(duplicateCityName) || hasEmptyCity;

  const cityEditorNotice = (() => {
    if (duplicateCityName) return "City names must be unique";
    if (duplicateCitySlug) return "City slugs must be unique";
    if (hasEmptyCity) return "Finish each city name before saving";
    return "";
  })();

  const emptyCities = form.cities.length === 0;

  const addFirstCity = () => {
    if (emptyCities) {
      setForm((currentForm) => ({ ...currentForm, cities: [createEmptyCity()] }));
    }
  };

  const saveCountry = async () => {
    try {
      setSaving(true);
      const cities = buildCitiesPayload();
      const payload = {
        countryCode: form.countryCode.trim().toUpperCase(),
        name: form.name.trim(),
        dialCode: form.dialCode.trim(),
        currencyCode: form.currencyCode.trim().toUpperCase(),
        merchantCountryCode: (form.merchantCountryCode || form.countryCode).trim().toUpperCase(),
        isActive: form.isActive,
        cities,
      };
      const fixedTransactionFee = Number(form.fixedTransactionFee || 0);
      if (!Number.isFinite(fixedTransactionFee) || fixedTransactionFee < 0) {
        throw new Error("Fixed transaction fee must be a non-negative number");
      }

      const isEditing = Boolean(selectedCode);
      const response = await fetch(
        isEditing ? `${API_BASE}/countries/${selectedCode}` : `${API_BASE}/countries`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save country");
      }
      const savedCountryCode = result.data?.countryCode || payload.countryCode;
      const feeResponse = await fetch(`${API_BASE}/transaction-fees/countries/${savedCountryCode}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ fixedTransactionFee }),
      });
      const feeResult = await feeResponse.json();
      if (!feeResponse.ok || !feeResult.success) {
        throw new Error(feeResult.message || "Failed to save fixed transaction fee");
      }
      toast.success(isEditing ? "Country updated" : "Country added");
      setSelectedCode(savedCountryCode);
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to save country");
    } finally {
      setSaving(false);
    }
  };

  const setCountryActive = async (countryCode, isActive) => {
    try {
      const response = await fetch(`${API_BASE}/countries/${countryCode}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ isActive }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update country");
      }
      toast.success(isActive ? "Country restored" : "Country paused");
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to update country");
    }
  };

  const removeCountry = async (countryCode) => {
    if (!window.confirm(`Remove ${countryCode} from active countries?`)) return;
    try {
      const response = await fetch(`${API_BASE}/countries/${countryCode}`, {
        method: "DELETE",
        headers: headers(false),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to remove country");
      }
      toast.success("Country removed");
      fetchCountries();
    } catch (error) {
      toast.error(error.message || "Failed to remove country");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Countries</h1>
            <p className="text-sm text-gray-500">{countries.length} operating records</p>
          </div>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {countries.map((country) => (
            <button
              key={country.countryCode}
              onClick={() => setSelectedCode(country.countryCode)}
              className={`w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 ${selectedCode === country.countryCode ? "bg-green-50" : ""}`}
            >
              <div>
                <div className="font-semibold text-gray-900">{country.name}</div>
                <div className="text-sm text-gray-500">
                  {country.countryCode} / {country.dialCode} / {country.currencyCode}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${country.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {country.isActive ? "Active" : "Inactive"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCode ? `Edit ${selectedCode}` : "Add Country"}
            </h2>
            <p className="text-sm text-gray-500">{citySummary}</p>
          </div>
          {selectedCountry && (
            <div className="flex gap-2">
              <button
                onClick={() => setCountryActive(selectedCountry.countryCode, !selectedCountry.isActive)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
              >
                {selectedCountry.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {selectedCountry.isActive ? "Pause" : "Restore"}
              </button>
              <button
                onClick={() => removeCountry(selectedCountry.countryCode)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="ISO code, e.g. AE" value={form.countryCode} disabled={Boolean(selectedCode)} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Country name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Dial code, e.g. +971" value={form.dialCode} onChange={(e) => setForm({ ...form, dialCode: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Currency, e.g. AED" value={form.currencyCode} onChange={(e) => setForm({ ...form, currencyCode: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Merchant country, e.g. AE" value={form.merchantCountryCode} onChange={(e) => setForm({ ...form, merchantCountryCode: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2" type="number" min="0" step="0.01" placeholder="Fixed transaction fee" value={form.fixedTransactionFee} onChange={(e) => setForm({ ...form, fixedTransactionFee: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
        </div>

        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">Cities and Areas</h3>
              {cityEditorNotice && <p className="text-sm text-red-600">{cityEditorNotice}</p>}
            </div>
            <button
              onClick={addCity}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              City
            </button>
          </div>

          {emptyCities ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">No cities added</p>
              <button
                onClick={addFirstCity}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                Add City
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {form.cities.map((city, cityIndex) => (
                <div key={cityIndex} className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,44px] gap-3">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="City name, e.g. Dubai"
                      value={city.city}
                      onChange={(e) => updateCityName(cityIndex, e.target.value)}
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Slug, e.g. dubai"
                      value={city.slug}
                      onChange={(e) => updateCity(cityIndex, { slug: slugify(e.target.value) })}
                    />
                    <button
                      onClick={() => removeCity(cityIndex)}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      aria-label="Remove city"
                      title="Remove city"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-700">Areas</p>
                      <button
                        onClick={() => addArea(cityIndex)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                        Area
                      </button>
                    </div>

                    {city.areas.length === 0 ? (
                      <p className="text-sm text-gray-400">No areas added</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {city.areas.map((area, areaIndex) => (
                          <div key={areaIndex} className="flex items-center gap-2">
                            <input
                              className="min-w-0 flex-1 border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Area name"
                              value={area}
                              onChange={(e) => updateArea(cityIndex, areaIndex, e.target.value)}
                            />
                            <button
                              onClick={() => removeArea(cityIndex, areaIndex)}
                              className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                              aria-label="Remove area"
                              title="Remove area"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveCountry}
            disabled={saveDisabled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-60"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button
            onClick={fetchCountries}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </section>
    </div>
  );
}

export default Countries;
