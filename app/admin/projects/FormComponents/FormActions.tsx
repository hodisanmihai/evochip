"use client";

const FormActions = ({
  saving,
  disabled,
  onClose,
}: {
  saving: boolean;
  disabled: boolean;
  onClose: () => void;
}) => (
  <div className="flex flex-col gap-2 mt-2">
    <button
      type="submit"
      disabled={disabled}
      className="bg-green-600 md:bg-transparent md:border md:border-green-600 md:hover:bg-green-600 text-white font-bold py-2 rounded-md transition disabled:opacity-50"
    >
      {saving ? "Se salveaza..." : "Salveaza"}
    </button>
    <button
      type="button"
      onClick={onClose}
      className="bg-red-600 md:bg-transparent md:border md:border-red-600 md:hover:bg-red-600 text-white font-bold py-2 rounded-md transition"
    >
      Renunta
    </button>
  </div>
);

export default FormActions;
