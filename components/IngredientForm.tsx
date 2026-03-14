type IngredientFormProps = {
  ingredients: string;
  setIngredients: (value: string) => void;
};

export default function IngredientForm({
  ingredients,
  setIngredients,
}: IngredientFormProps) {
  return (
    <div>
      <label className="block text-sm font-bold uppercase tracking-wider text-[#6F8F7B] mb-3">
        Bahan yang tersedia
      </label>

      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Contoh: telur, sosis, sawi putih, bawang putih"
        className="w-full min-h-[140px] rounded-[24px] border border-[#D8C7A6] bg-[#F4EBDD] px-5 py-4 text-[#3E5F4D] placeholder:text-[#8a978f] focus:outline-none focus:ring-2 focus:ring-[#6F8F7B]"
      />
    </div>
  );
}