import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
type Medicine = {
  id: string;
  set_id?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
    substance_name?: string[];
  };
  active_ingredient?: string[];
  purpose?: string[];
  indications_and_usage?: string[];
  warnings?: string[];
  dosage_and_administration?: string[];
};


function SearchPage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);


  const cacheRef = useRef<Record<string, Medicine[]>>({});
  function handleSearchSubmit() {
  if (!query.trim()) return;
  setShowResults(true);
  setIsInputFocused(false);
}
function handleMedicineSelect(medicine: Medicine) {
  sessionStorage.setItem("selectedMedicine", JSON.stringify(medicine));

  navigate(`/medicine/${medicine.id}`, {
    state: { medicine },
  });
}


  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setMedicines([]);
      setLoading(false);
      setError("");
      setHasSearched(false);
      return;
    }

    const normalizedQuery = trimmedQuery.toLowerCase();
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (cacheRef.current[normalizedQuery]) {
        setMedicines(cacheRef.current[normalizedQuery]);
        setError("");
        setHasSearched(true);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const searchValue = `openfda.brand_name:"${trimmedQuery}"`;
        const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(
          searchValue
        )}&limit=20`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setMedicines([]);
          setHasSearched(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }

        const data = await response.json();
        const results = data.results ?? [];

        cacheRef.current[normalizedQuery] = results;
        setMedicines(results);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setMedicines([]);
        setError("Unable to fetch medicines. Please try again.");
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  const suggestions = medicines.slice(0, 5);
  const showSuggestions =
  isInputFocused && query.trim().length > 0 && suggestions.length > 0 && !showResults;


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900">Medicine Search</h1>
        <p className="mt-2 text-slate-600">Search medicines by brand name</p>

       <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="relative">
            <div className="flex gap-3">
            <input
                type="text"
                value={query}
                onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(false);
                }}
                onFocus={() => setIsInputFocused(true)}
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSearchSubmit();
                }
                }}
                placeholder="Search for a medicine like Advil"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
            />

            <button
                type="button"
                onClick={handleSearchSubmit}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
                Search
            </button>
            </div>

            {showSuggestions && (
            <div className="absolute z-10 mt-6 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                {suggestions.map((medicine) => {
                const brandName = medicine.openfda?.brand_name?.[0] || "Not available";
                const genericName =
                    medicine.openfda?.generic_name?.[0] || "Not available";

                return (
                    <button
                    key={medicine.id}
                    type="button"
                    onMouseDown={() => handleMedicineSelect(medicine)}
                    className=" cursor-pointer block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-100"
                    >
                    <p className="text-sm font-medium text-slate-900">{brandName}</p>
                    <p className="mt-1 text-xs text-slate-500">{genericName}</p>
                    </button>
                );
                })}
            </div>
            )}
        </div>
        </div>


        {!query.trim() && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-500">Start typing to search medicines.</p>
          </div>
        )}

        {loading && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-600">Loading medicines...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && hasSearched && showResults && medicines.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-600">No medicines found.</p>
          </div>
        )}

     {!loading && showResults && medicines.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {medicines.map((medicine) => {
            const brandName =
                medicine.openfda?.brand_name?.[0] || "Not available";
            const genericName =
                medicine.openfda?.generic_name?.[0] || "Not available";
            const manufacturer =
                medicine.openfda?.manufacturer_name?.[0] || "Not available";
            const productType =
                medicine.openfda?.product_type?.[0] || "Not available";

                 return (
                    <div
                        key={medicine.id}
                        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                    >
                        <h2 className="text-lg font-semibold text-slate-900">
                        {brandName}
                        </h2>

                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>
                            <span className="font-medium text-slate-800">Generic:</span>{" "}
                            {genericName}
                        </p>
                        <p>
                            <span className="font-medium text-slate-800">Manufacturer:</span>{" "}
                            {manufacturer}
                        </p>
                        <p>
                            <span className="font-medium text-slate-800">Product Type:</span>{" "}
                            {productType}
                        </p>
                        </div>

                        <button
                        type="button"
                        onClick={() => handleMedicineSelect(medicine)}
                        className="cursor-pointer mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                        View details
                        </button>
                    </div>
                    );
            })}
        </div>
        )}

      </div>
    </div>
  );
}

export default SearchPage;
