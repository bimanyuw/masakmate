type FeatureSelectorProps = {
  selectedFeature: string;
  setSelectedFeature: (feature: string) => void;
};

export default function FeatureSelector({
  selectedFeature,
  setSelectedFeature,
}: FeatureSelectorProps) {
  const features = [
    { id: "ingredients", label: "Masak dari Bahan" },
    { id: "budget", label: "Masak Hemat" },
    { id: "mood", label: "Masak Sesuai Mood" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3 justify-center mb-8">
      {features.map((feature) => (
        <button
          key={feature.id}
          type="button"
          onClick={() => setSelectedFeature(feature.id)}
          className={`cursor-pointer px-5 py-3 rounded-2xl font-medium transition ${
            selectedFeature === feature.id
              ? "bg-[#6F8F7B] text-white shadow-sm"
              : "bg-[#FFFaf3] text-[#3E5F4D] border border-[#AFC8B4] hover:bg-[#F4EBDD]"
          }`}
        >
          {feature.label}
        </button>
      ))}
    </div>
  );
}