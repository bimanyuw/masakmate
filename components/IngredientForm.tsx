type IngredientFormProps = {
  ingredients: string;
  setIngredients: (value: string) => void;
};

export default function IngredientForm({
  ingredients,
  setIngredients,
}: IngredientFormProps) {
  return (
    <div className="bg-[#FFFaf3] rounded-2xl shadow-md p-6 max-w-xl mx-auto border border-[#D8C7A6]">
      <label className="block text-sm font-medium text-[#3E5F4D] mb-2">
        Tulis bahan yang kamu punya
      </label>

      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Contoh: telur, sosis, sawi putih"
        className="w-full border border-[#AFC8B4] rounded-xl p-3 min-h-[120px] bg-white text-[#3E5F4D] placeholder:text-[#9AA9A0] focus:outline-none focus:ring-2 focus:ring-[#6F8F7B]"
      />
    </div>
  );
}