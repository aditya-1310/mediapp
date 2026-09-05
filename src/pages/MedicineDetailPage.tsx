import { useLocation, useNavigate, useParams } from "react-router-dom";

type Medicine = {
  id: string;
  set_id?: string;
  effective_time?: string;
  version?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
    substance_name?: string[];
    application_number?: string[];
    product_ndc?: string[];
  };
  active_ingredient?: string[];
  inactive_ingredient?: string[];
  purpose?: string[];
  indications_and_usage?: string[];
  warnings?: string[];
  dosage_and_administration?: string[];
  do_not_use?: string[];
  ask_doctor?: string[];
  ask_doctor_or_pharmacist?: string[];
  when_using?: string[];
  stop_use?: string[];
  pregnancy_or_breast_feeding?: string[];
  keep_out_of_reach_of_children?: string[];
};


function getFirst(items?: string[]) {
  return items?.find((item) => item.trim())?.trim() || "Not available";
}

function getJoined(items?: string[]) {
  const filtered = items?.filter((item) => item.trim()) ?? [];
  return filtered.length ? filtered.join(", ") : "Not available";
}

function getBulletItems(items?: string[]) {
  const text = items?.filter((item) => item.trim()).join(" ") ?? "";

  if (!text) {
    return [];
  }

  if (text.includes("•")) {
    return text
      .split("•")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatEffectiveDate(value?: string) {
  if (!value || value.length !== 8) return "Not available";

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);

  const date = new Date(`${year}-${month}-${day}`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-200 py-3 sm:grid-cols-[180px_1fr]">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-sm text-slate-600">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MedicineDetailPage() {
const navigate = useNavigate();
const location = useLocation();
const { id } = useParams();

const stateMedicine = (location.state as { medicine?: Medicine } | null)?.medicine;

let medicine = stateMedicine;

if (!medicine) {
  const storedMedicine = sessionStorage.getItem("selectedMedicine");

  if (storedMedicine) {
    const parsedMedicine: Medicine = JSON.parse(storedMedicine);

    if (parsedMedicine.id === id) {
      medicine = parsedMedicine;
    }
  }
}
if (!medicine) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back
        </button>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            Medicine Detail
          </h1>
          <p className="mt-3 text-slate-600">No medicine data found.</p>
        </div>
      </div>
    </div>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getActiveIngredientItems(medicine: Medicine) {
  const rawIngredients = medicine.active_ingredient ?? [];
  const substances = medicine.openfda?.substance_name ?? [];
  const combinedText = rawIngredients.join(" ");

  if (substances.length > 0) {
    const items = substances.map((substance) => {
      const regex = new RegExp(
        `${escapeRegExp(substance)}\\s*(\\d+(?:\\.\\d+)?\\s*(?:mg|mcg|g|ml|%))?`,
        "i"
      );

      const match = combinedText.match(regex);

      return {
        name: substance,
        strength: match?.[1] || "",
      };
    });

    const validItems = items.filter((item) => item.name.trim());

    if (validItems.length > 0) {
      return validItems;
    }
  }

  return rawIngredients
    .filter((item) => item.trim())
    .map((item) => ({
      name: item,
      strength: "",
    }));
}


    const inactiveIngredients = getFirst(medicine.inactive_ingredient);
    const effectiveDate = formatEffectiveDate(medicine.effective_time);
    const labelVersion = medicine.version || "Not available";
    const applicationNumber = getJoined(medicine.openfda?.application_number);
    const ndcCode = getJoined(medicine.openfda?.product_ndc);
    const splSetId = medicine.set_id || "Not available";
    const splId = medicine.id || "Not available";

  const brandName = getJoined(medicine.openfda?.brand_name);
  const genericName = getJoined(medicine.openfda?.generic_name);
  const manufacturer = getJoined(medicine.openfda?.manufacturer_name);
  const productType = getJoined(medicine.openfda?.product_type);
  const route = getJoined(medicine.openfda?.route);
  const substanceNames = getJoined(medicine.openfda?.substance_name);

  const purpose = getFirst(medicine.purpose);
  const usage = getFirst(medicine.indications_and_usage);
  const dosage = getFirst(medicine.dosage_and_administration);

  const usageBullets = getBulletItems(medicine.indications_and_usage);
  const activeIngredientItems = getActiveIngredientItems(medicine);


  const safetySections = [
    { title: "Warnings", content: medicine.warnings },
    { title: "Do not use", content: medicine.do_not_use },
    { title: "Ask a doctor before use", content: medicine.ask_doctor },
    {
      title: "Ask a doctor or pharmacist before use",
      content: medicine.ask_doctor_or_pharmacist,
    },
    { title: "When using this product", content: medicine.when_using },
    { title: "Stop use and ask a doctor if", content: medicine.stop_use },
    {
      title: "Pregnancy or breast-feeding",
      content: medicine.pregnancy_or_breast_feeding,
    },
    {
      title: "Keep out of reach of children",
      content: medicine.keep_out_of_reach_of_children,
    },
  ].filter((section) => section.content?.length);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back
        </button>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">{brandName}</h1>
          <p className="mt-2 text-slate-600">{genericName}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {route}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {productType}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            <span className="font-medium text-slate-800">Purpose:</span>{" "}
            {purpose}
          </p>
        </div>

        <div className="mt-6 mb-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Source: US FDA drug label</p>
          <p className="mt-1">
            This data is coming from the openFDA API. It should be displayed for
            information only and not used as medical advice.
          </p>
        </div>

        <SectionCard title="At a glance">
          <InfoRow label="Generic name" value={genericName} />
          <InfoRow label="Active substances" value={substanceNames} />
          <InfoRow label="Route" value={route} />
          <InfoRow label="Product type" value={productType} />
          <InfoRow label="Manufacturer" value={manufacturer} />
          <InfoRow label="Dosage" value={dosage} />
        </SectionCard>

        <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Active ingredients</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {activeIngredientItems.length > 0 ? (
                    activeIngredientItems.map((item, index) => (
                        <div
                        key={`${item.name}-${index}`}
                        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                        >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {item.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Active substance</p>
                            </div>

                            {item.strength && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {item.strength}
                            </span>
                            )}
                        </div>
                        </div>
                    ))
                    ) : (
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-sm text-slate-600">Not available</p>
                    </div>
                    )}
                </div>
            </div>

        <div className="mt-6 grid gap-4">
          <SectionCard title="Uses & indications">
            <p className="text-sm leading-6 text-slate-700">
              <span className="font-medium text-slate-900">Purpose:</span>{" "}
              {purpose}
            </p>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-900">
                Uses / indications
              </p>

              {usageBullets.length > 0 ? (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {usageBullets.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-700">{usage}</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Important safety information">
            <div className="space-y-3">
                {safetySections.map((section) => {
                const bullets = getBulletItems(section.content);
                const text = getFirst(section.content);

                return (
                    <details
                    key={section.title}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                    <summary className="cursor-pointer list-none font-medium text-slate-900">
                        <div className="flex items-center justify-between gap-4">
                        <span>{section.title}</span>
                        <span className="text-slate-500">+</span>
                        </div>
                    </summary>

                    <div className="mt-3">
                        {bullets.length > 0 ? (
                        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                            {bullets.map((item, index) => (
                            <li key={index}>{item}</li>
                            ))}
                        </ul>
                        ) : (
                        <p className="text-sm leading-6 text-slate-700">{text}</p>
                        )}
                    </div>
                    </details>
                );
                })}
            </div>
            </SectionCard>
         
         <SectionCard title="Other ingredients (Inactive)">
            <details className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="cursor-pointer font-medium text-slate-900">
                View inactive ingredients
                </summary>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                {inactiveIngredients}
                </p>
            </details>
            </SectionCard>

            <SectionCard title="Label Information & Source Metadata">
            <p className="text-sm leading-6 text-slate-600">
                This section contains official label and source metadata from the openFDA
                drug label response.
            </p>

            <div className="mt-4">
                <InfoRow label="Product type" value={productType} />
                <InfoRow label="Label effective date" value={effectiveDate} />
                <InfoRow label="Label version" value={labelVersion} />
                <InfoRow label="Application number" value={applicationNumber} />
                <InfoRow label="NDC code" value={ndcCode} />
                <InfoRow label="SPL Set ID" value={splSetId} />
                <InfoRow label="SPL ID" value={splId} />
            </div>
        </SectionCard>

        </div>
      </div>
    </div>
  );
}

export default MedicineDetailPage;
